/* eslint-disable no-unused-vars */
import DataFrame from "../components/DataFrame";
import FormPopUp from "../components/FormPopUp";
import { useEffect, useState  } from "react";
import { formConfigs } from "../config/formConfig";
import { adaptPacienteForView, adaptPacienteForApi } from "../adapters/pacienteAdapter";
import { getPacientes, createPaciente, editPaciente, togglePaciente } from "../services/pacienteAPI";
import { PaginationFooter } from "../components/PaginationFooter";
import { usePagination } from "../hooks/usePagination";
import { pacienteSchema } from "../validation/validationSchemas";
import { toast } from "react-toastify";

export default function Pacientes() {
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [editInitialData, setEditInitialData] = useState(null);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPacientes(page, size);
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
  };

  // CREATE
  const handleCreatePaciente = async (formData) => {
    try {
      await pacienteSchema.validate(formData, { abortEarly: false });
  
      const payload = adaptPacienteForApi(formData);
  
      createPaciente(payload)
        .then(() => fetchPacientes())
        .catch((err) => console.error("Erro ao criar paciente:", err));
  
      setIsFormOpen(false);
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      toast.error("Erros de validação ao criar paciente:", errors)
    }
  };

  // EDIT
  const handleEditPaciente = async (formData) => {
    await pacienteSchema.validate(formData, { abortEarly: false });
    const payload = adaptPacienteForApi({ ...(editInitialData || {}), ...formData });
    
    await editPaciente(payload.id, payload);
    await fetchPacientes();
    setIsFormOpen(false);
    setEditInitialData(null);
    toast.success("Paciente Atualizado!")
  };

  // REATIVAR / DESATIVAR
  const handleToggleActive = async (row) => {
    try {
      await togglePaciente(row.id);
      await fetchPacientes();
      toast.success("Paciente Atualizado!")
    } catch (err) {
      toast.error("Erro ao alternar status ativo:", err)
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

  useEffect(() => {
    fetchPacientes();
  }, [page, size]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchPacientes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <h1 className="text-lg mb-4">Pacientes</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <DataFrame
        title="Paciente"
        data={pacientes}
        dataType="pacientes"
        formFields={formConfigs.pacientes}
        onAddRow={openCreateForm}
        onEditRow={openEditForm}
        onToggleRow={handleToggleActive}
        fetchData={fetchPacientes}
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
        title={formMode === "create" ? "Criar Paciente" : "Editar Paciente"}
        mode={formMode}
        fields={formConfigs.pacientes}
        initialData={editInitialData}
        onSubmit={formMode === "create" ? handleCreatePaciente : handleEditPaciente}
        validationSchema={pacienteSchema}
      />
    </div>
  );
}
