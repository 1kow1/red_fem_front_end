// components/DataFrame.jsx
import Table from "./Table"
import Searchbar from "./Searchbar"
import { ButtonPrimary } from "./Button"
import { AddIcon } from "./Icons"
import { useState, useEffect } from "react"

function Tag({ children, isSelected, onClick }) {
  return <span
    className={`mr-2 border-2 rounded-lg p-1 inline-block
      ${isSelected ? (
        `bg-redfemActionPink border-redfemActionPink text-white
        hover:bg-redfemDarkPink`
      ) : (
        `bg-redfemHoverPink border-redfemVariantPink text-redfemDarkPink
        hover:bg-redfemVariantPink/30`
      )}
      cursor-pointer
    `}
    onClick={onClick}
  >
    {children}
  </span>
}

export default function DataFrame({
  title = "",
  avaiableFilters,
  data,
  dataType,
  formFields,
  // callbacks controlados pela página
  onAddRow,     // chamado quando clicar em "Adicionar"
  onEditRow,    // repassado ao Table/Details
  onToggleRow,
  onAssociarFormulario,
  callbacks,   // callbacks adicionais
  searchQuery,
  setSearchQuery,
  fetchData
}) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    let newFilteredData = data;

    Object.keys(filters).forEach((key) => {
      const filterType = avaiableFilters.find(f => f.name === key).type
      const filterValues = filters[key];

      if (filterType === "date") {
        if (filterValues.start || filterValues.end) {
          newFilteredData = newFilteredData.filter(item => {
            const date = item["dataHora"].split(" ")[0]
            console.log("date:", date.split("/"))
            const itemDate = new Date(
              date.split("/")[2] + "-" +
              date.split("/")[1] + "-" +
              date.split("/")[0],
            )
            const startDate = new Date(filterValues.start);
            const endDate = new Date(filterValues.end);

            if (filterValues.start && filterValues.end) {
              return itemDate >= startDate && itemDate <= endDate;
            }
            else if (filterValues.start) {
              return itemDate >= startDate;
            } 
            else if (filterValues.end) {
              return itemDate <= endDate;
            }
          });
        }
      }
      else {
        if (filterValues && filterValues.length > 0) {
          newFilteredData = newFilteredData.filter(item =>
            filterValues.includes(
              filterType === "select"
                ? item[key].toUpperCase()
                : item[key]
            )
          );
        }
      }
    });

    setFilteredData(newFilteredData);
  }, [data, filters]);

  return (
    <>
      <div>
        <div className="flex flex-row gap-2">
          <Searchbar
            placeholder={`${title.toLowerCase()}...`}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fetchData={fetchData}
            onClickFilter={() => setIsFilterOpen(!isFilterOpen)}
          />
          <ButtonPrimary onClick={() => onAddRow?.()}>
            <AddIcon />
            Adicionar {title}
          </ButtonPrimary>
        </div>

        {isFilterOpen && (
          <div className="px-8 pt-4 shadow-md border-2 rounded-lg">
            <p className="font-bold mb-4">Filtros:</p>
            <div>
              {avaiableFilters.map((filter) => (
                <div key={filter.name} className="flex flex-row gap-8 mb-4 items-center">
                  <p>
                    {filter.label}:
                  </p>
                  {["select", "boolean"].includes(filter.type) &&
                    <div className="flex flex-row">
                      {filter.options.map((option) => (
                        <Tag
                          key={option.value}
                          isSelected={
                            filters[filter.name]
                              ? filters[filter.name].includes(option.value)
                              : false
                          }
                          onClick={() => {
                            const newFilters = { ...filters };
                            if (!newFilters[filter.name]) {
                              newFilters[filter.name] = [];
                            }
                            if (newFilters[filter.name].includes(option.value)) {
                              console.log("Removendo filtro:", option.value);
                              newFilters[filter.name] = newFilters[filter.name].filter(v => v !== option.value);
                            }
                            else {
                              console.log("Adicionando filtro:", option.value);
                              newFilters[filter.name] = [...(newFilters[filter.name] || []), option.value];
                            }
                            console.log("Novos filtros:", newFilters);
                            setFilters(newFilters);
                          }}
                        >
                          {option.label}
                        </Tag>
                      ))}
                    </div>
                  }
                  {filter.type === "date" &&
                    <div>
                      <span className="mr-2">
                        desde:
                      </span>
                      <input
                        type="date"
                        className="w-fit border-2 rounded-lg p-1 outline-redfemVariantPink"
                        onChange={(e) => {
                          const newFilters = { ...filters };
                          if (!newFilters[filter.name]) {
                            newFilters[filter.name] = { start: "", end: "" };
                          }
                          if (e.target.value) {
                            newFilters[filter.name].start = e.target.value;
                          } else {
                            delete newFilters[filter.name].start;
                          }
                          setFilters(newFilters);
                        }}
                        value={filters[filter.name] ? filters[filter.name].start : ""}
                      />
                      <span className="mx-2">
                        até:
                      </span>
                      <input
                        type="date"
                        className="border-2 rounded-lg p-1 outline-redfemVariantPink"
                        onChange={(e) => {
                          const newFilters = { ...filters };
                          if (!newFilters[filter.name]) {
                            newFilters[filter.name] = { start: null, end: null };
                          }
                          if (e.target.value) {
                            newFilters[filter.name].end = e.target.value;
                          } else {
                            delete newFilters[filter.name].end;
                          }
                          setFilters(newFilters);
                        }}
                        value={filters[filter.name] ? filters[filter.name].end : ""}
                      />
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        <Table
          data={filteredData}
          dataType={dataType}
          className="mt-4"
          onEditRow={onEditRow}
          onToggleRow={onToggleRow}
          formFields={formFields}
          onAssociarFormulario={onAssociarFormulario}
          callbacks={callbacks}
        />
      </div>
    </>
  )
}