import { capitalizeWords, parseBoolean} from "./utils.js";

export const adaptFormForView = (form) => {
  if (!form) {
    return {
      id: null,
      titulo: "-",
      descricao: "-",
      especialidade: "-",
      versao: "-",
      liberadoParaUso: "-",
    };
  }

  return {
    id: form.id,
    titulo: form.titulo,
    descricao: form.descricao,
    especialidade: capitalizeWords(form.especialidade),
    versao: form.versao,
    liberadoParaUso: form.liberadoParaUso ? "Sim" : "Não",
    _ativo: form.ativo, // Adicionar campo ativo para controle de edição
    _rawData: form, // Manter dados originais para referência
  };
};

export const adaptFormForApi = (form) => {
  if (!form) return {};

  const especialidade = form.especialidade
    ? String(form.especialidade).trim().toUpperCase()
    : undefined;

  const payload = {
    ...(form.id ? { id: form.id } : {}),
    titulo: form.titulo ?? form.title ?? null,
    descricao: form.descricao ?? form.description ?? null,
    especialidade: especialidade ?? form.especialidade ?? null,
    ...(form.perguntas ? { perguntas: form.perguntas } : {}),
    ...(form.versao ? { versao: form.versao } : {}),
    ...(typeof form.liberadoParaUso !== "undefined"
      ? { liberadoParaUso: parseBoolean(form.liberadoParaUso) }
      : {}),
  };

  return payload;
};
