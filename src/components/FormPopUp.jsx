import React, { useState, useEffect } from "react";
import { ButtonPrimary, ButtonSecondary } from "./Button";

export default function FormularioPopUp({
  isOpen,
  onClose,
  title,
  fields = [], // [{ name, label, type, placeholder, options, default }]
  onSubmit, // função assíncrona: (formData) => Promise
  submitText = "Salvar",
  initialData = {},
  closeOnSubmit = false, // se true, o próprio componente chama onClose() após onSubmit
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const initialState = fields.reduce((acc, field) => {
      const name = field.name;
      acc[name] =
        initialData && initialData[name] !== undefined
          ? initialData[name]
          : field.default ?? "";
      return acc;
    }, {});
    setFormData(initialState);
  }, [fields, initialData, isOpen]);

  // Função genérica
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(
        "FormPopUp submetendo formData:",
        formData,
        "initialData:",
        initialData
      );
      await onSubmit?.(formData);
      if (closeOnSubmit) onClose?.();
    } catch (err) {
      console.error("Erro no submit do FormPopUp:", err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Overlay (fundo escuro)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Conteúdo do Modal */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-light">
            &times;
          </button>
        </div>

        {/* Formulário Dinâmico */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field) => {
              // Se tiver showIf e retornar false, não renderiza
              if (field.showIf && !field.showIf(formData)) return null;
              const name = field.name;
              const value = formData[name] ?? "";

              if (field.type === "select") {
                return (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      name={name}
                      value={value}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
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
                  </div>
                );
              }

              if (field.type === "checkbox") {
                return (
                  <div key={name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={name}
                      checked={!!value}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
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
                    name={name}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              );
            })}
          </div>

          {/* Botões de Ação */}
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
