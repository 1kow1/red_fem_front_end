import api from "./axios";

export const createForm = async (data) => {
  try {
    const response = await api.post("/form", data);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar formulário: " + error.message);
  }
};

export const getForms = async (filters = {}) => {
  try {
    const {
      titulos,
      descricoes,
      especialidades,
      versoes,
      medicoIds,
      medicosNomes,
      liberadoParaUso,
      ativo,
      buscaGenerica,
      page = 0,
      size = 10,
      sort,
      userCargo,
      userEspecialidade
    } = filters;

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    if (titulos?.length) {
      titulos.forEach(titulo => params.append('titulos', titulo));
    }
    if (descricoes?.length) {
      descricoes.forEach(desc => params.append('descricoes', desc));
    }

    // Apply specialty filter
    if (especialidades?.length) {
      // User explicitly selected specialty filter - use it
      especialidades.forEach(esp => params.append('especialidades', esp));
    } else if ((userCargo === 'MEDICO' || userCargo === 'RESIDENTE') && userEspecialidade) {
      // No filter selected: Doctors/Residents default to their own specialty
      // ADMINISTRADOR can see all forms regardless of specialty
      params.append('especialidades', userEspecialidade);
    }
    if (versoes?.length) {
      versoes.forEach(ver => params.append('versoes', ver));
    }
    if (medicoIds?.length) {
      medicoIds.forEach(id => params.append('medicoIds', id));
    }
    if (medicosNomes?.length) {
      medicosNomes.forEach(nome => params.append('medicosNomes', nome));
    }
    if (liberadoParaUso?.length) {
      liberadoParaUso.forEach(lib => params.append('liberadoParaUso', lib.toString()));
    }
    if (ativo?.length) {
      ativo.forEach(at => params.append('ativo', at.toString()));
    }
    if (buscaGenerica) params.append('buscaGenerica', buscaGenerica);
    if (sort) params.append('sort', sort);

    const response = await api.get(`/form/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar formulários: " + error.message);
  }
};

export const getFormsLegacy = async (page = 0, size = 10, liberadoParaUso) => {
  try {
    const response = await api.get("/form", {
      params: { page, size, liberadoParaUso },
    });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar formulários: " + error.message);
  }
};

export const getFormById = async (id) => {
  try {
    const response = await api.get(`/form/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar formulário: " + error.message);
  }
};

// nao existe ainda
export const deleteForm = async (id) => {
  try {
    const response = await api.delete(`/form/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao excluir formulário: " + error.message);
  }
};

export const releaseFormForUse = async (id, liberadoParaUso = true) => {
  try {
    const response = await api.patch(`/form/${id}/liberado-para-uso?liberadoParaUso=${liberadoParaUso}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao liberar formulário: " + error.message);
  }
};
