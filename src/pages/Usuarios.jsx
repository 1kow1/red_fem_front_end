/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState } from "react";
import { formConfigs } from "../configs/formConfigs";
import { adaptUserForView, adaptUserForApi } from "../adapters/userAdapter";
import { getUsers, createUser, editUser, toggleUser } from "../api/userAPI";
import { PaginationFooter } from "../components/PaginationFooter";


export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // modal control
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [editInitialData, setEditInitialData] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers(searchQuery, page, size);
      const mapped = data.content.map(adaptUserForView);

      setUsers(mapped);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Erro ao buscar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData, null);
      await fetchUsers();
      setIsFormOpen(false);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
    }
  };

  // EDIT
  const handleEditUser = async (formData) => {
    const payload = adaptUserForApi({ ...(editInitialData || {}), ...formData });
  
    await editUser(null, payload.id, payload);
    await fetchUsers();
    setIsFormOpen(false);
    setEditInitialData(null);
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    console.log("ID: " +row.id);
    try {
      await toggleUser(null, row.id);
      await fetchUsers();
    } catch (err) {
      console.error("Erro ao alternar status ativo:", err);
    }
  };

  // abrir criação
  const openCreateForm = () => {
    setFormMode("create");
    setEditInitialData(null);
    setIsFormOpen(true);
  };

  // abrir edição // DataFrame -> Table -> DetailsPopup -> chama onEditRow
  const openEditForm = (row) => {
    setFormMode("edit");
    setEditInitialData(row);
    setIsFormOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
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
        // Passa TODOS os handlers pra DataFrame/Table
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onDeleteRow={handleToggleActive}
        onReactivateRow={handleToggleActive}
        fetchData={fetchUsers}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <FormPopUp
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Criar Usuário" : "Editar Usuário"}
        fields={formConfigs.usuarios}
        initialData={editInitialData}
        onSubmit={formMode === "create" ? handleCreateUser : handleEditUser}
      />
    </div>
  );
}
