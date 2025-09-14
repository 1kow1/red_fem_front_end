/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import { useEffect, useState } from "react";
import { adaptFormForView } from "../adapters/formAdapter";
import { getForms, getFormById } from "../services/formAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { filterConfigs } from "../config/filterConfig";

export default function Formularios() {
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

  const avaiableFilters = filterConfigs['formularios'];

  // FETCH
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getForms(page, size);
      const mapped = (data.content || []).map(adaptFormForView);
      setForms(mapped);
      setTotalPages(data.totalPages ?? 0);
      setTotalRecords(data.totalElements);
    } catch (err) {
      console.error("Erro ao buscar formulários:", err);
      const msg = err?.message || JSON.stringify(err);
      setError("Erro ao buscar formulários: " + msg);
      toast.error("Erro ao buscar formulários");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate("/editForm");
  };

  const handleEditForm = async (row) => {
    try {
      setEditLoading(true);

      console.log("Buscando dados completos do formulário:", row.id);
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

      console.log("Dados preparados para edição:", formDataForEdit);
      navigate("/editForm", { state: { formData: formDataForEdit } });

    } catch (err) {
      console.error("Erro ao buscar dados completos do formulário:", err);
      const message = err?.response?.data?.message ||
        err?.message ||
        "Erro ao carregar formulário para edição";
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  // fetch on page/size change
  useEffect(() => {
    fetchForms();
  }, [page, size]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchForms();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <h1 className="text-lg mb-4">Formulários</h1>

      {loading && <p>Carregando...</p>}
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
        fetchData={fetchForms}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
      />
    </div>
  );
}