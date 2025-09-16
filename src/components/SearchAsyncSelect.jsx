// components/SearchAsyncSelect.jsx
import React, { useState, useEffect, useCallback } from "react";
import Select, { components } from "react-select";
import { getPacientes } from "../services/pacienteAPI";
import { getUsers } from "../services/userAPI";

// MenuList custom para detectar scroll bottom
const MenuList = (props) => {
  const { children, innerRef } = props;
  const onScroll = (e) => {
    const target = e.target;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
      props.selectProps.onMenuScrollToBottom?.();
    }
  };

  return (
    <components.MenuList {...props} innerProps={{ onScroll }}>
      {children}
    </components.MenuList>
  );
};

// Estilos customizados para combinar com os campos do FormularioPopUp
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    padding: "0.125rem 0.75rem", // px-3 py-2 equivalente
    border: state.hasValue && state.selectProps.hasError 
      ? "1px solid #ef4444" // border-red-500
      : state.isFocused 
        ? "1px solid #ec4899" // border-pink-500
        : "1px solid #9ca3af", // border-gray-400
    borderRadius: "0.375rem", // rounded-md
    boxShadow: state.isFocused 
      ? "0 0 0 1px #ec4899" // ring-pink-500
      : "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // shadow-sm
    minHeight: "42px", // altura similar aos inputs normais
    "&:hover": {
      borderColor: state.isFocused ? "#ec4899" : "#9ca3af"
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0"
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0"
  }),
  indicatorSeparator: () => ({
    display: "none" // remove o separador
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: "#6b7280", // text-gray-500
    "&:hover": {
      color: "#374151" // text-gray-700
    }
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#6b7280", // text-gray-500
    "&:hover": {
      color: "#374151" // text-gray-700
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem", // rounded-md
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" // shadow-lg
  }),
  menuList: (provided) => ({
    ...provided,
    padding: "0"
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? "#ec4899" // bg-pink-500
      : state.isFocused 
        ? "#fce7f3" // bg-pink-50
        : "white",
    color: state.isSelected ? "white" : "#374151", // text-gray-700
    "&:hover": {
      backgroundColor: state.isSelected ? "#ec4899" : "#fce7f3"
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af" // text-gray-400
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#111827" // text-gray-900
  }),
  loadingMessage: (provided) => ({
    ...provided,
    color: "#6b7280" // text-gray-500
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "#6b7280" // text-gray-500
  })
};

export default function SearchAsyncSelect({
  apiKey = "pacientes",
  value = null, // { value, label } | null
  onChange,
  placeholder = "Pesquisar...",
  pageSize = 10,
  isDisabled = false,
  noOptionsMessage = () => "Sem resultados",
  hasError = false, // prop para indicar erro de validação
  additionalFilters = {}, // filtros adicionais para a busca
}) {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (q, p = 0) => {
    setLoading(true);
    try {
      if (apiKey === "pacientes") {
        const filters = {
          page: p,
          size: pageSize,
          buscaGenerica: q || undefined,
          ativo: [true],
          ...additionalFilters
        };
        const res = await getPacientes(filters);
        const items = res.content ?? res.items ?? [];
        const mapped = items.map(x => ({ value: x.id ?? x._id, label: x.nome ?? x.name }));
        return { mapped, total: res.totalElements ?? mapped.length };
      }
      if (apiKey === "users") {
        const filters = {
          page: p,
          size: pageSize,
          buscaGenerica: q || undefined,
          ativos: [true],
          ...additionalFilters
        };
        const res = await getUsers(filters);
        const items = res.content ?? res.items ?? [];
        const mapped = items.map(x => ({ value: x.id ?? x._id, label: x.nome ?? x.name }));
        return { mapped, total: res.totalElements ?? mapped.length };
      }
      // implementar "forms" se depois precisar...
      return { mapped: [], total: 0 };
    } catch (error) {
      return { mapped: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [apiKey, pageSize, additionalFilters]);

  // debounce do query para não estourar requisições
  useEffect(() => {
    const t = setTimeout(() => {
      // reset para nova busca
      setPage(0);
      setOptions([]);
      setTotal(null);

      // se query vazia é ok: pode buscar todos (ou retornar vazio)
      (async () => {
        if (query === "") {
          // opcional: buscar a primeira página mesmo sem query
          const { mapped, total } = await fetchPage("", 0);
          setOptions(mapped);
          setTotal(total);
        } else {
          const { mapped, total } = await fetchPage(query, 0);
          setOptions(mapped);
          setTotal(total);
        }
      })();
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [query, fetchPage, JSON.stringify(additionalFilters)]);

  const loadMore = async () => {
    if (loading) return;
    const next = page + 1;
    // se já sabemos total e não há mais, abort
    if (total !== null && options.length >= total) return;

    const { mapped, total: newTotal } = await fetchPage(query, next);

    // merge sem duplicatas
    setOptions(prev => {
      const map = new Map(prev.map(o => [o.value, o]));
      mapped.forEach(m => map.set(m.value, m));
      return Array.from(map.values());
    });

    setPage(next);
    setTotal(newTotal);
  };

  // Handler para mudanças de seleção
  const handleChange = (selectedOption) => {
    onChange?.(selectedOption);
  };

  return (
    <Select
      components={{ MenuList }}
      options={options}
      value={value} // Usar a prop value diretamente
      placeholder={placeholder}
      onInputChange={(v) => setQuery(v)}
      onChange={handleChange}
      isClearable
      isDisabled={isDisabled}
      onMenuScrollToBottom={loadMore}
      noOptionsMessage={() => (loading ? "Carregando..." : noOptionsMessage())}
      // accessibility
      filterOption={null} // desativa filtro client-side pois usamos o server-side
      // estilos customizados
      styles={customStyles}
      hasError={hasError} // passa o erro para os estilos
    />
  );
}