import React, { useEffect } from "react";
import { ButtonPrimary, ButtonSecondary } from "./Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export default function FormularioPopUp({
  isOpen,
  onClose,
  title,
  fields = [], // [{ name, label, type, placeholder, options, default, showIf }]
  onSubmit, // função assíncrona: (formData) => Promise
  submitText = "Salvar",
  initialData = {},
  closeOnSubmit = false,
  validationSchema, // 🔥 novo: passar o schema Yup
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: initialData,
  });

  // resetar os valores quando abrir/editar
  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit?.(data);
      if (closeOnSubmit) onClose?.();
    } catch (err) {
      console.error("Erro no submit do FormPopUp:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-light">
            &times;
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
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

          {/* Botões */}
          <div className="flex justify-end gap-4 mt-8">
            <ButtonSecondary onClick={onClose} type="button">
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary type="submit">{submitText}</ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}
