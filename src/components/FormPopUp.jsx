import React, { useState, useEffect } from 'react';
import { ButtonPrimary, ButtonSecondary } from "./Button"

export default function FormularioPopUp({
  isOpen,
  onClose,
  title,
  fields, // array de configuração dos campos (a parte mais importante!)
  onSubmit,       
  submitText = "Adicionar"
}) {

  const [formData, setFormData] = useState({});

  // Inicializa o estado do formulário quando os campos mudam
  useEffect(() => {
    const initialState = fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {});
    setFormData(initialState);
  }, [fields]);

  // Função genérica para lidar com a mudança em qualquer campo
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Envia os dados para a função do componente pai
    onClose(); // Fecha o modal após o envio
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
          <button onClick={onClose} className="text-2xl font-light">&times;</button>
        </div>

        {/* Formulário Dinâmico */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="" disabled>{field.placeholder}</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 mt-8">
            <ButtonSecondary onClick={onClose}> 
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary onClick={onSubmit}> 
              {submitText}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </div>
  );
}