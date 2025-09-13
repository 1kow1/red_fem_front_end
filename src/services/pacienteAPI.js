/* eslint-disable no-unused-vars */
import api from "./axios";

// used to clear empty fields
export const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
  );
};

// ------------- GET -------------
export const getPacientes = async (page = 0, size = 10, ativo) => {
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
    throw new Error("Failed to create paciente: " + error);
  }
};

// ------------- PUT -------------
export const editPaciente = async (id, pacienteData) => {
  try {
    console.log("id: ",id)
    console.log("data: ",pacienteData)
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

