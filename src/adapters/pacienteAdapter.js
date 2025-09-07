import { format, parseISO } from "date-fns";

const mapSexo = (sexo) => {
  if (!sexo) return "-";
  switch (sexo.toUpperCase()) {
    case "M":
      return "Masculino";
    case "F":
      return "Feminino";
    case "O":
      return "Outro";
    default:
      return sexo; // fallback: mostra o valor original se não for reconhecido
  }
};
const mapEstadoCivil = (estadoCivil) => {
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
export const adaptPacienteForView = (paciente) => ({
  id: paciente.id,
  nome: paciente.nome,
  email: paciente.email,
  telefone: paciente.telefone,
  cpf: paciente.cpf,
  sexo: mapSexo(paciente.sexo),
  estadoCivil: mapEstadoCivil(paciente.estadoCivil),
  profissao: paciente.profissao,
  cidade: paciente.cidade,
  uf: paciente.uf,
  ativo: paciente.ativo ? "Sim" : "Não",
  dataDeNascimento: paciente.dataDeNascimento
    ? format(parseISO(paciente.dataDeNascimento), "dd/MM/yyyy")
    : "-",
});

export const adaptPacienteForApi = (paciente) => ({
  id: paciente.id,
  nome: paciente.nome,
  email: paciente.email,
  telefone: paciente.telefone ? String(paciente.telefone).replace(/\D/g, "") : null,
  cpf: paciente.cpf ? String(paciente.cpf).replace(/\D/g, "") : null,
  sexo: paciente.sexo,
  estadoCivil: paciente.estadoCivil,
  profissao: paciente.profissao,
  cidade: paciente.cidade,
  uf: paciente.uf,
  ativo: parseBoolean(paciente.ativo),
  dataDeNascimento: paciente.dataDeNascimento
    ? format(new Date(paciente.dataDeNascimento), "yyyy-MM-dd")
    : null,
});
