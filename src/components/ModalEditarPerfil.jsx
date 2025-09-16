import { useState, useEffect } from 'react';
import { X, User, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/auth/useAuth';
import { getCurrentUser, updateCurrentUserProfile, changeMyPassword } from '../services/authAPI';
import { useErrorHandler } from '../hooks/useErrorHandler';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { useErrorHandler as useBackendErrorHandler, mapPasswordErrors } from '../utils/errorHandling';

export default function ModalEditarPerfil({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showError, showSuccess } = useErrorHandler();
  const { extractValidationErrors } = useBackendErrorHandler();
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  // Estados para alteração de senha
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });
  const [backendErrors, setBackendErrors] = useState({});

  // Validação de senha
  const { validation, isPasswordValid } = usePasswordValidation(passwordData.novaSenha);

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
        telefone: userData.telefone || ''
      });
    }
  }, [userData]);

  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const response = await getCurrentUser();
      if (response.status >= 200 && response.status < 300) {
        setUserData(response.data);
      } else {
        // Fallback: usar dados do contexto se API falhar
        setUserData(user);
      }
    } catch (error) {
      // Fallback: usar dados do contexto
      setUserData(user);

      // Só mostrar warning se realmente não temos dados do contexto
      if (!user || Object.keys(user).length === 0) {
        showError(error);
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erros quando o usuário começar a digitar
    if (backendErrors[name]) {
      setBackendErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Função para verificar se houve mudanças no perfil
  const hasProfileChanges = () => {
    if (!userData) return false;
    return (
      formData.nome !== (userData.nome || '') ||
      formData.email !== (userData.email || '') ||
      formData.telefone !== (userData.telefone || '')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBackendErrors({});

    try {
      let successMessage = '';
      let updatedUserData = userData;

      // Verificar se há mudanças no perfil e só fazer PUT se necessário
      const needsProfileUpdate = hasProfileChanges();

      if (needsProfileUpdate) {
        const profileResponse = await updateCurrentUserProfile(formData);

        if (profileResponse.status >= 200 && profileResponse.status < 300) {
          // Atualizar os dados locais com a resposta da API
          updatedUserData = profileResponse.data;
          setUserData(updatedUserData);
          successMessage = 'Perfil atualizado com sucesso!';
        } else {
          throw new Error('Resposta inesperada da API');
        }
      }

      // Se há dados de senha, tentar alterar a senha
      if (showPasswordSection && passwordData.senhaAtual && passwordData.novaSenha) {
        // Validar senha antes de enviar
        if (passwordData.novaSenha !== passwordData.confirmarSenha) {
          setBackendErrors({ confirmarSenha: 'As senhas não coincidem' });
          return;
        }

        if (!isPasswordValid(passwordData.novaSenha)) {
          setBackendErrors({ novaSenha: 'A senha não atende aos requisitos de complexidade' });
          return;
        }

        try {
          await changeMyPassword({
            senhaAtual: passwordData.senhaAtual,
            novaSenha: passwordData.novaSenha
          });

          if (needsProfileUpdate) {
            successMessage = 'Perfil e senha atualizados com sucesso!';
          } else {
            successMessage = 'Senha atualizada com sucesso!';
          }

          // Limpar dados de senha
          setPasswordData({
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: ''
          });
          setShowPasswordSection(false);
        } catch (passwordError) {
          // Mapear erros de senha para campos específicos
          const passwordErrors = mapPasswordErrors(passwordError);

          if (Object.keys(passwordErrors).length > 0) {
            setBackendErrors(passwordErrors);
            return; // Não fechar o modal se houver erro na senha
          }

          // Se não conseguiu extrair erro específico, re-throw
          throw passwordError;
        }
      }

      // Se não houve nenhuma operação, mostrar mensagem
      if (!needsProfileUpdate && (!showPasswordSection || !passwordData.senhaAtual || !passwordData.novaSenha)) {
        showError(new Error('Nenhuma alteração foi feita'));
        return;
      }

      showSuccess(successMessage);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);

      // Tentar extrair mensagem mais específica do erro
      let errorMessage = 'Erro ao atualizar perfil';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Se for erro 500, mostrar mensagem mais amigável
      if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Verifique os logs para mais detalhes.';
      }

      showError(new Error(errorMessage));
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
        telefone: userData.telefone || ''
      });
    }

    // Resetar dados de senha
    setPasswordData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
    setShowPasswordSection(false);
    setBackendErrors({});

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
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

            {/* Seção de Alteração de Senha */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Alterar Senha</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-sm text-redfemActionPink hover:text-redfemDarkPink"
                  disabled={loading}
                >
                  {showPasswordSection ? 'Cancelar' : 'Alterar Senha'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="space-y-4">
                  {/* Erro geral */}
                  {backendErrors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                      {backendErrors.general}
                    </div>
                  )}

                  {/* Senha Atual */}
                  <div>
                    <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.atual ? "text" : "password"}
                        id="senhaAtual"
                        name="senhaAtual"
                        value={passwordData.senhaAtual}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 ${
                          backendErrors.senhaAtual ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('atual')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPasswords.atual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {backendErrors.senhaAtual && (
                      <div className="text-red-500 text-sm mt-1">
                        {backendErrors.senhaAtual}
                      </div>
                    )}
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.nova ? "text" : "password"}
                        id="novaSenha"
                        name="novaSenha"
                        value={passwordData.novaSenha}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 ${
                          backendErrors.novaSenha ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('nova')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPasswords.nova ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {backendErrors.novaSenha && (
                      <div className="text-red-500 text-sm mt-1">
                        {backendErrors.novaSenha}
                      </div>
                    )}
                    <PasswordStrengthIndicator
                      password={passwordData.novaSenha}
                      showValidation={true}
                      className="mt-2"
                    />
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div>
                    <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirmar ? "text" : "password"}
                        id="confirmarSenha"
                        name="confirmarSenha"
                        value={passwordData.confirmarSenha}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 ${
                          backendErrors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmar')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPasswords.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {backendErrors.confirmarSenha && (
                      <div className="text-red-500 text-sm mt-1">
                        {backendErrors.confirmarSenha}
                      </div>
                    )}
                    {passwordData.confirmarSenha && passwordData.novaSenha !== passwordData.confirmarSenha && (
                      <div className="text-red-500 text-sm mt-1">
                        As senhas não coincidem
                      </div>
                    )}
                  </div>
                </div>
              )}
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