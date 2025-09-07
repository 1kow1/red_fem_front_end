/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState } from "react";
import { formConfigs } from "../configs/formConfigs";
import { adaptUserForView, adaptUserForApi } from "../adapters/userAdapter";
import { getUsers, createUser, editUser, toggleUser } from "../services/userAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { userSchema } from "../validation/validationSchemas";
import { toast } from "react-toastify";

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
  const [formMode, setFormMode] = useState("create"); // create | edit
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
      await userSchema.validate(formData, { abortEarly: false });

      // Com o await, teriamos que esperar de 5-10 segundos para o e-mail ser enviado
      createUser(formData)
        .then(() => fetchUsers())
        .catch((err) => console.error("Erro ao criar usuário:", err));
  
      setIsFormOpen(false);
  
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      toast.error("Erros de validação ao criar usuário:", errors)
    }
  };

  // EDIT
  const handleEditUser = async (formData) => {
    await userSchema.validate(formData, {àbortEarly:false})
    const payload = adaptUserForApi({ ...(editInitialData || {}), ...formData });
    
    await editUser(payload.id, payload);
    await fetchUsers();
    toast.success("Usuário Atualizado!")
    setIsFormOpen(false);
    setEditInitialData(null);
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    console.log("ID: " +row.id);
    try {
      await toggleUser(row.id);
      await fetchUsers();
      toast.success("Usuário Atualizado!")
    } catch (err) {
      toast.error("Erro ao Desativar/Reativar o usuário")
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
        onToggleRow={handleToggleActive}
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
        validationSchema={userSchema}
      />
    </div>
  );
}
