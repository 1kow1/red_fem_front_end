import { format, parseISO, parse, isValid } from "date-fns";
import { capitalizeWords, parseBoolean } from "./utils.js";

const parseMaybeDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;

  if (typeof raw === "string" && raw.includes("/")) {
    const d = parse(raw, "dd/MM/yyyy HH:mm", new Date());
    return isValid(d) ? d : null;
  }

  try {
    const d = parseISO(raw);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

export const adaptConsultaForView = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;

  const dataHoraDate = parseMaybeDate(consulta.dataHora);

  // Extraindo dados do paciente e médico
  const pacienteNome = consulta.execucaoFormulario?.paciente?.nome ?? "N/A";
  const medicoNome = consulta.execucaoFormulario?.academico?.nome ?? "N/A";
  
  // Status da execução do formulário
  const isSalvo = consulta.execucaoFormulario?.isSalvo ?? false;
  const isLiberado = consulta.execucaoFormulario?.isLiberado ?? false;
  
  // Determinar status baseado nos flags
  let statusExecucao = "Pendente";
  if (isLiberado) {
    statusExecucao = "Liberado";
  } else if (isSalvo) {
    statusExecucao = "Salvo";
  }

  return {
    id,
    pacienteNome,
    medicoNome,
    especialidade: consulta.especialidade ? capitalizeWords(consulta.especialidade) : "N/A",
    tipoConsulta: consulta.tipoConsulta ? capitalizeWords(consulta.tipoConsulta) : "N/A",
    dataHora: dataHoraDate ? format(dataHoraDate, "dd/MM/yyyy HH:mm") : "N/A",
    status: consulta.status ? capitalizeWords(consulta.status) : "N/A",
    statusExecucao,
    formularioTitulo: consulta.execucaoFormulario?.formulario?.titulo ?? "N/A",
    ativo: consulta.ativo ? "Sim" : "Não",
    // Dados originais para edição
    patientId: consulta.patientId,
    medicoId: consulta.medicoId,
    execucaoFormulario: consulta.execucaoFormulario,
  };
};

export const adaptConsultaForApi = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;

  const parsedDataHora = parseMaybeDate(consulta.dataHora);

  return {
    id,
    dataHora: parsedDataHora ? parsedDataHora.toISOString() : null,
    especialidade: typeof consulta.especialidade === "string" 
      ? consulta.especialidade.toUpperCase() 
      : consulta.especialidade,
    medicoId: consulta.medicoId,
    patientId: consulta.patientId,
    tipoConsulta: typeof consulta.tipoConsulta === "string" 
      ? consulta.tipoConsulta.toUpperCase() 
      : consulta.tipoConsulta,
    ativo: parseBoolean(consulta.ativo),
    status: typeof consulta.status === "string" 
      ? consulta.status.toUpperCase() 
      : consulta.status,
    execucaoFormulario: consulta.execucaoFormulario,
  };
};