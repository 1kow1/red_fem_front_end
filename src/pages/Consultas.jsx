/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState } from "react";
import { formConfigs } from "../config/formConfig";
import { adaptConsultaForView, adaptConsultaForApi } from "../adapters/consultaAdapter";
import { getConsultas, createConsulta, editConsulta, toggleConsulta } from "../services/consultaAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { consultaSchema } from "../validation/validationSchemas";
import { toast } from "react-toastify";
import ConfirmationPopUp from "../components/ConfirmationPopUp";

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
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

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getConsultas(page, size);
      const mapped = data.content.map(adaptConsultaForView);

      setConsultas(mapped);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalElements);
    } catch (err) {
      setError("Erro ao buscar consultas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleCreateConsulta = async (formData) => {

    console.log("DEBUG FormData completo:", formData);
    console.log("dataConsulta:", {
      valor: formData.dataConsulta,
      tipo: typeof formData.dataConsulta,
    });
    console.log("horario:", {
      valor: formData.horario,
      tipo: typeof formData.horario,
    });

    try {
      const payload = adaptConsultaForApi(formData);
      console.log("🔄 Payload transformado pelo adapter:", payload);

      const resultado = await createConsulta(payload);
      console.log("✅ API retornou:", resultado);

      await fetchConsultas();
      setIsFormOpen(false);
      toast.success("Consulta criada com sucesso!");

    } catch (err) {
      console.error("❌ ERRO:", err);
      toast.error("Erro: " + (err?.response?.data?.message || err.message));
    }
  };

  // EDIT
  const handleEditConsulta = async (formData) => {
    try {
      await consultaSchema.validate(formData, { abortEarly: false });
      const payload = adaptConsultaForApi({ ...(editInitialData || {}), ...formData });

      await editConsulta(payload.id, payload);
      await fetchConsultas();
      toast.success("Consulta atualizada!");
      setIsFormOpen(false);
      setEditInitialData(null);
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        toast.error("Erros de validação ao editar consulta:", errors);
      } else {
        toast.error("Erro ao editar consulta: " + err.message);
      }
    }
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    setIsConfirmOpen(true);
    setRow(row);
  };

  const handleConfirmToggle = async () => {
    try {
      await toggleConsulta(row.id);
      await fetchConsultas();
      toast.success("Consulta atualizada com sucesso!");
    }
    catch (err) {
      toast.error("Erro ao atualizar consulta");
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

  // abrir edição
  const openEditForm = (row) => {
    setEditInitialData(row);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  useEffect(() => {
    fetchConsultas();
  }, [page, size]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchConsultas();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <h1 className="text-lg mb-4">Consultas</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Consulta"
        data={consultas}
        dataType="consultas"
        formFields={formConfigs.consultas}
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onToggleRow={handleToggleActive}
        fetchData={fetchConsultas}
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
        title={formMode === "create" ? "Criar Consulta" : "Editar Consulta"}
        mode={formMode}
        fields={formConfigs.consultas}
        initialData={formMode === "create" ? null : editInitialData}
        onSubmit={formMode === "create" ? handleCreateConsulta : handleEditConsulta}
        validationSchema={consultaSchema}
      />

      <ConfirmationPopUp
        isOpen={isConfirmOpen}
        message={`Tem certeza que deseja desmarcar a consulta?`}
        onConfirm={handleConfirmToggle}
        onCancel={() => { setIsConfirmOpen(false); setRow({}); }}
      />
    </div>
  );
}