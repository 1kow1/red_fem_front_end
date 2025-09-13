
/* eslint-disable no-unused-vars */
import api from "./axios";

// used to clear empty fields
export const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
  );
};

// ------------- GET -------------
export const getConsultas = async (page = 0, size = 10) => {
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
    console.log("id: ", id);
    console.log("data: ", consultaData);
    const response = await api.put(`/consultas/${id}`, consultaData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to edit consulta: " + error.message);
  }
};

// ------------- PATCH -------------
export const toggleConsulta = async (id) => {
  try {
    const response = await api.patch(`/consultas`, { id });
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle consulta: " + error.message);
  }
};