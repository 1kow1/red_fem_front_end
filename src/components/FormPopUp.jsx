/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { ButtonPrimary, ButtonSecondary } from "./Button";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getPacientes, getPacienteById } from "../services/pacienteAPI";
import { getUsers, getUserById } from "../services/userAPI";
import SearchAsyncSelect from "../components/SearchAsyncSelect";
import { parseISO, isValid } from "date-fns";

export default function FormularioPopUp({
  isOpen,
  onClose,
  title,
  mode,
  fields = [],
  onSubmit,
  submitText = "Salvar",
  initialData = {},
  closeOnSubmit = false,
  validationSchema,
  columns = 1, // Nova prop para controlar número de colunas
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: {},
  });

  // guarda labels carregadas para selects assíncronos { fieldName: { value, label } }
  const [asyncDefaults, setAsyncDefaults] = useState({});

  // detecta dinamicamente qual propriedade parece ser o ID
  const idKey = useMemo(() => {
    const candidates = ["id", "_id"];
    return candidates.find((k) => initialData && initialData[k] !== undefined);
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      reset({});
      setAsyncDefaults({});
      return;
    }

    // Se for modo de criação, apenas limpa os campos
    if (mode === "create") {
      reset({});
      return;
    }

    // Se for modo de edição e temos dados iniciais
    if (mode === "edit" && initialData && Object.keys(initialData).length > 0) {
      
      // Prepara os dados normalizados baseados nos campos configurados
      const normalizedData = {};
      
      fields.forEach((field) => {
        const fieldName = field.name;
        // Procura primeiro pelo campo original, depois pela versão com underscore
        let value = initialData[fieldName] ?? initialData[`_${fieldName}`];

        if (value === undefined || value === null) return;
        
        // Processa diferentes tipos de campo
        if (field.type === "select") {
          if (Array.isArray(field.options)) {
            const match = field.options.find(
              (opt) => opt.value === value || opt.label === value
            );
            normalizedData[fieldName] = match?.value ?? value;
          } else {
            normalizedData[fieldName] = value;
          }
        } else if (field.type === "checkbox") {
          // Converte strings "Sim"/"Não" ou booleans
          if (typeof value === "string") {
            normalizedData[fieldName] = value.toLowerCase() === "sim" || value === "true";
          } else {
            normalizedData[fieldName] = Boolean(value);
          }
        } else if (field.type === "date") {
          // Tratamento especial para campos de data na inicialização
          if (value) {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              normalizedData[fieldName] = dateValue.toISOString().split('T')[0];
            } else {
              normalizedData[fieldName] = value;
            }
          } else {
            normalizedData[fieldName] = value;
          }
        } else {
          normalizedData[fieldName] = value;
        }
      });

      
      // Reset do formulário com os dados normalizados
      reset(normalizedData);
      
      // Se tem ID, também seta ele
      if (idKey && initialData[idKey]) {
        setValue(idKey, initialData[idKey]);
      }

      // Carrega dados dos selects assíncronos
      loadAsyncDefaults();
    }
  }, [isOpen, mode, initialData, fields, reset, setValue, idKey]);

  // Função separada para carregar os dados dos selects assíncronos
  const loadAsyncDefaults = async () => {
    if (!initialData || mode !== "edit") return;

    const newDefaults = {};
    
    await Promise.all(
      fields.map(async (field) => {
        if (field.type !== "async-select") return;

        const idValue = initialData[field.name];
        if (!idValue) return;

        try {
          if (field.apiKey === "pacientes") {
            const p = await getPacienteById(idValue);
            newDefaults[field.name] = {
              value: idValue,
              label: p.nome ?? p.name ?? String(idValue),
            };
          } else if (field.apiKey === "users") {
            const u = await getUserById(idValue);
            newDefaults[field.name] = {
              value: idValue,
              label: u.nome ?? u.name ?? String(idValue),
            };
          } else if (field.apiKey === "forms") {
            // se tiver getFormById, use-o
            // const f = await getFormById(idValue);
            // newDefaults[field.name] = { value: idValue, label: f.titulo ?? String(idValue) };
          }
        } catch (err) {
          newDefaults[field.name] = {
            value: idValue,
            label: String(idValue),
          };
        }
      })
    );

    setAsyncDefaults(newDefaults);

    // também setar os valores dos campos no form (apenas o id)
    fields.forEach((field) => {
      if (field.type === "async-select") {
        const idValue = initialData[field.name];
        if (idValue) setValue(field.name, idValue);
      }
    });
  };

  const handleFormSubmit = async (data) => {
    try {

      const cleaned = {};
      fields.forEach((f) => {
        const name = f.name;
        if (data[name] !== undefined) {
          // Tratamento especial para campos de data
          if (f.type === "date" && data[name]) {
            // Garantir que data seja enviada como string YYYY-MM-DD
            const dateValue = new Date(data[name]);
            if (!isNaN(dateValue.getTime())) {
              cleaned[name] = dateValue.toISOString().split('T')[0];
            } else {
              cleaned[name] = data[name];
            }
          } else {
            cleaned[name] = data[name];
          }
        } else if (initialData && initialData[name] !== undefined) {
          cleaned[name] = initialData[name];
        }
      });

      // Se estamos no modo de edição, incluir o ID
      if (mode === "edit" && idKey && initialData[idKey]) {
        cleaned[idKey] = initialData[idKey];
      }


      await onSubmit?.(cleaned);

      if (closeOnSubmit) {
        onClose?.();
      }
    } catch (err) {
      // Error is handled by the parent component via onSubmit
      throw err;
    }
  };

  // função genérica para buscar opções (retorna lista [{value,label}])
  const loadOptions = async (inputValue, field) => {
    try {
      if (field.apiKey === "pacientes") {
        const filters = {
          page: 0,
          size: 10,
          buscaGenerica: inputValue || undefined,
          ativo: [true]
        };
        const res = await getPacientes(filters);
        const items = res.content ?? res.items ?? res;
        return (items || []).map((p) => ({
          value: p._id ?? p.id ?? p.identifier,
          label: p.nome ?? p.fullName ?? p.name,
        }));
      } else if (field.apiKey === "users") {
        const filters = {
          page: 0,
          size: 10,
          buscaGenerica: inputValue || undefined,
          ativos: [true]
        };
        const res = await getUsers(filters);
        const items = res.content ?? res.items ?? res;
        return (items || []).map((u) => ({
          value: u._id ?? u.id ?? u.identifier,
          label: u.nome ?? u.name,
        }));
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  if (!isOpen) return null;

  const getModalWidth = () => {
    if (columns === 2) return "max-w-4xl";
    return "max-w-md";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full ${getModalWidth()} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-light">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {idKey && <input type="hidden" {...register(idKey)} />}

          {columns === 2 ? (
            // Layout de 2 colunas
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {fields.map((field) => {
                if (field.showIf && !field.showIf(watch())) return null;
                return renderField(field);
              })}
            </div>
          ) : (
            // Layout de 1 coluna (original)
            <div className="space-y-4">
              {fields.map((field) => {
                if (field.showIf && !field.showIf(watch())) return null;
                return renderField(field);
              })}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <ButtonSecondary onClick={onClose} type="button">
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary
              type="submit"
              disabled={isSubmitting || (validationSchema && (!isValid || !isDirty))}
            >
              {isSubmitting ? "Salvando..." : submitText}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );

  // Função para renderizar cada campo
  function renderField(field) {
    const name = field.name;

    if (field.type === "async-select") {
      return (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          <Controller
            control={control}
            name={name}
            render={({ field: controllerField }) => {
              const valueObj = asyncDefaults[name] || null;

              return (
                <SearchAsyncSelect
                  apiKey={field.apiKey}
                  value={valueObj}
                  onChange={(opt) => {
                    controllerField.onChange(opt ? opt.value : "");
                    // Atualizar o asyncDefaults para manter a label
                    if (opt) {
                      setAsyncDefaults((prev) => ({
                        ...prev,
                        [name]: opt,
                      }));
                    } else {
                      setAsyncDefaults((prev) => {
                        const newDefaults = { ...prev };
                        delete newDefaults[name];
                        return newDefaults;
                      });
                    }
                  }}
                  placeholder={field.placeholder}
                  pageSize={field.pageSize ?? 10}
                  hasError={!!errors[name]}
                  additionalFilters={field.additionalFilters || {}}
                />
              );
            }}
          />

          {errors[name] && (
            <p className="text-red-500 text-sm">
              {errors[name].message}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      const currentOptions = typeof field.options === "function"
        ? field.options(watch())
        : field.options;

      return (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            {...register(name)}
            className={`w-80 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
              errors[name] ? "border-red-500" : "border-gray-400"
            }`}
          >
            <option value="">
              {field.placeholder ?? "Selecione"}
            </option>
            {Array.isArray(currentOptions) &&
              currentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
          {errors[name] && (
            <p className="text-red-500 text-sm">
              {errors[name].message}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div key={name} className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(name)}
            className={`h-4 w-4 ${
              errors[name] ? "border-red-500" : ""
            }`}
          />
          <label className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {errors[name] && (
            <p className="text-red-500 text-sm">
              {errors[name].message}
            </p>
          )}
        </div>
      );
    }

    // Usar largura padrão menor para todos os inputs
    const inputWidthClass = 'w-80';

    return (
      <div key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={field.type || "text"}
          placeholder={field.placeholder}
          min={field.min} // Para campos de data, define data mínima
          {...register(name)}
          className={`${inputWidthClass} px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
            errors[name] ? "border-red-500" : "border-gray-400"
          }`}
        />
        {errors[name] && (
          <p className="text-red-500 text-sm">
            {errors[name].message}
          </p>
        )}
      </div>
    );
  }
}