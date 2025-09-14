import { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/auth/useAuth';
import { getCurrentUser } from '../services/authAPI';

export default function ModalEditarPerfil({ isOpen, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    crm: '',
    especialidade: ''
  });

  // Carregar dados completos do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Atualizar formData quando userData mudar
  useEffect(() => {
    if (userData) {
      setFormData({
        nome: userData.nome || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
        crm: userData.crm || '',
        especialidade: userData.especialidade || ''
      });
    }
  }, [userData]);

  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      console.log('🔍 Tentando carregar dados do usuário via API...');
      const response = await getCurrentUser();
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Dados do usuário carregados via API:', response.data);
        setUserData(response.data);
      } else {
        // Fallback: usar dados do contexto se API falhar
        console.warn('⚠️ Falha ao carregar dados via API, usando contexto:', user);
        setUserData(user);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário via API:', error);
      // Fallback: usar dados do contexto
      console.log('🔄 Usando dados do contexto como fallback:', user);
      setUserData(user);

      // Só mostrar warning se realmente não temos dados do contexto
      if (!user || Object.keys(user).length === 0) {
        toast.warning('Não foi possível carregar os dados do usuário.');
      }
    } finally {
      setLoadingUserData(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar API para atualizar perfil do usuário
      // await updateUserProfile(user.id, formData);

      console.log('Dados do perfil para atualizar:', formData);

      // Simulação de sucesso por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Resetar com os dados carregados mais recentes
    if (userData) {
      setFormData({
        nome: userData.nome || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
        crm: userData.crm || '',
        especialidade: userData.especialidade || ''
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <User size={20} className="text-redfemActionPink" />
            <h2 className="text-xl font-semibold text-gray-800">
              Editar Perfil
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {loadingUserData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-redfemActionPink border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600">Carregando dados do usuário...</span>
            </div>
          ) : (
            <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            {/* CRM */}
            <div>
              <label htmlFor="crm" className="block text-sm font-medium text-gray-700 mb-1">
                CRM
              </label>
              <input
                type="text"
                id="crm"
                name="crm"
                value={formData.crm}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50"
              />
            </div>

            {/* Especialidade */}
            <div>
              <label htmlFor="especialidade" className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <input
                type="text"
                id="especialidade"
                name="especialidade"
                value={formData.especialidade}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || loadingUserData}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingUserData}
              className="flex items-center gap-2 px-4 py-2 bg-redfemActionPink hover:bg-redfemDarkPink text-white rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}