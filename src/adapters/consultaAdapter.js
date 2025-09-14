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

// adapt for view (flatten)
export const adaptConsultaForView = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  const dataHoraDate = parseMaybeDate(consulta.dataHora);

  // Extrair nomes e IDs do paciente e médico
  const medicoObj = consulta.usuarioDTO ?? consulta.execucaoFormulario?.medico ?? null;
  const medicoNome = medicoObj?.nome ?? consulta.execucaoFormulario?.usuarioDTO?.nome ?? "N/A";
  const medicoId = consulta.medicoId ?? medicoObj?.id ?? medicoObj?._id ?? null;

  const pacienteNome = consulta.pacienteNome ?? consulta.execucaoFormulario?.paciente?.nome ?? "N/A";

  let execucaoFormulario = null;
  if (consulta.execucaoFormulario) {
    const exec = consulta.execucaoFormulario;
    const execDataHora = parseMaybeDate(exec.dataHora);
    
    execucaoFormulario = {
      // Apenas campos essenciais para a subtabela
      id: exec.id || "N/A",
      liberado: exec.isLiberado ? "Sim" : "Não",
      dataHora: execDataHora ? format(execDataHora, "dd/MM/yyyy HH:mm") : "N/A",
      medico: exec.usuarioDTO?.nome || medicoNome,
      especialidade: exec.usuarioDTO?.especialidade || "N/A",
      formulario: exec.formulario?.titulo || "Não associado",
      respostas: exec.respostas?.length || 0,
      
      // Campos originais mantidos para funcionalidade (ocultos com underscore)
      _exec: exec
    };
  }

  return {
    id,
    pacienteNome: pacienteNome,
    medicoNome: medicoNome,
    tipoConsulta: consulta.tipoConsulta ? capitalizeWords(consulta.tipoConsulta) : "N/A",
    dataHora: dataHoraDate ? format(dataHoraDate, "dd/MM/yyyy HH:mm") : "N/A",
    status: consulta.status ? capitalizeWords(consulta.status) : "N/A",

    // Original field names for form editing (hidden from table with underscore)
    _patientId: consulta.patientId,
    _medicoId: medicoId,
    _ativo: consulta.ativo,
    _dataConsulta: dataHoraDate ? format(dataHoraDate, "yyyy-MM-dd") : null,
    _horario: dataHoraDate ? format(dataHoraDate, "HH:mm") : null,

    // execucaoFormulario formatada para a subtabela (não aparece na tabela principal)
    _execucaoFormulario: execucaoFormulario,

    // Campos mantidos para funcionalidade (com underscore para não exibir)
    _statusExecucao: "Pendente",
  };
};

// adapt for API (normalizar payload p/ backend)
export const adaptConsultaForApi = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  
  let parsedDataHora = null;
  
  // Tratar dataConsulta como Date object
  if (consulta.dataConsulta && consulta.horario) {
    try {
      let dataBase;
      
      if (consulta.dataConsulta instanceof Date) {
        dataBase = new Date(consulta.dataConsulta);
      } else if (typeof consulta.dataConsulta === 'string') {
        dataBase = new Date(consulta.dataConsulta);
      } else {
        throw new Error("Formato de data não reconhecido");
      }
      
      const ano = dataBase.getFullYear();
      const mes = dataBase.getMonth();
      const dia = dataBase.getDate();
      
      const [hora, minuto] = consulta.horario.split(':');
      const horaNum = parseInt(hora, 10);
      const minutoNum = parseInt(minuto, 10);
      
      const dataHoraCombinada = new Date(ano, mes, dia, horaNum, minutoNum, 0);
      
      if (!isNaN(dataHoraCombinada.getTime())) {
        parsedDataHora = dataHoraCombinada;
      }
      
    } catch {
      parsedDataHora = null;
    }
  } else if (consulta.dataHora) {
    parsedDataHora = parseMaybeDate(consulta.dataHora);
  }
  
  if (!parsedDataHora) {
    parsedDataHora = new Date();
  }

  const origemExec = consulta.execucaoFormulario ?? {};

  const execucaoFormulario = {
    formularioId: origemExec.formularioId ?? consulta.formularioId ?? null,
    id: origemExec.id ?? null,
    paciente: origemExec.paciente ?? (consulta.pacienteDTO ? {
      id: consulta.pacienteDTO.id ?? consulta.pacienteDTO._id,
      nome: consulta.pacienteDTO.nome,
      cpf: consulta.pacienteDTO.cpf,
      dataDeNascimento: consulta.pacienteDTO.dataDeNascimento,
      telefone: consulta.pacienteDTO.telefone,
      email: consulta.pacienteDTO.email,
      ativo: parseBoolean(consulta.pacienteDTO?.ativo),
    } : (consulta.patientId ? { id: consulta.patientId } : null)),
    usuarioDTO: origemExec.usuarioDTO ?? (consulta.usuarioDTO ? consulta.usuarioDTO : (consulta.medicoId ? { id: consulta.medicoId } : null)),
    respostas: origemExec.respostas ?? consulta.respostas ?? [],
    isSalvo: origemExec.isSalvo ?? false,
    isLiberado: origemExec.isLiberado ?? false,
    dataHora: parsedDataHora ? parsedDataHora.toISOString() : null,
    formulario: origemExec.formulario ?? null,
  };

  // Limpeza
  const cleanedExec = { ...execucaoFormulario };
  if (!cleanedExec.formularioId) delete cleanedExec.formularioId;
  if (!cleanedExec.paciente) delete cleanedExec.paciente;
  if (!cleanedExec.usuarioDTO) delete cleanedExec.usuarioDTO;
  if (!cleanedExec.respostas || cleanedExec.respostas.length === 0) delete cleanedExec.respostas;

  const payloadFinal = {
    id,
    dataHora: parsedDataHora ? parsedDataHora.toISOString() : null,
    medicoId: consulta._medicoId ?? consulta.medicoId ?? (consulta.usuarioDTO?.id ?? null),
    patientId: consulta._patientId ?? consulta.patientId ?? (consulta.pacienteDTO?.id ?? null),
    tipoConsulta: consulta.tipoConsulta,
    ativo: parseBoolean(consulta._ativo ?? consulta.ativo),
    status: typeof consulta.status === "string" ? consulta.status.toUpperCase() : consulta.status,
    execucaoFormulario: Object.keys(cleanedExec).length ? cleanedExec : undefined,
  };
  
  return payloadFinal;
};