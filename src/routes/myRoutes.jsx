import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../components/Layout";
import Consultas from "../pages/Consultas";
import Pacientes from "../pages/Pacientes";
import Formularios from "../pages/Formularios";
import Usuarios from "../pages/Usuarios";
import FormularioEditor from "../pages/FormularioEditor";
import ResetarSenha from "../pages/ResetarSenha";
import { useAuth } from "../contexts/auth";
import ExecucaoFormulario from "../pages/ExecucaoFormulario";

function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
}

function MyRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Se estiver carregando, evita decidir redirecionamento na rota /login
  if (isLoading || isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/consultas" replace /> : <Login />
        }
      />

      <Route path="/resetarSenha" element={<ResetarSenha />} />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="consultas" replace />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="formularios" element={<Formularios />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>

      {/* Rota do editor  */}
      <Route path="/editform" element={<FormularioEditor />} />
      
      {/* Rota do execucao formulario  */}
      <Route path="/execform/:execId" element={<ExecucaoFormulario />} />

      {/* catch-all: redireciona para /login ou /consultas conforme auth */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/consultas" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default MyRoutes;
