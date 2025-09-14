import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ButtonPrimary, ButtonSecondary } from "./Button";
import { getForms } from "../services/formAPI";
import { createExec } from "../services/execAPI"; // Usando sua API existente
import { toast } from "react-toastify";

export default function ModalAssociarFormulario({ 
  isOpen, 
  onClose, 
  consultaData,
  onSuccess 
}) {
  const [formularios, setFormularios] = useState([]);
  const [selectedFormularioId, setSelectedFormularioId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Carregar formulários quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadFormularios();
    }
  }, [isOpen]);

  const loadFormularios = async () => {
    setLoading(true);
    try {
      const response = await getForms();
      const formsList = response.content || response.items || response || [];
      
      // Filtrar apenas formulários liberados para uso
      const formulariosLiberados = formsList.filter(form => 
        form.liberadoParaUso === true || form.liberadoParaUso === "true"
      );
      
      setFormularios(formulariosLiberados);
    } catch (error) {
      console.error("Erro ao carregar formulários:", error);
      toast.error("Erro ao carregar formulários disponíveis");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFormularioId) {
      toast.error("Selecione um formulário");
      return;
    }

    if (!consultaData) {
      toast.error("Dados da consulta não disponíveis");
      return;
    }

    setSubmitting(true);
    try {
      console.log(consultaData)
      // Extrair ID do médico de diferentes possíveis localizações
      const medicoId = consultaData._medicoId ||
                       consultaData.medicoId ||
                       consultaData.usuarioDTO?.id ||
                       consultaData.usuarioDTO?._id;

      console.log("Dados da consulta recebidos:", consultaData);
      console.log("ID do médico extraído:", medicoId);

      if (!medicoId) {
        toast.error("ID do médico não encontrado nos dados da consulta");
        return;
      }

      // Montar payload conforme especificado
      const payload = {
        usuarioDTO: {
          id: medicoId
        },
        formularioId: selectedFormularioId,
        idConsulta: consultaData.id,
        respostas: []
      };

      console.log("Associando formulário à consulta:", payload);

      await createExec(payload); // Usando sua função existente
      
      toast.success("Formulário associado com sucesso!");
      
      // Callback para atualizar a interface pai
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (error) {
      console.error("Erro ao associar formulário:", error);
      const message = error?.response?.data?.message || 
                     error?.message || 
                     "Erro ao associar formulário";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFormularioId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Associar Formulário</h2>
          <button 
            onClick={handleClose} 
            className="text-2xl font-light hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Informações da consulta */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Consulta:</p>
            <p className="font-medium">{consultaData?.pacienteNome || "N/A"}</p>
            <p className="text-sm text-gray-500">
              Médico: {consultaData?.medicoNome || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Data: {consultaData?.dataHora || "N/A"}
            </p>
          </div>

          {/* Seleção de formulário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Formulário:
            </label>
            
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Carregando formulários...</p>
              </div>
            ) : (
              <select
                value={selectedFormularioId}
                onChange={(e) => setSelectedFormularioId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">Selecione um formulário</option>
                {formularios.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.titulo || form.title} - {form.especialidade}
                  </option>
                ))}
              </select>
            )}
            
            {formularios.length === 0 && !loading && (
              <p className="text-sm text-red-500 mt-2">
                Nenhum formulário liberado encontrado
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <ButtonSecondary onClick={handleClose} disabled={submitting}>
            Cancelar
          </ButtonSecondary>
          <ButtonPrimary 
            onClick={handleSubmit} 
            disabled={submitting || !selectedFormularioId || loading}
          >
            {submitting ? "Associando..." : "Associar Formulário"}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}