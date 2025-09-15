
 
import api from "./axios";

// ------------- GET -------------
export const getConsultas = async (filters = {}) => {
  try {
    const {
      especialidades,
      status,
      tiposConsulta,
      pacientesNomes,
      medicoIds,
      ativo,
      dataInicio,
      dataFim,
      buscaGenerica,
      page = 0,
      size = 10,
      sort,
      currentUserId,
      userCargo
    } = filters;

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    if (especialidades?.length) {
      especialidades.forEach(esp => params.append('especialidades', esp));
    }
    if (status?.length) {
      status.forEach(st => params.append('status', st));
    }
    if (tiposConsulta?.length) {
      tiposConsulta.forEach(tipo => params.append('tiposConsulta', tipo));
    }
    if (pacientesNomes?.length) {
      pacientesNomes.forEach(nome => params.append('pacientesNomes', nome));
    }

    // Access control: Doctors can only see their own appointments
    if (userCargo === 'MEDICO' && currentUserId) {
      params.append('medicoIds', currentUserId);
    } else if (medicoIds?.length) {
      medicoIds.forEach(id => params.append('medicoIds', id));
    }
    if (ativo?.length) {
      ativo.forEach(at => params.append('ativo', at.toString()));
    }
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    if (buscaGenerica) params.append('buscaGenerica', buscaGenerica);
    if (sort) params.append('sort', sort);

    const response = await api.get(`/consultas/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to get consultas: " + error.message);
  }
};

export const getConsultasLegacy = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/consultas/listar`, {
      params: { page, size}
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to get consultas: " + error.message);
  }
};

// ------------- POST -------------
export const createConsulta = async (data) => {
  try {
    const response = await api.post("/consultas", data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create consulta: " + error.message);
  }
};

// ------------- PUT -------------
export const editConsulta = async (id, consultaData) => {
  try {
    const response = await api.put(`/consultas/`, consultaData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to edit consulta: " + error.message);
  }
};

// ------------- DELETE -------------
export const deleteConsulta = async (id) => {
  try {
    const response = await api.delete(`/consultas/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete consulta: " + error.message);
  }
};

// ------------- PATCH -------------
export const toggleConsulta = async (id) => {
  try {
    const response = await api.patch(`/consultas/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle consulta: " + error);
  }
};

