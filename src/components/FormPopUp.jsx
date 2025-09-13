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
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
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
    if (!isOpen) return;
    if (mode !== "edit" || !initialData) return;

    (async () => {
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
            console.warn("Erro ao carregar default async-select:", err);
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
    })();
  }, [isOpen, mode, initialData, fields, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      const cleaned = {};
      fields.forEach((f) => {
        const name = f.name;
        if (data[name] !== undefined) cleaned[name] = data[name];
        else if (initialData && initialData[name] !== undefined)
          cleaned[name] = initialData[name];
      });

      await onSubmit?.(cleaned);

      if (closeOnSubmit) {
        onClose?.();
      }
    } catch (err) {
      console.error("❌ Erro no handleFormSubmit do FormPopUp:", err);
      console.error("📊 Stack:", err.stack);
    }
  };

  // função genérica para buscar opções (retorna lista [{value,label}])
  const loadOptions = async (inputValue, field) => {
    try {
      if (field.apiKey === "pacientes") {
        const res = await getPacientes(0, 10, inputValue);
        // adaptar dependendo do shape do seu backend: aqui assumimos res.content ou res.items...
        const items = res.content ?? res.items ?? res;
        return (items || []).map((p) => ({
          value: p._id ?? p.id ?? p.identifier,
          label: p.nome ?? p.fullName ?? p.name,
        }));
      } else if (field.apiKey === "users") {
        const res = await getUsers(inputValue, 0, 10);
        const items = res.content ?? res.items ?? res;
        return (items || []).map((u) => ({
          value: u._id ?? u.id ?? u.identifier,
          label: u.nome ?? u.name,
        }));
      }
      return [];
    } catch (err) {
      console.error("Erro em loadOptions:", err);
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-light">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {idKey && <input type="hidden" {...register(idKey)} />}

          <div className="space-y-4">
            {fields.map((field) => {
              if (field.showIf && !field.showIf(watch())) return null;
              const name = field.name;

              if (field.type === "async-select") {
                const name = field.name;
                return (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
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
                return (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      {...register(name)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
                        errors[name] ? "border-red-500" : "border-gray-400"
                      }`}
                    >
                      <option value="">
                        {field.placeholder ?? "Selecione"}
                      </option>
                      {Array.isArray(field.options) &&
                        field.options.map((option) => (
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
                    </label>
                    {errors[name] && (
                      <p className="text-red-500 text-sm">
                        {errors[name].message}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    {...register(name)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
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
            })}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <ButtonSecondary onClick={onClose} type="button">
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : submitText}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}
