import { format, parseISO, parse } from "date-fns";

export const adaptUserForView = (user) => ({
  id: user.id,
  nome: user.nome,
  email: user.email,
  cargo: user.cargo,
  especialidade: user.especialidade,
  crm: user.crm,
  telefone: user.telefone,
  ativo: user.ativo ? "Sim" : "Não",
  dataCriacao: user.dataCriacao
    ? format(parseISO(user.dataCriacao), "dd/MM/yyyy HH:mm")
    : "-",
  dataAtualizacao: user.dataAtualizacao
    ? format(parseISO(user.dataAtualizacao), "dd/MM/yyyy HH:mm")
    : "-",
});


const parseBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (val == null) return null;
  const s = String(val).trim().toLowerCase();
  if (["true", "1", "yes", "sim"].includes(s)) return true;
  if (["false", "0", "no", "nao", "não"].includes(s)) return false;
  return null;
};

export const adaptUserForApi = (user) => ({
  id: user.id,
  nome: user.nome,
  email: user.email,
  cargo: user.cargo,
  especialidade: user.especialidade,
  telefone: user.telefone ? String(user.telefone).replace(/\D/g, "") : null,
  crm: user.crm,
  ativo: parseBoolean(user.ativo),
  dataCriacao: parse(user.dataCriacao, "dd/MM/yyyy HH:mm", new Date()).toISOString()
});