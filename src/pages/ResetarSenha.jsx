import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; 
import { resetPassword } from "../services/userAPI";
import logoClinica from '../assets/logos/rosa-rfcc.png';
import logoKow from '../assets/logos/logoKow.jpg';
import { ButtonPrimary } from '../components/Button';

export default function ResetarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem!");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      await resetPassword({ email, password });
      setMessage("Senha alterada com sucesso! Agora você pode fazer login.");

      // redireciona após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage("Erro ao redefinir senha: " + err.message);
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

        {message && (
          <div className={`mb-4 p-3 border rounded ${
            message.includes("sucesso")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
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

        <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
          <span>Desenvolvido por</span>
          <img src={logoKow} alt="KOW" className="h-10" />
        </div>
      </div>
    </div>
  );
}
