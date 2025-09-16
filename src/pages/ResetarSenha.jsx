import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword, validateToken } from "../services/userAPI";
import logoClinica from '../assets/logos/rosa-rfcc.png';
import logoKow from '../assets/logos/logoKow.jpg';
import { ButtonPrimary } from '../components/Button';
import { useErrorHandler } from '../hooks/useErrorHandler';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { useErrorHandler as useBackendErrorHandler } from '../utils/errorHandling';

export default function ResetarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useErrorHandler();
  const { applyFormErrors, extractValidationErrors } = useBackendErrorHandler();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [validating, setValidating] = useState(true);
  const [backendErrors, setBackendErrors] = useState({});
  const token = searchParams.get("token");

  // Validação de senha
  const { validation, isPasswordValid } = usePasswordValidation(password);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setMessage("Token de reset inválido ou expirado. Solicite um novo link de recuperação.");
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        await validateToken(token);
        setTokenValid(true);
      } catch (error) {
        const errorMessage = showError(error);
        setMessage("Token inválido ou expirado. Solicite um novo link de recuperação.");
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpar erros anteriores
    setMessage(null);
    setBackendErrors({});

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem!");
      return;
    }

    // Validação de complexidade da senha
    if (!isPasswordValid(password)) {
      setMessage("A senha não atende aos requisitos de complexidade!");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ token, senha: password });
      showSuccess("Senha alterada com sucesso! Agora você pode fazer login.");

      // redireciona após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      // Tentar extrair erros de validação do backend
      const validationErrors = extractValidationErrors(err);

      if (Object.keys(validationErrors).length > 0) {
        setBackendErrors(validationErrors);
        // Se há erro específico de senha, mostrar
        if (validationErrors.senha) {
          setMessage(validationErrors.senha);
        }
      } else {
        showError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoClinica} alt="Clínica Solidária" className="h-10 mb-2" />
          <h1 className="text-xl text-gray-700">Clinica Solidária</h1>
          <h5 className="text-lg text-gray-700 font-extrabold">Redefinir Senha</h5>
        </div>

        {validating && (
          <div className="mb-4 p-3 border rounded bg-blue-100 border-blue-400 text-blue-700">
            Validando token...
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 border rounded ${
            message.includes("sucesso")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {!validating && tokenValid && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  backendErrors.senha ? 'border-red-500' : 'border-gray-200'
                }`}
                required
              />
              {backendErrors.senha && (
                <div className="text-red-500 text-sm mt-1">
                  {backendErrors.senha}
                </div>
              )}
              <PasswordStrengthIndicator
                password={password}
                showValidation={true}
                className="mt-2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
                minLength={6}
              />
            </div>

            <ButtonPrimary
              type="submit"
              disabled={loading}
              className="w-full mt-4 font-bold py-3 rounded-md hover:bg-pink-600 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Alterar senha"}
            </ButtonPrimary>
          </form>
        )}

        {!validating && tokenValid === false && (
          <div className="text-center">
            <ButtonPrimary
              onClick={() => navigate("/login")}
              className="w-full mt-4 font-bold py-3 rounded-md hover:bg-pink-600 transition-colors flex items-center justify-center"
            >
              Voltar ao Login
            </ButtonPrimary>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
          <span>Desenvolvido por</span>
          <img src={logoKow} alt="KOW" className="h-10" />
        </div>
      </div>
    </div>
  );
}
