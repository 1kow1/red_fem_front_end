// adapters/pacienteAdapter.js
import { format, parseISO, parse, isValid } from "date-fns";

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
    // Formato brasileiro DD/MM/YYYY
    if (raw.includes("/")) {
      const d = parse(raw, "dd/MM/yyyy", new Date());
      return isValid(d) ? d : null;
    }

    // Formatos ISO - usar nossa função que evita problemas de fuso horário
    const d = parseLocalDateString(raw);
    return d && isValid(d) ? d : null;
  }

  return null;
};

const parseBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (val == null) return null;
  const s = String(val).trim().toLowerCase();
  if (["true", "1", "yes", "sim"].includes(s)) return true;
  if (["false", "0", "no", "nao", "não"].includes(s)) return false;
  return null;
};

export const adaptPacienteForView = (paciente = {}) => {
  const id = paciente.id ?? paciente._id ?? paciente.pacienteId ?? null;
  const nascimentoDate = parseMaybeDate(paciente.dataDeNascimento);

  return {
    id,
    nome: paciente.nome ?? "",
    cpf: paciente.cpf ?? "",
    email: paciente.email ?? "",
    telefone: paciente.telefone ?? "",
    ativo: paciente.ativo ? "Sim" : "Não",
    consultas: paciente.consultas ?? [],
    // Hidden fields for form editing (not displayed in table)
    _sexo: paciente.sexo,
    _estadoCivil: paciente.estadoCivil,
    _profissao: paciente.profissao ?? "",
    _cidade: paciente.cidade ?? "",
    _uf: paciente.uf ?? "",
    _dataDeNascimentoForm: paciente.dataDeNascimento, // Campo original para edição
    _dataDeNascimento: nascimentoDate ? format(nascimentoDate, "dd/MM/yyyy") : "-", // Campo formatado para visualização
  };
};

export const adaptPacienteForApi = (paciente = {}) => {
  const id = paciente.id ?? paciente._id ?? null;

  let parsedNascimento = null;

  // Tratar dataDeNascimento com a mesma lógica das consultas
  if (paciente._dataDeNascimento || paciente.dataDeNascimento) {
    const dataOriginal = paciente._dataDeNascimento ?? paciente.dataDeNascimento;

    try {
      let ano, mes, dia;

      if (dataOriginal instanceof Date) {
        ano = dataOriginal.getFullYear();
        mes = dataOriginal.getMonth();
        dia = dataOriginal.getDate();
      } else if (typeof dataOriginal === 'string') {
        // Parse string de data evitando problemas de fuso horário
        if (dataOriginal.includes('/')) {
          // Formato DD/MM/YYYY
          const [diaStr, mesStr, anoStr] = dataOriginal.split('/');
          ano = parseInt(anoStr, 10);
          mes = parseInt(mesStr, 10) - 1; // Mês baseado em zero
          dia = parseInt(diaStr, 10);
        } else {
          // Usar nossa função de parse local para outros formatos
          const parsedDate = parseLocalDateString(dataOriginal);
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

      const dataNascimentoCombinada = new Date(ano, mes, dia);

      if (!isNaN(dataNascimentoCombinada.getTime())) {
        parsedNascimento = dataNascimentoCombinada;
      }

    } catch {
      parsedNascimento = null;
    }
  }

  if (!parsedNascimento) {
    parsedNascimento = null;
  }

  return {
    id,
    nome: paciente.nome,
    email: paciente.email,
    telefone: paciente.telefone
      ? String(paciente.telefone).replace(/\D/g, "")
      : null,
    cpf: paciente.cpf ? String(paciente.cpf).replace(/\D/g, "") : null,
    sexo: (paciente._sexo ?? paciente.sexo) ? (paciente._sexo ?? paciente.sexo).toUpperCase() : null,
    estadoCivil: (paciente._estadoCivil ?? paciente.estadoCivil)
      ? (paciente._estadoCivil ?? paciente.estadoCivil).toUpperCase()
      : null,
    profissao: paciente._profissao ?? paciente.profissao,
    cidade: paciente._cidade ?? paciente.cidade,
    uf: paciente._uf ?? paciente.uf,
    ativo: parseBoolean(paciente.ativo),
    dataDeNascimento: parsedNascimento
      ? format(parsedNascimento, "yyyy-MM-dd")
      : null,
  };
};
