import React, { useEffect, useMemo } from "react";
import { ButtonPrimary, ButtonSecondary } from "./Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: {},
  });

  // detecta dinamicamente qual propriedade parece ser o ID
  const idKey = useMemo(() => {
    const candidates = ["id", "_id"];
    return candidates.find((k) => initialData && initialData[k] !== undefined);
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (mode === "create") {
      reset({}); // limpa tudo
      return;
    }

    if (fields.length === 0) return; // espera fields carregarem
  
    if (mode === "edit" && initialData) {
      const normalized = {};
      fields.forEach(field => {
        const name = field.name;
        let val = initialData[name];
        if (val === undefined) return;
  
        if (field.type === "select") {
          if (Array.isArray(field.options)) {
            const match = field.options.find(
              o => o.value === val || o.label === val
            );
            normalized[name] = match?.value ?? val;
          } else {
            normalized[name] = val;
          }
        } else if (field.type === "checkbox") {
          normalized[name] = Boolean(val);
        } else {
          normalized[name] = val;
        }
      });
  
      reset(normalized);
      if (idKey) setValue(idKey, initialData[idKey]);
    } else {
      reset({}); // create mode limpa tudo
    }
  }, [isOpen, initialData, fields, idKey, mode, reset, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      const payload = { ...initialData, ...data };
      console.log("FormularioPopUp -> submitting payload:", payload);
      await onSubmit?.(payload);
      if (closeOnSubmit) onClose?.();
    } catch (err) {
      console.error("Erro no submit do FormPopUp:", err);
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
                      <option value="">{field.placeholder ?? "Selecione"}</option>
                      {Array.isArray(field.options) &&
                        field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                    {errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
                  </div>
                );
              }

              if (field.type === "checkbox") {
                return (
                  <div key={name} className="flex items-center gap-2">
                    <input type="checkbox" {...register(name)} className={`h-4 w-4 ${errors[name] ? "border-red-500" : ""}`} />
                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                    {errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
                  </div>
                );
              }

              return (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type || "text"} placeholder={field.placeholder} {...register(name)} className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${errors[name] ? "border-red-500" : "border-gray-400"}`} />
                  {errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <ButtonSecondary onClick={onClose} type="button">Cancelar</ButtonSecondary>
            <ButtonPrimary type="submit">{submitText}</ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}
