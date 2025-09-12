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

export const adaptUserForView = (user = {}) => {
  const id = user.id ?? user._id ?? user.usuarioId ?? user.userId ?? null;

  const dataCriacaoDate = parseMaybeDate(user.dataCriacao);
  const dataAtualizacaoDate = parseMaybeDate(user.dataAtualizacao);

  return {
    id,
    nome: user.nome ?? "",
    email: user.email ?? "",
    cargo: user.cargo ? capitalizeWords(user.cargo) : "",
    especialidade: user.especialidade ? capitalizeWords(user.especialidade) : "",
    crm: user.crm ?? "",
    telefone: user.telefone ?? "",
    ativo: user.ativo ? "Sim" : "Não",
    dataCriacao: dataCriacaoDate ? format(dataCriacaoDate, "dd/MM/yyyy HH:mm") : "-",
    dataAtualizacao: dataAtualizacaoDate ? format(dataAtualizacaoDate, "dd/MM/yyyy HH:mm") : "-",
  };
};

export const adaptUserForApi = (user = {}) => {
  const id = user.id ?? user._id ?? null;

  const parsedCriacao = parseMaybeDate(user.dataCriacao);

  return {
    id,
    nome: user.nome,
    email: user.email,
    cargo: typeof user.cargo === "string" ? user.cargo.toUpperCase() : user.cargo,
    especialidade:
      typeof user.especialidade === "string"
        ? user.especialidade.toUpperCase()
        : user.especialidade,
    telefone: user.telefone ? String(user.telefone).replace(/\D/g, "") : null,
    crm: user.crm,
    ativo: parseBoolean(user.ativo),
    dataCriacao: parsedCriacao ? parsedCriacao.toISOString() : null,
  };
};
