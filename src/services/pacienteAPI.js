/* eslint-disable no-unused-vars */
import api from "./axios";

// used to clear empty fields
export const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
  );
};

// ------------- GET -------------
export const getPacientes = async (filters = {}) => {
  try {
    const {
      nomes,
      emails,
      telefones,
      cidades,
      ufs,
      profissoes,
      sexos,
      cpfs,
      estadosCivil,
      ativo,
      nascimentoInicio,
      nascimentoFim,
      buscaGenerica,
      page = 0,
      size = 10,
      sort
    } = filters;

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    if (nomes?.length) {
      nomes.forEach(nome => params.append('nomes', nome));
    }
    if (emails?.length) {
      emails.forEach(email => params.append('emails', email));
    }
    if (telefones?.length) {
      telefones.forEach(tel => params.append('telefones', tel));
    }
    if (cidades?.length) {
      cidades.forEach(cidade => params.append('cidades', cidade));
    }
    if (ufs?.length) {
      ufs.forEach(uf => params.append('ufs', uf));
    }
    if (profissoes?.length) {
      profissoes.forEach(prof => params.append('profissoes', prof));
    }
    if (sexos?.length) {
      sexos.forEach(sexo => params.append('sexos', sexo));
    }
    if (cpfs?.length) {
      cpfs.forEach(cpf => params.append('cpfs', cpf));
    }
    if (estadosCivil?.length) {
      estadosCivil.forEach(estado => params.append('estadosCivil', estado));
    }
    if (ativo?.length) {
      ativo.forEach(at => params.append('ativo', at.toString()));
    }
    if (nascimentoInicio) params.append('nascimentoInicio', nascimentoInicio);
    if (nascimentoFim) params.append('nascimentoFim', nascimentoFim);
    if (buscaGenerica) params.append('buscaGenerica', buscaGenerica);
    if (sort) params.append('sort', sort);

    const response = await api.get(`/pacientes/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to get pacientes: " + error);
  }
};

export const getPacientesLegacy = async (page = 0, size = 10, ativo) => {
  try {
    const response = await api.get(`/pacientes/listar`, {
      params: { page, size, ativo }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to get pacientes: " + error);
  }
};

export const getPacienteById = async (id) => {
  try {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to get paciente by id: " + error);
  }
};

// ------------- POST -------------
export const createPaciente = async (data) => {
  try {
    const response = await api.post("/pacientes", cleanPayload(data));
    return response.data;
  } catch (error) {
    // Preservar o erro original para que o tratamento no componente funcione
    throw error;
  }
};

// ------------- PUT -------------
export const editPaciente = async (id, pacienteData) => {
  try {
    const response = await api.put(`/pacientes/${id}`, pacienteData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to edit paciente: " + error);
  }
};

// ------------- PATCH -------------
export const togglePaciente = async (id) => {
  try {
    const response = await api.patch(`/pacientes`, { id });
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle paciente: " + error);
  }
};

