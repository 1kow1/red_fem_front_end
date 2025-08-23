import React, { useState } from 'react';
import logoClinica from '../assets/logos/rosa-rfcc.png';
import logoKow from '../assets/logos/logoKow.jpg';
import logoBackground from '../assets/logos/Component 1.svg';
import { ButtonPrimary } from '../components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Tentativa de login com:', { email, password });
  };

  return (
    <div className="relative w-screen h-screen bg-gray-50">

      <img
        src={logoBackground}
        alt="Arte de fundo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-10 w-full h-full flex items-center justify-end pr-8 sm:pr-16 lg:pr-24">
        
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src={logoClinica} alt="Clínica Solidária" className="h-10 mb-2" />
            <h1 className="text-xl text-gray-700">Clínica Solidária</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-gray-500 hover:text-pink-500 hover:underline">
                Esqueci a senha
              </a>
            </div>

            <ButtonPrimary
              type="submit"
              className="w-full mt-6 font-bold py-3 rounded-md hover:bg-pink-600 transition-colors flex items-center justify-center"
            >
              Entrar
            </ButtonPrimary>
          </form>

          <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
            <span>Desenvolvido por</span>
            <img src={logoKow} alt="KOW" className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}