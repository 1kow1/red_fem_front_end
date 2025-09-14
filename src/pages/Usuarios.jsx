/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState } from "react";
import { formConfigs } from "../config/formConfig";
import { filterConfigs } from "../config/filterConfig";
import { adaptUserForView, adaptUserForApi } from "../adapters/userAdapter";
import { getUsers, createUser, editUser, toggleUser } from "../services/userAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { toast } from "react-toastify";
import ConfirmationPopUp from "../components/ConfirmationPopUp";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalRecords,
    setTotalRecords,
    resetPagination,
  } = usePagination();

  // modal control
  const [row, setRow] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [editInitialData, setEditInitialData] = useState(null);

  const avaiableFilters = filterConfigs['usuarios']

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers(searchQuery, page, size);
      const mapped = data.content.map(adaptUserForView);

      setUsers(mapped);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalElements);
    } catch (err) {
      setError("Erro ao buscar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleCreateUser = async (formData) => {
    try {
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
      toast.error("Erros de validação ao criar usuário:", errors);
    }
  };

  // EDIT
  const handleEditUser = async (formData) => {
    const payload = adaptUserForApi({
      ...(editInitialData || {}),
      ...formData,
    });

    await editUser(payload.id, payload);
    await fetchUsers();
    toast.success("Usuário Atualizado!");
    setIsFormOpen(false);
    setEditInitialData(null);
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    setIsConfirmOpen(true);
    setRow(row);
  };

  const handleConfirmToggle = async () => {
    try {
      await toggleUser(row.id);
      await fetchUsers();
      toast.success("Usuário atualizado com sucesso!");
    }
    catch (err) {
      toast.error("Erro ao atualizar usuário");
    }
    finally {
      setIsConfirmOpen(false);
      setRow({});
    }
  }

  // abrir criação
  const openCreateForm = () => {
    setEditInitialData({});
    setFormMode("create");
    setIsFormOpen(true);
  };

  // abrir edição // DataFrame -> Table -> DetailsPopup -> chama onEditRow
  const openEditForm = (row) => {
    setEditInitialData(row);
    setFormMode("edit");
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
        avaiableFilters={avaiableFilters}
        dataType="usuarios"
        formFields={formConfigs.usuarios.fields}
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
        totalRecords={totalRecords}
        onPageChange={setPage}
        size={size}
      />

      <FormPopUp
        key={formMode === "create" ? Date.now() : editInitialData?.id ?? "edit"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Criar Usuário" : "Editar Usuário"}
        mode={formMode}
        fields={formConfigs.usuarios.fields}
        validationSchema={formConfigs.usuarios.validationSchema}
        initialData={formMode === "create" ? null : editInitialData}
        onSubmit={formMode === "create" ? handleCreateUser : handleEditUser}
      />

      <ConfirmationPopUp
        isOpen={isConfirmOpen}
        message={`Tem certeza que deseja ${row.ativo ? "desativar" : "reativar"} o usuário ${row.nome}?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => { setIsConfirmOpen(false); setRow({}); }}
      />
    </div>
  );
}
