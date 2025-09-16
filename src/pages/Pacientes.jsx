/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formConfigs } from "../config/formConfig";
import { adaptPacienteForView, adaptPacienteForApi } from "../adapters/pacienteAdapter";
import { getPacientes, createPaciente, editPaciente, togglePaciente } from "../services/pacienteAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { toast } from "react-toastify";
import ConfirmationPopUp from "../components/ConfirmationPopUp";
import ModalRelatorio from "../components/ModalRelatorio";
import { filterConfigs } from "../config/filterConfig";

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
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

  // modal relatório
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);
  const [pacienteRelatorio, setPacienteRelatorio] = useState(null);

  const avaiableFilters = filterConfigs['pacientes']  

  const fetchPacientes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterWithPagination = {
        ...filters,
        page: filters.page ?? page,
        size: filters.size ?? size
      };

      const data = await getPacientes(filterWithPagination);
      const mapped = data.content.map(adaptPacienteForView);

      setPacientes(mapped);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalElements);
    } catch (err) {
      setError("Erro ao buscar pacientes: " + err.message);
      toast.error("Erro ao buscar pacientes: " + err.message)
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // CREATE
  const handleCreatePaciente = async (formData) => {
    try {
      const payload = adaptPacienteForApi(formData);
      await createPaciente(payload);
      await fetchPacientes();
      setIsFormOpen(false);
      toast.success("Paciente criado com sucesso.");
    } catch (err) {
      console.error("handleCreatePaciente error:", err);

      // Se é erro de validação do Yup (client-side)
      if (err.inner && Array.isArray(err.inner)) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        toast.error("Erros de validação:", Object.values(errors).join(", "));
        return;
      }

      // Se é erro do backend (HTTP)
      const errorMessage = err?.response?.data?.message ||
                          err?.response?.data?.error ||
                          err?.message ||
                          "Erro desconhecido ao criar paciente.";

      // Verificar se é erro de email duplicado
      if (errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('já existe') ||
           errorMessage.toLowerCase().includes('duplicado') ||
           errorMessage.toLowerCase().includes('unique'))) {
        toast.error("Este email já está cadastrado no sistema. Utilize um email diferente.");
        return;
      }

      // Verificar se é erro de CPF duplicado
      if ((errorMessage.toLowerCase().includes('cpf') &&
          (errorMessage.toLowerCase().includes('já existe') ||
           errorMessage.toLowerCase().includes('duplicado') ||
           errorMessage.toLowerCase().includes('unique') ||
           errorMessage.toLowerCase().includes('already exists'))) ||
          errorMessage.toLowerCase() === 'cpf already exists') {
        toast.error("Este CPF já está cadastrado no sistema. Utilize um CPF diferente.");
        return;
      }

      toast.error(errorMessage);
    }
  };

  // EDIT
  const handleEditPaciente = async (formData) => {
    const payload = adaptPacienteForApi({ ...(editInitialData || {}), ...formData });

    await editPaciente(payload.id, payload);
    await fetchPacientes();
    setIsFormOpen(false);
    setEditInitialData(null);
    toast.success("Paciente Atualizado!")
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    setIsConfirmOpen(true);
    setRow(row);
  };

  const handleConfirmToggle = async () => {
    try {
      await togglePaciente(row.id);
      await fetchPacientes();
      toast.success("Paciente Atualizado!")
    } catch (err) {
      toast.error("Erro ao alternar status ativo:", err)
    } finally {
      setIsConfirmOpen(false);
      setRow({});
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

  // função para navegar para execução do formulário
  const handleAbrirExecucao = (execId, execData) => {
    navigate(`/execform/${execId}`, {
      state: {
        execData: execData,
        returnPath: '/pacientes'
      }
    });
  };

  // função para gerar relatório
  const handleGerarRelatorio = (pacienteData) => {
    setPacienteRelatorio(pacienteData);
    setIsRelatorioModalOpen(true);
  };

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchPacientes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPacientes]);

  return (
    <div>
      <h1 className="text-lg mb-4">Pacientes</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Paciente"
        data={pacientes}
        avaiableFilters={avaiableFilters}
        dataType="pacientes"
        formFields={formConfigs.pacientes.fields}
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onToggleRow={handleToggleActive}
        fetchData={fetchPacientes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultFilters={{ ativo: [true] }}
        callbacks={{
          onEdit: openEditForm,
          onToggle: handleToggleActive,
          onAbrirExecucao: handleAbrirExecucao,
          onGerarRelatorio: handleGerarRelatorio
        }}
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
        title={formMode === "create" ? "Criar Paciente" : "Editar Paciente"}
        mode={formMode}
        fields={formConfigs.pacientes.fields}
        validationSchema={formConfigs.pacientes.validationSchema}
        initialData={editInitialData}
        onSubmit={formMode === "create" ? handleCreatePaciente : handleEditPaciente}
        columns={2}
      />

      <ConfirmationPopUp
        isOpen={isConfirmOpen}
        message={`Tem certeza que deseja ${row.ativo ? "desativar" : "reativar"} o paciente ${row.nome}?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => { setIsConfirmOpen(false); setRow({}); }}
      />

      <ModalRelatorio
        isOpen={isRelatorioModalOpen}
        onClose={() => {
          setIsRelatorioModalOpen(false);
          setPacienteRelatorio(null);
        }}
        pacienteData={pacienteRelatorio}
        consultas={pacienteRelatorio?.consultas || []}
      />
    </div>
  );
}
