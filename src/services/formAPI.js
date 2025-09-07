// src/services/formAPI.js
import api from "./axios";

export const createForm = async (data) => {
  try {
    const response = await api.post("/form", data);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar formulário: " + error.message);
  }
};

export const getForms = async (page = 0, size = 10, liberadoParaUso) => {
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
