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

export default function Consultas() {
  const navigate = useNavigate();
  const { user, userCargo } = useAuth();

  // States existentes...
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editInitialData, setEditInitialData] = useState(null);
  
  // Novo state para o modal de associar formulário
  const [isModalAssociarOpen, setIsModalAssociarOpen] = useState(false);
  const [consultaParaAssociar, setConsultaParaAssociar] = useState(null);

  // States para remoção de associação
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [consultaParaRemover, setConsultaParaRemover] = useState(null);

  const avaiableFilters = filterConfigs['consultas']

  // Função existente para buscar consultas...
  const fetchConsultas = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      // Add user context for access control
      const filtersWithUserContext = {
        ...filters,
        currentUserId: user?.id,
        userCargo: userCargo
      };

      // Debug log para verificar filtros
      console.log('Filtros sendo enviados:', filtersWithUserContext);

      const data = await getConsultas(filtersWithUserContext);
      const consultasList = data.content || data.items || data || [];

      // Adaptar dados para visualização
      const adaptedConsultas = consultasList.map(consulta => adaptConsultaForView(consulta));
      setConsultas(adaptedConsultas);

    } catch (error) {
      toast.error("Erro ao carregar consultas");
    } finally {
      setLoading(false);
    }
  }, [user?.id, userCargo]);

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
      fetchConsultas();
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
      fetchConsultas();
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Erro ao editar consulta");
    }
  };

  // Função para cancelar/reativar consulta via PATCH
  const handleToggleConsulta = async (row) => {
    console.log('🚀 BOTÃO CANCELAR CLICADO!', {
      id: row.id,
      ativoAtual: row._ativoRaw,
      acao: row._ativoRaw ? 'cancelar' : 'reativar'
    });

    try {
      // Se está cancelando a consulta e há execução de formulário associada
      if (row._ativoRaw && row._execucaoFormulario) {
        const execId = row._execucaoFormulario.id || row._execucaoFormulario._exec?.id;

        if (execId) {
          console.log('🗑️ Deletando execução de formulário associada...', execId);

          try {
            await deleteExec(execId);
            console.log('✅ Execução deletada com sucesso');
          } catch (deleteError) {
            console.error('❌ Erro ao deletar execução:', deleteError);
            // Continua com o cancelamento mesmo se falhar a exclusão
          }
        }
      }

      console.log('🔄 Chamando toggleConsulta API...');
      const response = await toggleConsulta(row.id);
      console.log('✅ Toggle response:', response);

      const acao = row._ativoRaw ? 'cancelada' : 'reativada';
      toast.success(`Consulta ${acao} com sucesso!`);

      console.log('🔄 Recarregando lista de consultas...');
      fetchConsultas();

    } catch (error) {
      console.error('❌ Erro ao fazer toggle:', error);
      toast.error("Erro ao alterar status da consulta: " + error.message);
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
    fetchConsultas();
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
      toast.success("Associação removida com sucesso!");

      // Recarregar consultas para atualizar a interface
      fetchConsultas();

    } catch (error) {
      toast.error("Erro ao remover associação");
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

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  return (
    <div>
      <h1 className="text-lg mb-4">Consultas</h1>

      {loading && <p>Carregando...</p>}

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
        defaultFilters={{ status: ["PENDENTE"] }}
        // Passar todas as callbacks necessárias
        callbacks={dataFrameCallbacks}
      />

      {/* Modal de formulário existente */}
      <FormPopUp
        key={formMode === "create" ? Date.now() : editInitialData?.id ?? "edit"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Criar Consulta" : "Editar Consulta"}
        mode={formMode}
        fields={formConfigs.consultas.fields}
        validationSchema={formConfigs.consultas.validationSchema}
        initialData={formMode === "create" ? null : editInitialData}
        onSubmit={formMode === "create" ? handleCreateConsulta : handleEditConsulta}
      />

      {/* Novo modal para associar formulário */}
      <ModalAssociarFormulario
        isOpen={isModalAssociarOpen}
        onClose={() => setIsModalAssociarOpen(false)}
        consultaData={consultaParaAssociar}
        onSuccess={handleAssociacaoSuccess}
      />

      {/* Modal de confirmação para remover associação */}
      <ConfirmationPopUp
        isOpen={isConfirmRemoveOpen}
        message={`Tem certeza que deseja remover a associação do formulário "${consultaParaRemover?._execucaoFormulario?.formulario || "N/A"}" da consulta do paciente ${consultaParaRemover?.paciente || "N/A"}?`}
        onConfirm={handleConfirmRemoveAssociacao}
        onCancel={() => {
          setIsConfirmRemoveOpen(false);
          setConsultaParaRemover(null);
        }}
      />
    </div>
  );
}