// adapters/consultaAdapter.js
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

const safeStr = (v) => (v === undefined || v === null ? null : String(v));
const safeId = (v) => v ?? null;

// adapt for view (flatten)
export const adaptConsultaForView = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  const dataHoraDate = parseMaybeDate(consulta.dataHora);

  // Preferências de onde tirar nomes: execucaoFormulario.usuarioDTO (médico) e pacienteDTO
  const pacienteObj = consulta.pacienteDTO ?? consulta.execucaoFormulario?.paciente ?? null;
  const medicoObj = consulta.execucaoFormulario?.usuarioDTO ?? consulta.execucaoFormulario?.medico ?? null;

  const pacienteNome = pacienteObj?.nome ?? consulta.execucaoFormulario?.paciente?.nome ?? "N/A";
  const medicoNome = medicoObj?.nome ?? consulta.execucaoFormulario?.usuarioDTO?.nome ?? "N/A";

  const exec = consulta.execucaoFormulario ?? null;
  const formularioTitulo = exec?.formulario?.titulo ?? exec?.formulario?.titulo ?? exec?.formulario?.titulo ?? "N/A";
  const formularioId = exec?.formulario?.id ?? exec?.formularioId ?? exec?.formularioId ?? consulta.execucaoFormulario?.formularioId ?? null;

  const isSalvo = exec?.isSalvo ?? false;
  const isLiberado = exec?.isLiberado ?? false;

  let statusExecucao = "Pendente";
  if (isLiberado) statusExecucao = "Liberado";
  else if (isSalvo) statusExecucao = "Salvo";

  return {
    id,
    pacienteNome,
    medicoNome,
    especialidade: consulta.especialidade ? capitalizeWords(consulta.especialidade) : "N/A",
    tipoConsulta: consulta.tipoConsulta ? capitalizeWords(consulta.tipoConsulta) : "N/A",
    dataHora: dataHoraDate ? format(dataHoraDate, "dd/MM/yyyy HH:mm") : "N/A",
    status: consulta.status ? capitalizeWords(consulta.status) : "N/A",
    statusExecucao,
    formularioTitulo,
    formularioId,
    ativo: consulta.ativo ? "Sim" : "Não",
    // ids para edição
    patientId: consulta.patientId ?? pacienteObj?.id ?? pacienteObj?._id ?? null,
    medicoId: consulta.medicoId ?? medicoObj?.id ?? medicoObj?._id ?? null,
    execucaoFormulario: exec,
    //pacienteDTO: pacienteObj,
    //usuarioDTO: medicoObj,
    //raw: consulta,
  };
};

// adapt for API (normalizar payload p/ backend)
export const adaptConsultaForApi = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  const parsedDataHora = parseMaybeDate(consulta.dataHora);

  // Monta execucaoFormulario mínima que backend espera:
  // - se o usuário escolheu apenas formularioId, envia somente o id
  // - se já existe execucaoFormulario.respostas etc, mantém
  const origemExec = consulta.execucaoFormulario ?? {};

  const execucaoFormulario = {
    // prioriza campos fornecidos (ex.: execucaoFormulario.formularioId ou formularioId)
    formularioId: origemExec.formularioId ?? consulta.formularioId ?? consulta.execucaoFormulario?.formulario?.id ?? null,
    id: origemExec.id ?? null,
    // paciente: se usuário trouxe um objeto pacienteDTO, envia fields essenciais; se só veio patientId, envia id
    paciente: origemExec.paciente ?? (consulta.pacienteDTO ? {
      id: consulta.pacienteDTO.id ?? consulta.pacienteDTO._id,
      nome: consulta.pacienteDTO.nome,
      cpf: consulta.pacienteDTO.cpf,
      dataDeNascimento: consulta.pacienteDTO.dataDeNascimento,
      telefone: consulta.pacienteDTO.telefone,
      email: consulta.pacienteDTO.email,
      ativo: parseBoolean(consulta.pacienteDTO?.ativo),
    } : (consulta.patientId ? { id: consulta.patientId } : null)),
    // usuarioDTO: preferir o objeto já passado (usuarioDTO), senão somente medicoId
    usuarioDTO: origemExec.usuarioDTO ?? (consulta.usuarioDTO ? consulta.usuarioDTO : (consulta.medicoId ? { id: consulta.medicoId } : null)),
    respostas: origemExec.respostas ?? consulta.respostas ?? [],
    isSalvo: origemExec.isSalvo ?? false,
    isLiberado: origemExec.isLiberado ?? false,
    dataHora: origemExec.dataHora ?? (parsedDataHora ? parsedDataHora.toISOString() : null),
    formulario: origemExec.formulario ?? null, // se já estiver preenchido
  };

  // Limpeza: remover keys null desnecessárias se preciso
  const cleanedExec = { ...execucaoFormulario };
  if (!cleanedExec.formularioId) delete cleanedExec.formularioId;
  if (!cleanedExec.paciente) delete cleanedExec.paciente;
  if (!cleanedExec.usuarioDTO) delete cleanedExec.usuarioDTO;
  if (!cleanedExec.respostas || cleanedExec.respostas.length === 0) delete cleanedExec.respostas;

  return {
    id,
    dataHora: parsedDataHora ? parsedDataHora.toISOString() : null,
    especialidade: typeof consulta.especialidade === "string" ? consulta.especialidade.toUpperCase() : consulta.especialidade,
    medicoId: consulta.medicoId ?? (consulta.usuarioDTO?.id ?? null),
    patientId: consulta.patientId ?? (consulta.pacienteDTO?.id ?? null),
    tipoConsulta: typeof consulta.tipoConsulta === "string" ? consulta.tipoConsulta.toUpperCase() : consulta.tipoConsulta,
    ativo: parseBoolean(consulta.ativo),
    status: typeof consulta.status === "string" ? consulta.status.toUpperCase() : consulta.status,
    execucaoFormulario: Object.keys(cleanedExec).length ? cleanedExec : undefined,
  };
};
