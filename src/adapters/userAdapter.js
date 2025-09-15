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
    // Hidden fields for form editing (not displayed in table) - preserve original values for forms
    _dataCriacao: dataCriacaoDate ? format(dataCriacaoDate, "dd/MM/yyyy HH:mm") : "-",
    _dataAtualizacao: dataAtualizacaoDate ? format(dataAtualizacaoDate, "dd/MM/yyyy HH:mm") : "-",
    _cargo: user.cargo ?? "", // Original cargo value for form editing
    _especialidade: user.especialidade ?? "", // Original especialidade value for form editing
  };
};

export const adaptUserForApi = (user = {}) => {
  const id = user.id ?? user._id ?? null;

  const parsedCriacao = parseMaybeDate(user.dataCriacao);

  // For cargo and especialidade, prefer the hidden field values (original) over the transformed ones
  const cargo = user._cargo ?? user.cargo;
  const especialidade = user._especialidade ?? user.especialidade;

  return {
    id,
    nome: user.nome,
    email: user.email,
    cargo: typeof cargo === "string" ? cargo.toUpperCase() : cargo,
    especialidade:
      typeof especialidade === "string"
        ? especialidade.toUpperCase()
        : especialidade,
    telefone: user.telefone ? String(user.telefone).replace(/\D/g, "") : null,
    crm: user.crm,
    ativo: parseBoolean(user.ativo),
    dataCriacao: parsedCriacao ? parsedCriacao.toISOString() : null,
  };
};
