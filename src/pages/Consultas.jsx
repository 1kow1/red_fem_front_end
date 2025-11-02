// src/pages/Consultas.jsx - Exemplo de como integrar o modal

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import ModalAssociarFormulario from "../components/ModalAssociarFormulario"; // Novo import
import ConfirmationPopUp from "../components/ConfirmationPopUp"; // Novo import
import { getConsultas, createConsulta, editConsulta, toggleConsulta } from "../services/consultaAPI";
import { deleteExec } from "../services/execAPI"; // Nova import
import { adaptConsultaForView, adaptConsultaForApi } from "../adapters/consultaAdapter";
import { formConfigs } from "../config/formConfig";
import { toast } from "react-toastify";
import { filterConfigs } from "../config/filterConfig";
import { useAuth } from "../contexts/auth";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { useGuidedTour } from "../hooks/useGuidedTour";
import { getTourForPage } from "../config/toursConfig";

export default function Consultas() {
  const navigate = useNavigate();
  const { user, userCargo } = useAuth();

  // Tour guiado
  const tourSteps = getTourForPage('consultas');
  const { startTour } = useGuidedTour('consultas', tourSteps || []);

  // States existentes...
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editInitialData, setEditInitialData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginação
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
  
  // Novo state para o modal de associar formulário
  const [isModalAssociarOpen, setIsModalAssociarOpen] = useState(false);
  const [consultaParaAssociar, setConsultaParaAssociar] = useState(null);

  // States para remoção de associação
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [consultaParaRemover, setConsultaParaRemover] = useState(null);

  // States para cancelamento de consulta
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [consultaParaCancelar, setConsultaParaCancelar] = useState(null);

  const avaiableFilters = filterConfigs['consultas']

  // Função existente para buscar consultas...
  const fetchConsultas = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      // Add user context for access control and pagination
      const filtersWithUserContext = {
        ...filters,
        currentUserId: user?.id,
        userCargo: userCargo,
        page: filters.page ?? page,
        size: filters.size ?? size
      };

      const data = await getConsultas(filtersWithUserContext);
      const consultasList = data.content || data.items || data || [];

      // Adaptar dados para visualização
      const adaptedConsultas = consultasList.map(consulta => adaptConsultaForView(consulta));
      setConsultas(adaptedConsultas);

      // Atualizar informações de paginação
      setTotalPages(data.totalPages || 0);
      setTotalRecords(data.totalElements || consultasList.length);

    } catch (error) {
      toast.error("Erro ao carregar consultas");
    } finally {
      setLoading(false);
    }
  }, [user?.id, userCargo, page, size, setTotalPages, setTotalRecords]);

  // Callbacks existentes...
  const openCreateForm = () => {
    setFormMode("create");
    setEditInitialData(null);
    setIsFormOpen(true);
  };

  const openEditForm = (row) => {
    // Verificar se há execução de formulário liberada
    if (row._execucaoFormulario && row._execucaoFormulario.isLiberado === true) {
      toast.warning("Esta consulta não pode ser editada pois possui um formulário liberado associado.");
      return;
    }

    // Preparar dados para edição convertendo campos ocultos para os nomes que o formulário espera
    const editData = {
      id: row.id,
      patientId: row._patientId,
      medicoId: row._medicoId,
      dataConsulta: row._dataConsulta,
      horario: row._horario,
      tipoConsulta: row.tipoConsulta,
      status: row.status,
      ativo: row._ativoRaw
    };

    setFormMode("edit");
    setEditInitialData(editData);
    setIsFormOpen(true);
  };

  // Funções para criar e editar consultas
  const handleCreateConsulta = async (data) => {
    try {
      const adaptedData = adaptConsultaForApi(data);
      await createConsulta(adaptedData);
      toast.success("Consulta criada com sucesso!");
      fetchConsultas({ status: ["PENDENTE"] }); // Aplicar filtros padrão
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Erro ao criar consulta");
    }
  };

  const handleEditConsulta = async (data) => {
    try {
      const id = data.id || editInitialData?.id;
      const adaptedData = adaptConsultaForApi(data);
      await editConsulta(id, adaptedData);
      toast.success("Consulta atualizada com sucesso!");
      fetchConsultas({ status: ["PENDENTE"] }); // Aplicar filtros padrão
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Erro ao editar consulta");
    }
  };

  // Função para cancelar/reativar consulta via PATCH
  const handleToggleConsulta = (row) => {
    // Abrir modal de confirmação
    setConsultaParaCancelar(row);
    setIsConfirmCancelOpen(true);
  };

  // Confirmar cancelamento/reativação da consulta
  const handleConfirmToggleConsulta = async () => {
    try {
      const row = consultaParaCancelar;

      // Se está cancelando a consulta e há execução de formulário associada
      if (row._ativoRaw && row._execucaoFormulario) {
        const execId = row._execucaoFormulario.id || row._execucaoFormulario._exec?.id;

        if (execId) {
          try {
            await deleteExec(execId);
          } catch (deleteError) {
            // Continua com o cancelamento mesmo se falhar a exclusão
          }
        }
      }

      const response = await toggleConsulta(row.id);

      const acao = row._ativoRaw ? 'cancelada' : 'reativada';
      toast.success(`Consulta ${acao} com sucesso!`);

      fetchConsultas({ status: ["PENDENTE"] }); // Aplicar filtros padrão

    } catch (error) {
      toast.error("Erro ao alterar status da consulta: " + error.message);
    } finally {
      setIsConfirmCancelOpen(false);
      setConsultaParaCancelar(null);
    }
  };

  // Nova callback para associar formulário
  const handleAssociarFormulario = (consultaData) => {
    setConsultaParaAssociar(consultaData);
    setIsModalAssociarOpen(true);
  };

  // Callback quando associação é bem-sucedida
  const handleAssociacaoSuccess = () => {
    // Recarregar consultas para mostrar a nova execução
    fetchConsultas({ status: ["PENDENTE"] }); // Aplicar filtros padrão
    setIsModalAssociarOpen(false);
    setConsultaParaAssociar(null);
  };

  // Nova callback para remover associação
  const handleRemoverAssociacao = (consultaData) => {
    setConsultaParaRemover(consultaData);
    setIsConfirmRemoveOpen(true);
  };

  // Confirmar remoção da associação
  const handleConfirmRemoveAssociacao = async () => {
    try {
      const execId = consultaParaRemover._execucaoFormulario?.id ||
                     consultaParaRemover._execucaoFormulario?._exec?.id;

      if (!execId) {
        toast.error("ID da execução não encontrado");
        return;
      }

      await deleteExec(execId);
      toast.success("Vínculo removido com sucesso!");

      // Recarregar consultas para atualizar a interface
      fetchConsultas({ status: ["PENDENTE"] }); // Aplicar filtros padrão

    } catch (error) {
      toast.error("Erro ao remover vínculo");
    } finally {
      setIsConfirmRemoveOpen(false);
      setConsultaParaRemover(null);
    }
  };

  // Nova função para navegar para execução do formulário
  const handleAbrirExecucao = (execId, execData) => {
    // Navegar para a página de execução com o ID como parâmetro
    navigate(`/execform/${execId}`, {
      state: {
        execData: execData, // Dados completos da execução
        returnPath: '/consultas' // Para voltar para consultas
      }
    });
  };

  // Atualizar o DataFrame para incluir a nova callback
  const dataFrameCallbacks = {
    onEdit: openEditForm,
    onToggle: handleToggleConsulta,
    onAssociarFormulario: handleAssociarFormulario, // Nova callback
    onRemoverAssociacao: handleRemoverAssociacao, // Nova callback
    onAbrirExecucao: handleAbrirExecucao // Callback para abrir execução
  };

  // debounce search - quando busca muda, resetar página
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setPage]);

  return (
    <div>
      <h1 className="text-lg mb-4">Consultas</h1>

      <DataFrame
        title="Consulta"
        data={consultas}
        avaiableFilters={avaiableFilters}
        dataType="consultas"
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onToggleRow={dataFrameCallbacks.onToggle}
        onAssociarFormulario={dataFrameCallbacks.onAssociarFormulario}
        fetchData={fetchConsultas}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultFilters={{ status: ["PENDENTE"] }}
        page={page}
        size={size}
        setPage={setPage}
        // Passar tour guiado e ajuda
        onStartTour={startTour}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        // Passar todas as callbacks necessárias
        callbacks={dataFrameCallbacks}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
        size={size}
      />

      {/* Modal de formulário existente */}
      <FormPopUp
        key={formMode === "create" ? Date.now() : editInitialData?.id ?? "edit"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Adicionar Consulta" : "Editar Consulta"}
        mode={formMode}
        fields={formConfigs.consultas.fields}
        validationSchema={formConfigs.consultas.validationSchema}
        initialData={formMode === "create" ? null : editInitialData}
        onSubmit={formMode === "create" ? handleCreateConsulta : handleEditConsulta}
      />

      {/* Novo modal para vincular formulário */}
      <ModalAssociarFormulario
        isOpen={isModalAssociarOpen}
        onClose={() => setIsModalAssociarOpen(false)}
        consultaData={consultaParaAssociar}
        onSuccess={handleAssociacaoSuccess}
      />

      {/* Modal de confirmação para remover vínculo */}
      <ConfirmationPopUp
        isOpen={isConfirmRemoveOpen}
        message={`Tem certeza que deseja remover o vínculo do formulário "${consultaParaRemover?._execucaoFormulario?.formulario || "N/A"}" da consulta do paciente ${consultaParaRemover?.paciente || "N/A"}?`}
        onConfirm={handleConfirmRemoveAssociacao}
        onCancel={() => {
          setIsConfirmRemoveOpen(false);
          setConsultaParaRemover(null);
        }}
      />

      {/* Modal de confirmação para cancelar/reativar consulta */}
      <ConfirmationPopUp
        isOpen={isConfirmCancelOpen}
        message={
          consultaParaCancelar?._ativoRaw
            ? `Tem certeza que deseja cancelar a consulta do paciente ${consultaParaCancelar?.paciente || "N/A"} marcada para ${consultaParaCancelar?.dataHora || "N/A"}?${consultaParaCancelar?._execucaoFormulario ? '\n\nAtenção: O formulário associado a esta consulta será removido.' : ''}`
            : `Tem certeza que deseja reativar a consulta do paciente ${consultaParaCancelar?.paciente || "N/A"}?`
        }
        onConfirm={handleConfirmToggleConsulta}
        onCancel={() => {
          setIsConfirmCancelOpen(false);
          setConsultaParaCancelar(null);
        }}
      />
    </div>
  );
}