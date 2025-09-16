import { format, parseISO, parse, isValid } from "date-fns";
import { capitalizeWords, parseBoolean } from "./utils.js";

// Função utilitária para criar datas locais sem problemas de fuso horário
const createLocalDate = (year, month, day, hour = 0, minute = 0, second = 0) => {
  // month é 1-based aqui (Janeiro = 1)
  return new Date(year, month - 1, day, hour, minute, second);
};

// Função para parse seguro de strings de data em formato ISO
const parseLocalDateString = (dateString) => {
  if (!dateString) return null;

  // Se é formato YYYY-MM-DD, parse manual para evitar UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return createLocalDate(year, month, day);
  }

  // Se é formato YYYY-MM-DDTHH:mm:ss ou similar, parse manual
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
    const [hour, minute, second] = timePart.split(':').map(num => parseInt(num, 10));
    return createLocalDate(year, month, day, hour, minute, second || 0);
  }

  // Fallback para parseISO para outros formatos
  try {
    return parseISO(dateString);
  } catch {
    return null;
  }
};

const parseMaybeDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;

  if (typeof raw === "string") {
    // Formato brasileiro DD/MM/YYYY HH:mm
    if (raw.includes("/")) {
      const d = parse(raw, "dd/MM/yyyy HH:mm", new Date());
      return isValid(d) ? d : null;
    }

    // Formatos ISO - usar nossa função que evita problemas de fuso horário
    const d = parseLocalDateString(raw);
    return d && isValid(d) ? d : null;
  }

  return null;
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

  const result = {
    id,
    paciente: pacienteNome,
    medico: medicoNome,
    tipoConsulta: consulta.tipoConsulta ? capitalizeWords(consulta.tipoConsulta) : "N/A",
    dataHora: dataHoraDate ? format(dataHoraDate, "dd/MM/yyyy HH:mm") : "N/A",
    status: consulta.status ? capitalizeWords(consulta.status) : "N/A",

    // execucaoFormulario formatada para a subtabela (não aparece na tabela principal)
    _execucaoFormulario: execucaoFormulario,

    // Hidden fields for form editing and associations (not displayed in table)
    _patientId: consulta.patientId,
    _medicoId: medicoId,
    _ativo: consulta.ativo ? "Sim" : "Não", // Formatado para visualização
    _ativoRaw: consulta.ativo, // Valor raw para lógica
    _dataConsulta: dataHoraDate ? format(dataHoraDate, "yyyy-MM-dd") : null,
    _horario: dataHoraDate ? format(dataHoraDate, "HH:mm") : null,
    _statusExecucao: "Pendente",
  };

  return result;
};

// adapt for API (normalizar payload p/ backend)
export const adaptConsultaForApi = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  
  let parsedDataHora = null;
  
  // Tratar dataConsulta como Date object
  if (consulta.dataConsulta && consulta.horario) {
    try {
      let ano, mes, dia;

      if (consulta.dataConsulta instanceof Date) {
        ano = consulta.dataConsulta.getFullYear();
        mes = consulta.dataConsulta.getMonth();
        dia = consulta.dataConsulta.getDate();
      } else if (typeof consulta.dataConsulta === 'string') {
        // Parse string de data evitando problemas de fuso horário
        if (consulta.dataConsulta.includes('/')) {
          // Formato DD/MM/YYYY
          const [diaStr, mesStr, anoStr] = consulta.dataConsulta.split('/');
          ano = parseInt(anoStr, 10);
          mes = parseInt(mesStr, 10) - 1; // Mês baseado em zero
          dia = parseInt(diaStr, 10);
        } else {
          // Usar nossa função de parse local para outros formatos
          const parsedDate = parseLocalDateString(consulta.dataConsulta);
          if (parsedDate) {
            ano = parsedDate.getFullYear();
            mes = parsedDate.getMonth(); // Já está baseado em zero
            dia = parsedDate.getDate();
          } else {
            throw new Error("Formato de data string não reconhecido");
          }
        }
      } else {
        throw new Error("Formato de data não reconhecido");
      }

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