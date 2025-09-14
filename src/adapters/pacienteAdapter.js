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

const mapSexoForView = (sexo) => {
  if (!sexo) return "-";
  switch (sexo.toUpperCase()) {
    case "M":
      return "Masculino";
    case "F":
      return "Feminino";
    case "O":
      return "Outro";
    default:
      return sexo; // fallback
  }
};

const mapEstadoCivilForView = (estadoCivil) => {
  if (!estadoCivil) return "-";
  switch (estadoCivil.toUpperCase()) {
    case "SOLTEIRA":
      return "Solteira";
    case "SOLTEIRO":
      return "Solteiro";
    case "VIUVA":
      return "Viúva";
    case "VIUVO":
      return "Viúvo";
    case "CASADA":
      return "Casada";
    case "CASADO":
      return "Casado";
    default:
      return estadoCivil;
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
  const nascimentoDate = parseMaybeDate(paciente.dataDeNascimento);

  return {
    id,
    nome: paciente.nome ?? "",
    cpf: paciente.cpf ?? "",
    email: paciente.email ?? "",
    telefone: paciente.telefone ?? "",
    _sexo: mapSexoForView(paciente.sexo),
    _estadoCivil: mapEstadoCivilForView(paciente.estadoCivil),
    _profissao: paciente.profissao ?? "",
    _cidade: paciente.cidade ?? "",
    _uf: paciente.uf ?? "",
    ativo: paciente.ativo ? "Sim" : "Não",
    _dataDeNascimento: nascimentoDate
      ? format(nascimentoDate, "dd/MM/yyyy")
      : "-",
    consultas: paciente.consultas ?? [],
  };
};

export const adaptPacienteForApi = (paciente = {}) => {
  const id = paciente.id ?? paciente._id ?? null;
  const nascimentoDate = parseMaybeDate(paciente.dataDeNascimento);

  return {
    id,
    nome: paciente.nome,
    email: paciente.email,
    telefone: paciente.telefone
      ? String(paciente.telefone).replace(/\D/g, "")
      : null,
    cpf: paciente.cpf ? String(paciente.cpf).replace(/\D/g, "") : null,
    sexo: paciente.sexo ? paciente.sexo.toUpperCase() : null,
    estadoCivil: paciente.estadoCivil
      ? paciente.estadoCivil.toUpperCase()
      : null,
    profissao: paciente.profissao,
    cidade: paciente.cidade,
    uf: paciente.uf,
    ativo: parseBoolean(paciente.ativo),
    dataDeNascimento: nascimentoDate
      ? format(nascimentoDate, "yyyy-MM-dd")
      : null,
  };
};
