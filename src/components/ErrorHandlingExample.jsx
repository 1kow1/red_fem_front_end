// Exemplo de como usar o sistema de tratamento de erros
import { useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { createUser } from '../services/userAPI';

export default function UserFormExample() {
  const { showError, showSuccess, handleAsyncError } = useErrorHandler();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Método 1: Usando handleAsyncError (mais simples)
    const result = await handleAsyncError(
      () => createUser(formData),
      'Usuário criado com sucesso!'
    );

    if (result.success) {
      // Reset form on success
      setFormData({ nome: '', email: '', telefone: '' });
    } else if (result.errors) {
      // Set validation errors for individual fields
      setFieldErrors(result.errors);
    }

    setLoading(false);
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Método 2: Tratamento manual (mais controle)
    try {
      await createUser(formData);
      showSuccess('Usuário criado com sucesso!');
      setFormData({ nome: '', email: '', telefone: '' });
    } catch (error) {
      const validationErrors = showError(error);
      if (validationErrors) {
        setFieldErrors(validationErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="nome" className="block text-sm font-medium mb-1">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={formData.nome}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md ${
            fieldErrors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {fieldErrors.nome && (
          <span className="text-red-500 text-sm mt-1 block">
            {fieldErrors.nome}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md ${
            fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {fieldErrors.email && (
          <span className="text-red-500 text-sm mt-1 block">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="telefone" className="block text-sm font-medium mb-1">
          Telefone
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          value={formData.telefone}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md ${
            fieldErrors.telefone ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {fieldErrors.telefone && (
          <span className="text-red-500 text-sm mt-1 block">
            {fieldErrors.telefone}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}