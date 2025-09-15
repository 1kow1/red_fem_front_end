import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../components/Layout";
import Consultas from "../pages/Consultas";
import Pacientes from "../pages/Pacientes";
import Formularios from "../pages/Formularios";
import Usuarios from "../pages/Usuarios";
import Ajuda from "../pages/Ajuda";
import FormularioEditor from "../pages/FormularioEditor";
import ResetarSenha from "../pages/ResetarSenha";
import ExecucaoFormulario from "../pages/ExecucaoFormulario";

// Páginas de erro
import NotFound from "../pages/errors/NotFound";

// Componentes de proteção
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import { useAuth } from "../contexts/auth";
import { PERMISSIONS } from "../utils/permissions";

function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
}

function MyRoutes() {
  const { isAuthenticated, isLoading, defaultPage } = useAuth();

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
          isAuthenticated ? <Navigate to={defaultPage || "/consultas"} replace /> : <Login />
        }
      />

      <Route path="/resetarSenha" element={<ResetarSenha />} />

      {/* Páginas de erro */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/404" element={<NotFound />} />

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

        {/* Consultas - Acessível por todos os cargos */}
        <Route
          path="consultas"
          element={
            <RoleProtectedRoute allowedRoles={PERMISSIONS.consultas}>
              <Consultas />
            </RoleProtectedRoute>
          }
        />

        {/* Formulários - Apenas MÉDICO e ADMINISTRADOR */}
        <Route
          path="formularios"
          element={
            <RoleProtectedRoute allowedRoles={PERMISSIONS.formularios}>
              <Formularios />
            </RoleProtectedRoute>
          }
        />

        {/* Pacientes - Apenas RECEPCIONISTA e ADMINISTRADOR */}
        <Route
          path="pacientes"
          element={
            <RoleProtectedRoute allowedRoles={PERMISSIONS.pacientes}>
              <Pacientes />
            </RoleProtectedRoute>
          }
        />

        {/* Usuários - Apenas RECEPCIONISTA e ADMINISTRADOR */}
        <Route
          path="usuarios"
          element={
            <RoleProtectedRoute allowedRoles={PERMISSIONS.usuarios}>
              <Usuarios />
            </RoleProtectedRoute>
          }
        />

        {/* Ajuda - Acessível por todos os usuários autenticados */}
        <Route path="ajuda" element={<Ajuda />} />
      </Route>

      {/* Rota do editor - Protegida para MÉDICO e ADMINISTRADOR */}
      <Route
        path="/editform"
        element={
          <RoleProtectedRoute allowedRoles={PERMISSIONS.formularios}>
            <FormularioEditor />
          </RoleProtectedRoute>
        }
      />

      {/* Rota do execução formulário - Todos os cargos */}
      <Route
        path="/execform/:execId"
        element={
          <RoleProtectedRoute allowedRoles={PERMISSIONS.consultas}>
            <ExecucaoFormulario />
          </RoleProtectedRoute>
        }
      />

      {/* catch-all: página 404 para usuários autenticados, login para não autenticados */}
      <Route
        path="*"
        element={
          isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default MyRoutes;
