// src/pages/Consultas.jsx - Exemplo de como integrar o modal

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import ModalAssociarFormulario from "../components/ModalAssociarFormulario"; // Novo import
import ConfirmationPopUp from "../components/ConfirmationPopUp"; // Novo import
import { getConsultas, createConsulta, editConsulta } from "../services/consultaAPI";
import { deleteExec } from "../services/execAPI"; // Nova import
import { adaptConsultaForView, adaptConsultaForApi } from "../adapters/consultaAdapter";
import { formConfigs } from "../config/formConfig";
import { toast } from "react-toastify";

export default function Consultas() {
  const navigate = useNavigate();

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

  const avaiableFilters = {
    desde: ["Hoje", "Esta semana", "Este mês", "Este ano"],
    status: ["Pendente", "Cancelada", "Concluída"]
  }

  // Função existente para buscar consultas...
  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const data = await getConsultas();
      const consultasList = data.content || data.items || data || [];
      
      // Adaptar dados para visualização
      const adaptedConsultas = consultasList.map(consulta => adaptConsultaForView(consulta));
      setConsultas(adaptedConsultas);
      
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      toast.error("Erro ao carregar consultas");
    } finally {
      setLoading(false);
    }
  };

  // Callbacks existentes...
  const openCreateForm = () => {
    setFormMode("create");
    setEditInitialData(null);
    setIsFormOpen(true);
  };

  const openEditForm = (row) => {
    setFormMode("edit");
    setEditInitialData(row);
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
      console.error("Erro ao criar consulta:", error);
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
      console.error("Erro ao editar consulta:", error);
      toast.error("Erro ao editar consulta");
    }
  };

  // Nova callback para associar formulário
  const handleAssociarFormulario = (consultaData) => {
    console.log("Associar formulário para consulta:", consultaData);
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
    console.log("Remover associação para consulta:", consultaData);
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
      console.error("Erro ao remover associação:", error);
      toast.error("Erro ao remover associação");
    } finally {
      setIsConfirmRemoveOpen(false);
      setConsultaParaRemover(null);
    }
  };

  // Nova função para navegar para execução do formulário
  const handleAbrirExecucao = (execId, execData) => {
    console.log("Navegando para execução:", execId, execData);
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
    onToggle: (row) => console.log("Toggle consulta:", row),
    onAssociarFormulario: handleAssociarFormulario, // Nova callback
    onRemoverAssociacao: handleRemoverAssociacao, // Nova callback
    onAbrirExecucao: handleAbrirExecucao // Callback para abrir execução
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

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
        fields={formConfigs.consultas}
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
        message={`Tem certeza que deseja remover a associação do formulário "${consultaParaRemover?._execucaoFormulario?.formulario || "N/A"}"?`}
        onConfirm={handleConfirmRemoveAssociacao}
        onCancel={() => {
          setIsConfirmRemoveOpen(false);
          setConsultaParaRemover(null);
        }}
      />
    </div>
  );
}