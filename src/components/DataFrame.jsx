// components/DataFrame.jsx
import Table from "./Table"
import Searchbar from "./Searchbar"
import { ButtonPrimary } from "./Button"
import { AddIcon } from "./Icons"
import { useState, useEffect } from "react"

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
  searchQuery,
  setSearchQuery,
  fetchData
}) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    let filtered = data;
    Object.entries(filters).forEach(([filterName, filterValues]) => {
      if (filterValues.length > 0) {
        filtered = filtered.filter((item) => {
          const itemValues = item[filterName] || [];
          return filterValues.some((value) => itemValues.includes(value));
        });
      }
    });
    setFilteredData(filtered);
  }, [filters, data]);

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
              {Object.entries(avaiableFilters).map(([filterName, filterOptions]) => (
                <div key={filterName} className="flex flex-row gap-8 mb-4 items-center">
                  <p>
                    {filterName.charAt(0).toUpperCase() + filterName.slice(1).replaceAll("_", " ")}:
                  </p>
                  <div className="flex flex-row">
                    {
                      filterOptions.map((option) => (
                        <div key={option} className="flex flex-row items-center">
                          <input
                            id={`filter-${filterName}-${option}`}
                            type="checkbox"
                            value={option}
                            onChange={(e) => {
                              const newFilters = { ...filters };
                              if (e.target.checked) {
                                if (newFilters[filterName]) {
                                  newFilters[filterName].push(option);
                                } else {
                                  newFilters[filterName] = [option];
                                }
                              } else {
                                newFilters[filterName] = newFilters[filterName].filter((o) => o !== option);
                              }
                              setFilters(newFilters);
                              console.log(newFilters);
                            }}
                            className="hidden"
                          />
                          <label
                            className={`mr-2 border-2 rounded-lg p-1 inline-block
                              ${ filters[filterName]?.includes(option) ? (
                                `bg-redfemActionPink border-redfemActionPink text-white
                                hover:bg-redfemDarkPink`
                              ) : (
                                `bg-redfemHoverPink border-redfemVariantPink text-redfemDarkPink
                                hover:bg-redfemVariantPink/30`
                              )}
                            `}
                            htmlFor={`filter-${filterName}-${option}`}
                          >
                            {option}
                          </label>
                        </div>
                      ))
                    }
                  </div>
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
        />
      </div>
    </>
  )
}
