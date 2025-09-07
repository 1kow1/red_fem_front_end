import { format, parseISO, parse } from "date-fns";
import { capitalizeWords, parseBoolean} from "./utils.js";

export const adaptUserForView = (user) => ({
  nome: user.nome,
  email: user.email,
  cargo: capitalizeWords(user.cargo),
  especialidade: capitalizeWords(user.especialidade),
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