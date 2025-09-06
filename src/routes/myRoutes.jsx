import { Route, Routes, Navigate } from "react-router-dom"; // ← Adicione -dom
import Login from "../pages/Login";
import Layout from "../components/Layout";
import Consultas from "../pages/Consultas";
import Pacientes from "../pages/Pacientes";
import Formularios from "../pages/Formularios";
import Usuarios from "../pages/Usuarios";
import FormularioEditor from "../pages/FormularioEditor";
import ResetarSenha from "../pages/ResetarSenha";
import { useAuth } from "../contexts/auth";

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function MyRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Redirecionar / para login ou dashboard */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/consultas" replace /> : <Login />
        }
      />
      <Route path="/resetarSenha" element={<ResetarSenha />} />

      {/* Página de login - redireciona se já autenticado */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/consultas" replace /> : <Login />
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="consultas" element={<Consultas />} />
        <Route path="formularios" element={<Formularios />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>

      {/* Rota do editor também protegida */}
      <Route
        path="/editform"
        element={
          <ProtectedRoute>
            <FormularioEditor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default MyRoutes;
