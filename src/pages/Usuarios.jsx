import { useEffect, useState } from "react";
import DataFrame from "../components/DataFrame";
import { formConfigs } from "../configs/formConfigs";
import { getUsers } from "../api/user";
import { createUser } from "../api/user";
import { format, parseISO } from "date-fns";

export default function Usuarios() {
  const filterQuery = (usuario, searchQuery) => {
    const removeAccents = (string) =>
      string
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const nomeMatch = removeAccents(usuario.nome || "").includes(
      removeAccents(searchQuery)
    );
    const emailMatch = removeAccents(usuario.email || "").includes(
      removeAccents(searchQuery)
    );
    const funcaoMatch = removeAccents(usuario.funcao || "").includes(
      removeAccents(searchQuery)
    );

    return nomeMatch || emailMatch || funcaoMatch;
  };

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers(null, page, size);

      const mapped = data.content.map((u) => ({
        ...u,
        ativo: u.ativo ? "Sim" : "Não",
        dataCriacao: format(parseISO(u.dataCriacao), "dd/MM/yyyy hh:MM:ss"),
        dataAtualizacao: format(parseISO(u.dataAtualizacao),"dd/MM/yyyy hh:MM:ss"),
      }));

      setUsers(mapped);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Erro ao buscar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size]);

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData, null);
      fetchUsers();               
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
    }
  };

  return (
    <div>
      <h1 className="text-lg mb-4">Usuários</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Usuário"
        filterQuery={filterQuery}
        data={users}
        dataType="usuarios"
        formFields={formConfigs.usuarios}
        handleCreate={handleCreateUser}
      />

      {/* paginação bem simpleszinha */}
      <div className="mt-4">
        <button className="mr-2" disabled={page === 0}onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <button className="mr-2"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
