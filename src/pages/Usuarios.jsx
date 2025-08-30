import { useEffect, useState } from "react";
import DataFrame from "../components/DataFrame";
import { formConfigs } from "../configs/formConfigs";
import { getUsers } from "../api/user";
import { createUser } from "../api/user";
import { format, parseISO } from "date-fns";
import { PaginationFooter } from "../components/PaginationFooter";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers(searchQuery, page, size);

      const mapped = data.content.map((u) => ({
        ...u,
        ativo: u.ativo ? "Sim" : "Não",
        dataCriacao: format(parseISO(u.dataCriacao), "dd/MM/yyyy HH:mm:ss"),
        dataAtualizacao: format(parseISO(u.dataAtualizacao), "dd/MM/yyyy HH:mm:ss"),
      }));

      setUsers(mapped);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Erro ao buscar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData, null);
      fetchUsers();
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
    }
  };

  useEffect(() => {
    if (!isSearchTriggered) {
      fetchUsers();
    }
    setIsSearchTriggered(false);
  }, [page, size]);
  
  // UseEffect para searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearchTriggered(true)/
      fetchUsers(true);
    }, 500);
  
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <h1 className="text-lg mb-4">Usuários</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Usuário"
        data={users}
        dataType="usuarios"
        formFields={formConfigs.usuarios}
        handleCreate={handleCreateUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fetchData={fetchUsers}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
