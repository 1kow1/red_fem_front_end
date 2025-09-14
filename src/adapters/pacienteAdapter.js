// adapters/pacienteAdapter.js
import { format, parseISO, parse, isValid } from "date-fns";

const parseMaybeDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;

  // formato dd/MM/yyyy (view)
  if (typeof raw === "string" && raw.includes("/")) {
    const d = parse(raw, "dd/MM/yyyy", new Date());
    return isValid(d) ? d : null;
  }

  // tenta ISO
  try {
    const d = parseISO(raw);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
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
    _dataDeNascimento: paciente.dataDeNascimento,
  };
};

export const adaptPacienteForApi = (paciente = {}) => {
  const id = paciente.id ?? paciente._id ?? null;
  const nascimentoDate = parseMaybeDate(paciente._dataDeNascimento ?? paciente.dataDeNascimento);

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
    dataDeNascimento: nascimentoDate
      ? format(nascimentoDate, "yyyy-MM-dd")
      : null,
  };
};
