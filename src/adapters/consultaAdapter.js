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

// adapt for view (flatten)
export const adaptConsultaForView = (consulta = {}) => {
  const id = consulta.id ?? consulta._id ?? null;
  const dataHoraDate = parseMaybeDate(consulta.dataHora);

  // Extrair nomes do paciente e médico
  const pacienteObj = consulta.pacienteDTO ?? consulta.execucaoFormulario?.paciente ?? null;
  const medicoObj = consulta.execucaoFormulario?.usuarioDTO ?? consulta.execucaoFormulario?.medico ?? null;

  const pacienteNome = pacienteObj?.nome ?? consulta.execucaoFormulario?.paciente?.nome ?? "N/A";
  const medicoNome = medicoObj?.nome ?? consulta.execucaoFormulario?.usuarioDTO?.nome ?? "N/A";

  return {
    id,
    pacienteNome,
    medicoNome,
    especialidade: consulta.especialidade ? capitalizeWords(consulta.especialidade) : "N/A",
    tipoConsulta: consulta.tipoConsulta ? capitalizeWords(consulta.tipoConsulta) : "N/A",
    dataHora: dataHoraDate ? format(dataHoraDate, "dd/MM/yyyy HH:mm") : "N/A",
    status: consulta.status ? capitalizeWords(consulta.status) : "N/A",
    
    // Estes campos são mantidos para funcionalidade mas não são exibidos
    _statusExecucao: "Pendente",
    _formularioTitulo: "N/A",
    _formularioId: null,
    _ativo: consulta.ativo ? "Sim" : "Não",
    _patientId: consulta.patientId,
    _medicoId: consulta.medicoId,
    _execucaoFormulario: consulta.execucaoFormulario,
  };
};

// adapt for API (normalizar payload p/ backend)
export const adaptConsultaForApi = (consulta = {}) => {
  console.log("🔄 Adapter: Dados recebidos:", consulta);
  
  const id = consulta.id ?? consulta._id ?? null;
  
  let parsedDataHora = null;
  
  // CORREÇÃO: Tratar dataConsulta como Date object
  if (consulta.dataConsulta && consulta.horario) {
    console.log("📅 Combinando dataConsulta (Date) + horario (string):", {
      dataConsulta: consulta.dataConsulta,
      horario: consulta.horario,
      tipoDataConsulta: typeof consulta.dataConsulta,
      isDate: consulta.dataConsulta instanceof Date
    });
    
    try {
      let dataBase;
      
      // Se dataConsulta é um objeto Date
      if (consulta.dataConsulta instanceof Date) {
        dataBase = new Date(consulta.dataConsulta);
      } else if (typeof consulta.dataConsulta === 'string') {
        dataBase = new Date(consulta.dataConsulta);
      } else {
        throw new Error("Formato de data não reconhecido");
      }
      
      // Extrair apenas a parte da data (sem horário)
      const ano = dataBase.getFullYear();
      const mes = dataBase.getMonth(); // 0-11
      const dia = dataBase.getDate();
      
      console.log("📅 Data extraída:", { ano, mes: mes + 1, dia });
      
      // Separar hora e minuto
      const [hora, minuto] = consulta.horario.split(':');
      const horaNum = parseInt(hora, 10);
      const minutoNum = parseInt(minuto, 10);
      
      console.log("⏰ Hora extraída:", { hora: horaNum, minuto: minutoNum });
      
      // Criar nova data combinada
      const dataHoraCombinada = new Date(ano, mes, dia, horaNum, minutoNum, 0);
      
      console.log("🔗 Data+Hora combinada:", dataHoraCombinada);
      console.log("📍 ISO String:", dataHoraCombinada.toISOString());
      
      if (!isNaN(dataHoraCombinada.getTime())) {
        parsedDataHora = dataHoraCombinada;
        console.log("✅ Sucesso na combinação:", parsedDataHora.toISOString());
      } else {
        console.error("❌ Data inválida após combinação");
        parsedDataHora = null;
      }
      
    } catch (error) {
      console.error("❌ Erro ao combinar data+hora:", error);
      parsedDataHora = null;
    }
  } else if (consulta.dataHora) {
    parsedDataHora = parseMaybeDate(consulta.dataHora);
    console.log("📅 Usando dataHora existente:", parsedDataHora?.toISOString());
  } else {
    console.warn("⚠️ Nenhuma data encontrada");
    parsedDataHora = null;
  }
  
  // Se não conseguiu gerar dataHora, usar data atual como último recurso
  if (!parsedDataHora) {
    console.warn("⚠️ Usando data atual como fallback");
    parsedDataHora = new Date();
  }

  // Resto do código permanece igual
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
    especialidade: "GINECOLOGIA",
    medicoId: consulta.medicoId ?? (consulta.usuarioDTO?.id ?? null),
    patientId: consulta.patientId ?? (consulta.pacienteDTO?.id ?? null),
    tipoConsulta: consulta.tipoConsulta,
    ativo: parseBoolean(consulta.ativo),
    status: typeof consulta.status === "string" ? consulta.status.toUpperCase() : consulta.status,
    execucaoFormulario: Object.keys(cleanedExec).length ? cleanedExec : undefined,
  };
  
  console.log("🧪 Adapter: Payload final gerado:", payloadFinal);
  
  return payloadFinal;
};
