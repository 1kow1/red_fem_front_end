// components/DataFrame.jsx
import Table from "./Table"
import Searchbar from "./Searchbar"
import { ButtonPrimary } from "./Button"
import { AddIcon } from "./Icons"
import { useState, useEffect, useCallback } from "react"

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
  onChangePassword, // callback para alterar senha
  onAssociarFormulario,
  callbacks,   // callbacks adicionais
  searchQuery,
  setSearchQuery,
  fetchData,
  useBackendFilters = true, // nova prop para usar filtros do backend
  defaultFilters = {} // nova prop para filtros padrão
}) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState(defaultFilters);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Função para aplicar filtros via backend
  const applyBackendFilters = useCallback(() => {
    if (!useBackendFilters || !fetchData) {
      return;
    }

    // Converter filtros do frontend para o formato do backend
    const backendFilters = {};

    Object.keys(filters).forEach((key) => {
      const filter = avaiableFilters.find(f => f.name === key);
      if (!filter) return;

      const filterValues = filters[key];

      if (filter.type === "date" && filterValues) {
        // Mapear nomes de data conforme documentação
        if (key === "data") {
          if (filterValues[0]) backendFilters.dataInicio = filterValues[0];
          if (filterValues[1]) backendFilters.dataFim = filterValues[1];
        } else {
          if (filterValues[0]) backendFilters[`${key}Inicio`] = filterValues[0];
          if (filterValues[1]) backendFilters[`${key}Fim`] = filterValues[1];
        }
      } else if (filterValues && filterValues.length > 0) {
        // Usar o nome do campo diretamente conforme filterConfig
        backendFilters[key] = filterValues;
      }
    });

    // Adicionar busca genérica se existir
    if (searchQuery) {
      backendFilters.buscaGenerica = searchQuery;
    }

    fetchData(backendFilters);
  }, [useBackendFilters, fetchData, filters, searchQuery, avaiableFilters, dataType]);

  // Effect para filtragem no frontend (quando useBackendFilters = false)
  useEffect(() => {
    if (useBackendFilters) {
      // Se usar filtros do backend, mostrar dados como estão
      setFilteredData(data);
      return;
    }

    // Código de filtragem frontend original
    let newFilteredData = data;

    Object.keys(filters).forEach((key) => {
      const filterType = avaiableFilters?.find(f => f.name === key)?.type;
      const filterValues = filters[key];

      if (filterType === "date") {
        if (filterValues && (filterValues[0] || filterValues[1])) {
          newFilteredData = newFilteredData.filter(item => {
            const date = item["dataHora"]?.split(" ")[0]
            if (!date) return true;

            const itemDate = new Date(
              date.split("/")[2] + "-" +
              date.split("/")[1] + "-" +
              date.split("/")[0],
            )
            const startDate = filterValues[0] ? new Date(filterValues[0]) : null;
            const endDate = filterValues[1] ? new Date(filterValues[1]) : null;

            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            }
            else if (startDate) {
              return itemDate >= startDate;
            }
            else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          });
        }
      }
      else {
        if (filterValues && filterValues.length > 0) {
          newFilteredData = newFilteredData.filter(item =>
            filterValues.includes(
              filterType === "select"
                ? item[key]?.toUpperCase()
                : item[key]
            )
          );
        }
      }
    });

    setFilteredData(newFilteredData);
  }, [data, filters, useBackendFilters, avaiableFilters]);

  // Effect para aplicar filtros padrão na inicialização
  useEffect(() => {
    if (!hasInitialized && useBackendFilters && fetchData && Object.keys(defaultFilters).length > 0) {
      applyBackendFilters();
      setHasInitialized(true);
    }
  }, [defaultFilters, useBackendFilters, fetchData, hasInitialized]);

  // Effect para aplicar filtros do backend quando mudarem
  useEffect(() => {
    if (!useBackendFilters || !fetchData) return;
    if (!hasInitialized) return; // Não aplicar até que a inicialização seja feita

    const hasFilters = Object.keys(filters).length > 0;
    const hasSearch = searchQuery && searchQuery.trim() !== '';

    if (hasFilters || hasSearch) {

      const timeoutId = setTimeout(() => {
        applyBackendFilters();
      }, 800); // Debounce de 800ms

      return () => clearTimeout(timeoutId);
    }
  }, [JSON.stringify(filters), searchQuery, useBackendFilters, dataType, hasInitialized]);

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
                              newFilters[filter.name] = newFilters[filter.name].filter(v => v !== option.value);
                            }
                            else {
                              newFilters[filter.name] = [...(newFilters[filter.name] || []), option.value];
                            }
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
                            newFilters[filter.name] = ["", ""];
                          }
                          if (e.target.value) {
                            newFilters[filter.name][0] = e.target.value;
                          } else {
                            delete newFilters[filter.name][0];
                          }
                          setFilters(newFilters);
                        }}
                        value={filters[filter.name] ? filters[filter.name][0] : ""}
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
                            newFilters[filter.name] = ["", ""];
                          }
                          if (e.target.value) {
                            newFilters[filter.name][1] = e.target.value;
                          } else {
                            delete newFilters[filter.name][1];
                          }
                          setFilters(newFilters);
                        }}
                        value={filters[filter.name] ? filters[filter.name][1] : ""}
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
          onChangePassword={onChangePassword}
          formFields={formFields}
          onAssociarFormulario={onAssociarFormulario}
          callbacks={callbacks}
        />
      </div>
    </>
  )
}