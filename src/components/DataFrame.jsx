// components/DataFrame.jsx
import Table from "./Table"
import Searchbar from "./Searchbar"
import { ButtonPrimary } from "./Button"
import { AddIcon } from "./Icons"
import { useState, useEffect, useCallback, useRef } from "react"
import HelpTooltip from "./HelpTooltip"

function Tag({ children, isSelected, onClick, onRemove, removable = false }) {
  return (
    <span
      className={`mr-2 border-2 rounded-lg inline-flex items-center gap-1
        ${isSelected ? (
          `bg-redfemActionPink border-redfemActionPink text-white
          hover:bg-redfemDarkPink`
        ) : (
          `bg-redfemHoverPink border-redfemVariantPink text-redfemDarkPink
          hover:bg-redfemVariantPink/30`
        )}
        cursor-pointer
      `}
    >
      <span className="px-2 py-1" onClick={onClick}>
        {children}
      </span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`px-1 py-1 rounded-r-md hover:bg-black/20 text-sm font-bold
            ${isSelected ? 'text-white' : 'text-redfemDarkPink'}
          `}
        >
          ×
        </button>
      )}
    </span>
  );
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
  defaultFilters = {}, // nova prop para filtros padrão
  page, // número da página atual
  size,  // tamanho da página
  setPage // função para resetar a página
}) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState(defaultFilters);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const dateInputsRef = useRef({});
  const previousFiltersRef = useRef(JSON.stringify(defaultFilters));
  const previousSearchRef = useRef("");
  const loadingTimerRef = useRef(null);
  const isApplyingFiltersRef = useRef(false);
  const isPageChangeFromUser = useRef(false);

  // Função para limpar todos os filtros
  const handleClearAllFilters = () => {
    // Limpar TODOS os filtros (incluindo defaultFilters)
    setFilters({});
    // Limpar todos os inputs de data manualmente
    Object.keys(dateInputsRef.current).forEach(key => {
      const input = dateInputsRef.current[key];
      if (input) {
        input.value = '';
      }
    });
  };

  // Função para aplicar filtros via backend
  const applyBackendFilters = useCallback(async () => {
    if (!useBackendFilters || !fetchData) {
      return;
    }

    // Evitar chamadas redundantes
    if (isApplyingFiltersRef.current) {
      return;
    }

    isApplyingFiltersRef.current = true;
    setIsFilterLoading(true);

    // Capturar tempo de início para garantir duração mínima do spinner
    const MIN_LOADING_TIME = 300; // ms
    const startTime = Date.now();

    // Mostrar spinner imediatamente
    setShowLoadingIndicator(true);

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

    // Adicionar paginação
    if (page !== undefined) {
      backendFilters.page = page;
    }
    if (size !== undefined) {
      backendFilters.size = size;
    }

    try {
      await fetchData(backendFilters);
    } finally {
      // Garantir que o spinner seja exibido por pelo menos MIN_LOADING_TIME
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Limpar estados
      setIsFilterLoading(false);
      setShowLoadingIndicator(false);
      isApplyingFiltersRef.current = false;
    }
  }, [useBackendFilters, fetchData, filters, searchQuery, avaiableFilters, dataType, page, size]);

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
    if (!hasInitialized && useBackendFilters && fetchData) {
      // Sempre chamar applyBackendFilters na primeira carga, independente de ter filtros ou não
      applyBackendFilters();
      setHasInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized, useBackendFilters, fetchData]);

  // Effect para aplicar filtros do backend quando mudarem
  useEffect(() => {
    if (!useBackendFilters || !fetchData) return;
    if (!hasInitialized) return; // Não aplicar até que a inicialização seja feita

    const currentFilters = JSON.stringify(filters);
    const currentSearch = searchQuery || "";

    // Verificar se filtros ou busca realmente mudaram
    const filtersChanged = previousFiltersRef.current !== currentFilters;
    const searchChanged = previousSearchRef.current !== currentSearch;

    // Resetar para página 1 APENAS quando filtros ou busca mudarem
    if ((filtersChanged || searchChanged) && setPage && page !== 0) {
      setPage(0);
    }

    // Atualizar refs
    previousFiltersRef.current = currentFilters;
    previousSearchRef.current = currentSearch;

    const hasFilters = Object.keys(filters).length > 0;
    const hasSearch = searchQuery && searchQuery.trim() !== '';

    // Só aplicar filtros se algo realmente mudou
    if (!filtersChanged && !searchChanged) {
      return;
    }

    if (hasFilters || hasSearch) {
      const timeoutId = setTimeout(() => {
        applyBackendFilters();
      }, 800); // Debounce aumentado para 800ms para reduzir requisições

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Se não há filtros e algo mudou (usuário limpou filtros), aplicar filtros vazios com debounce
      const timeoutId = setTimeout(() => {
        applyBackendFilters();
      }, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), searchQuery, useBackendFilters, dataType, hasInitialized, setPage]);

  // Effect para aplicar filtros quando a página ou tamanho mudarem
  useEffect(() => {
    if (!useBackendFilters || !fetchData) return;
    if (!hasInitialized) return;

    applyBackendFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, useBackendFilters, fetchData, hasInitialized]);

  return (
    <>
      <div>
        <div className="flex flex-row gap-2 items-center mb-4">
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

          {/* Tooltip de ajuda sobre filtros */}
          <div className="self-center">
            <HelpTooltip
              title="Ajuda"
              content="Pressione <strong>F1</strong> para ajuda completa"
              position="bottom"
              maxWidth={180}
            />
          </div>
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
                        ref={(el) => dateInputsRef.current[`${filter.name}-start`] = el}
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
                        ref={(el) => dateInputsRef.current[`${filter.name}-end`] = el}
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

        {/* Active filters display */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Filtros ativos:</span>
              {Object.entries(filters).map(([filterName, filterValues]) => {
                const filter = avaiableFilters?.find(f => f.name === filterName);
                if (!filter || !filterValues || (Array.isArray(filterValues) && filterValues.length === 0)) return null;

                if (filter.type === "date") {
                  const [startDate, endDate] = filterValues;
                  if (!startDate && !endDate) return null;

                  const dateLabel = startDate && endDate
                    ? `${filter.label}: ${startDate} até ${endDate}`
                    : startDate
                      ? `${filter.label}: a partir de ${startDate}`
                      : `${filter.label}: até ${endDate}`;

                  return (
                    <Tag
                      key={filterName}
                      isSelected={false}
                      removable={true}
                      onRemove={() => {
                        const newFilters = { ...filters };
                        delete newFilters[filterName];
                        setFilters(newFilters);
                      }}
                    >
                      {dateLabel}
                    </Tag>
                  );
                } else {
                  // For select/boolean filters
                  return filterValues.map((value) => {
                    const option = filter.options?.find(opt => opt.value === value);
                    const label = option ? option.label : value;

                    return (
                      <Tag
                        key={`${filterName}-${value}`}
                        isSelected={false}
                        removable={true}
                        onRemove={() => {
                          const newFilters = { ...filters };
                          newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
                          if (newFilters[filterName].length === 0) {
                            delete newFilters[filterName];
                          }
                          setFilters(newFilters);
                        }}
                      >
                        {filter.label}: {label}
                      </Tag>
                    );
                  });
                }
              })}
              {Object.entries(filters).some(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.length > 0 && value.some(v => v !== "" && v !== null && v !== undefined);
                }
                return value !== "" && value !== null && value !== undefined;
              }) && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-redfemDarkPink hover:text-redfemPink underline ml-2"
                >
                  Limpar todos
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative min-h-[400px]">
          {showLoadingIndicator && (
            /* Loading overlay que cobre a tabela */
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-lg border">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-redfemActionPink"></div>
                <p className="text-sm text-gray-600 font-medium">
                  Carregando...
                </p>
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
      </div>
    </>
  )
}