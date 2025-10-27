import { useState, useEffect } from 'react';
import { X, User, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/auth/useAuth';
import { getCurrentUser, updateCurrentUserProfile, changeCurrentUserPassword } from '../services/authAPI';
import { useErrorHandler } from '../hooks/useErrorHandler';

export default function ModalEditarPerfil({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showError, showSuccess } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

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
  };

  const validatePassword = () => {
    if (changePassword) {
      if (!passwordData.senhaAtual) {
        showError({ message: 'Senha atual é obrigatória' });
        return false;
      }
      if (!passwordData.novaSenha) {
        showError({ message: 'Nova senha é obrigatória' });
        return false;
      }
      if (passwordData.novaSenha.length < 6) {
        showError({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
        return false;
      }
      if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        showError({ message: 'Confirmação de senha não confere' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      // Update profile data
      const response = await updateCurrentUserProfile(formData);

      if (response.status >= 200 && response.status < 300) {
        // Atualizar os dados locais com a resposta da API
        setUserData(response.data);

        // Change password if requested
        if (changePassword) {
          try {
            const passwordResponse = await changeCurrentUserPassword(
              passwordData.senhaAtual,
              passwordData.novaSenha
            );

            if (passwordResponse.status >= 200 && passwordResponse.status < 300) {
              showSuccess('Perfil e senha atualizados com sucesso!');
            } else {
              showSuccess('Perfil atualizado, mas houve um erro ao alterar a senha');
            }
          } catch (passwordError) {
            showSuccess('Perfil atualizado com sucesso!');
            showError(passwordError);
          }
        } else {
          showSuccess('Perfil atualizado com sucesso!');
        }

        // Reset password fields
        setPasswordData({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: ''
        });
        setChangePassword(false);

        onClose();
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (error) {
      showError(error);
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
    // Reset password fields
    setPasswordData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });
    setChangePassword(false);
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

            {/* Divider */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-redfemActionPink focus:ring-redfemActionPink border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Alterar senha
                </span>
              </label>
            </div>

            {/* Password fields - show only if changePassword is true */}
            {changePassword && (
              <>
                {/* Senha Atual */}
                <div>
                  <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="senhaAtual"
                      name="senhaAtual"
                      value={passwordData.senhaAtual}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 pr-10"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div>
                  <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="novaSenha"
                      name="novaSenha"
                      value={passwordData.novaSenha}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 pr-10"
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmarSenha"
                      name="confirmarSenha"
                      value={passwordData.confirmarSenha}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redfemActionPink focus:border-transparent disabled:bg-gray-50 pr-10"
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
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