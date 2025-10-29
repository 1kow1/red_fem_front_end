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
import { useAuth } from "../contexts/auth/useAuth";

export default function Usuarios() {
  const { user: currentUser } = useAuth();
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

      // Ordenar usuários por nome (alfabeticamente)
      const sortedUsers = mapped.sort((a, b) => {
        const nameA = (a.nome || '').toLowerCase();
        const nameB = (b.nome || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setUsers(sortedUsers);
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
    // Impedir que o usuário desative a si mesmo
    if (currentUser && row.id === currentUser.id && row.ativo === "Sim") {
      toast.error("Você não pode desativar seu próprio usuário!");
      return;
    }

    // Se está tentando desativar (ativo = "Sim"), verificar se tem consultas futuras
    if (row.ativo === "Sim") {
      try {
        // Buscar consultas futuras deste médico
        const hoje = new Date().toISOString().split('T')[0];
        const url = `${import.meta.env.VITE_API_BASE_URL}/consultas/buscar?medicoIds=${row.id}&dataInicio=${hoje}&status=PENDENTE&size=1`;

        console.log('🔍 Verificando consultas futuras para usuário:', row.id);
        console.log('📅 Data de início:', hoje);
        console.log('🔗 URL:', url);

        const response = await fetch(url, {
          credentials: 'include'
        });

        console.log('📡 Status da resposta:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Dados retornados:', data);

          if (data.totalElements > 0) {
            toast.error(`Não é possível desativar este usuário pois há ${data.totalElements} consulta(s) agendada(s).`);
            return;
          }
          console.log('✅ Nenhuma consulta futura encontrada, pode desativar');
        } else {
          console.error('❌ Erro na resposta:', response.status);
          const errorText = await response.text();
          console.error('Detalhes do erro:', errorText);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar consultas:', error);
        // Continuar mesmo com erro na verificação
      }
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // debounce search - quando busca muda, resetar página
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setPage]);

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
        title={formMode === "create" ? "Adicionar Usuário" : "Editar Usuário"}
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
