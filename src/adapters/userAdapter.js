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

export const adaptUserForView = (user = {}) => {
  const id = user.id ?? user._id ?? user.usuarioId ?? user.userId ?? null;

  const dataCriacaoDate = parseMaybeDate(user.dataCriacao);
  const dataAtualizacaoDate = parseMaybeDate(user.dataAtualizacao);

  return {
    id,
    nome: user.nome ?? "",
    email: user.email ?? "",
    cargo: user.cargo ,
    especialidade: user.especialidade,
    crm: user.crm ?? "",
    telefone: user.telefone ?? "",
    ativo: user.ativo ? "Sim" : "Não",
    // Hidden fields for form editing (not displayed in table) - preserve original values for forms
    _dataCriacao: dataCriacaoDate ? format(dataCriacaoDate, "dd/MM/yyyy HH:mm") : "-",
    _dataAtualizacao: dataAtualizacaoDate ? format(dataAtualizacaoDate, "dd/MM/yyyy HH:mm") : "-",
    _cargo: user.cargo ?? "", // Original cargo value for form editing
    _especialidade: user.especialidade ?? "", // Original especialidade value for form editing
    // Campos originais para formulário
    //cargo: user.cargo ?? "",
    //especialidade: user.especialidade ?? "",
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
