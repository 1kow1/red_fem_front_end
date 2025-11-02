/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import { useEffect, useState, useCallback } from "react";
import { adaptFormForView } from "../adapters/formAdapter";
import { getForms, getFormById, toggleForm } from "../services/formAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { filterConfigs } from "../config/filterConfig";
import { useAuth } from "../contexts/auth";
import { generateFormularioCSVReport } from "../utils/reportUtils";
import { useGuidedTour } from "../hooks/useGuidedTour";
import { getTourForPage } from "../config/toursConfig";

export default function Formularios() {
  const { user, userCargo } = useAuth();
  const [forms, setForms] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  // Tour guiado
  const tourSteps = getTourForPage('formularios');
  const { startTour } = useGuidedTour('formularios', tourSteps || []);

  const avaiableFilters = filterConfigs['formularios'];

  // FETCH
  const fetchForms = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const filterWithPagination = {
        ...filters,
        page: filters.page ?? page,
        size: filters.size ?? size,
        userCargo: userCargo,
        userEspecialidade: user?.especialidade
      };

      const data = await getForms(filterWithPagination);
      const mapped = (data.content || []).map(adaptFormForView);
      setForms(mapped);
      setTotalPages(data.totalPages ?? 0);
      setTotalRecords(data.totalElements);
    } catch (err) {
      const msg = err?.message || JSON.stringify(err);
      setError("Erro ao buscar formulários: " + msg);
      toast.error("Erro ao buscar formulários");
    } finally {
      setLoading(false);
    }
  }, [page, size, userCargo, user?.especialidade]);

  const handleCreateForm = () => {
    navigate("/editForm");
  };

  const handleEditForm = async (row) => {
    try {
      setEditLoading(true);

      const fullFormData = await getFormById(row.id);

      const formDataForEdit = {
        ...fullFormData,
        perguntas: (fullFormData.perguntas || []).map((pergunta, index) => ({
          ...pergunta,
          id: pergunta.id || `pergunta_${fullFormData.id}_${index}_${Date.now()}`,
          alternativas: (pergunta.alternativas || []).map((alt, altIndex) => ({
            ...alt,
            id: alt.id || `alt_${fullFormData.id}_${index}_${altIndex}_${Date.now()}`
          }))
        }))
      };

      navigate("/editForm", { state: { formData: formDataForEdit } });

    } catch (err) {
      const message = err?.response?.data?.message ||
        err?.message ||
        "Erro ao carregar formulário para edição";
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleExportarCSV = async (formularioData) => {
    try {
      await generateFormularioCSVReport(formularioData);
      toast.success("Relatório CSV exportado com sucesso!");
    } catch (error) {
      toast.error(error.message || "Erro ao exportar relatório CSV");
    }
  };

  const handleToggleForm = async (row) => {
    try {
      await toggleForm(row.id);
      const action = row._ativoRaw ? "desativado" : "ativado";
      toast.success(`Formulário ${action} com sucesso!`);
      fetchForms();
    } catch (error) {
      toast.error("Erro ao ativar/desativar formulário");
    }
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
      <h1 className="text-lg mb-4">Formulários</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Indicador de loading para edição */}
      {editLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Carregando dados para edição...</p>
          </div>
        </div>
      )}

      <DataFrame
        title="Formulário"
        data={forms}
        avaiableFilters={avaiableFilters}
        dataType="formularios"
        onAddRow={handleCreateForm}
        onEditRow={handleEditForm}
        onToggleRow={handleToggleForm}
        fetchData={fetchForms}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        defaultFilters={{ ativo: [true] }}
        page={page}
        size={size}
        setPage={setPage}
        onStartTour={startTour}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        callbacks={{
          onEdit: handleEditForm,
          onExportarCSV: handleExportarCSV,
          onToggle: handleToggleForm
        }}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        size={size}
        onPageChange={setPage}
      />
    </div>
  );
}