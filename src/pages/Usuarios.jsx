/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState, useCallback } from "react";
import { formConfigs } from "../config/formConfig";
import { filterConfigs } from "../config/filterConfig";
import { adaptUserForView, adaptUserForApi } from "../adapters/userAdapter";
import { getUsers, createUser, editUser, toggleUser } from "../services/userAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { toast } from "react-toastify";
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import ModalAlterarSenha from "../components/ModalAlterarSenha";
import { handleApiError } from "../utils/errorHandler";

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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);

  const avaiableFilters = filterConfigs['usuarios']

  const fetchUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterWithPagination = {
        ...filters,
        buscaGenerica: filters.buscaGenerica ?? searchQuery,
        page: filters.page ?? page,
        size: filters.size ?? size
      };

      const data = await getUsers(filterWithPagination);
      const mapped = data.content.map(adaptUserForView);

      setUsers(mapped);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalElements);
    } catch (err) {
      setError("Erro ao buscar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, size]);

  // CREATE
  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData);
      await fetchUsers({ ativos: [true] }); // Aplicar filtros padrão
      setIsFormOpen(false);
      toast.success("Usuário criado com sucesso.");
    } catch (err) {
      // Se é erro de validação do Yup (client-side)
      if (err.inner && Array.isArray(err.inner)) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        toast.error("Erros de validação:", Object.values(errors).join(", "));
        return;
      }

      // Usar o handler centralizado para erros da API
      const errorResult = handleApiError(err);
      toast.error(errorResult.message);
    }
  };

  // EDIT
  const handleEditUser = async (formData) => {
    const payload = adaptUserForApi({
      ...(editInitialData || {}),
      ...formData,
    });

    await editUser(payload.id, payload);
    await fetchUsers({ ativos: [true] }); // Aplicar filtros padrão
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
      await fetchUsers({ ativos: [true] }); // Aplicar filtros padrão
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

  // alterar senha
  const handleChangePassword = (row) => {
    setUserToChangePassword(row);
    setIsChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setUserToChangePassword(null);
    setIsChangePasswordOpen(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

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
        onChangePassword={handleChangePassword}
        fetchData={fetchUsers}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultFilters={{ ativos: [true] }}
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

      <ModalAlterarSenha
        isOpen={isChangePasswordOpen}
        onClose={handleCloseChangePassword}
        userData={userToChangePassword}
      />
    </div>
  );
}
