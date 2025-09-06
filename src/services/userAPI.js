/* eslint-disable no-unused-vars */
import api from "./axios";

// used to clear empty fields
export const cleanPayload = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
  );
};

// ------------- GET -------------
export const getUsers = async (buscaGenerica = "", page = 0, size = 10) => {
  try {
    const response = await api.get(`/users/buscar`, { 
      params: { buscaGenerica, page, size } 
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to get users: " + error);
  }
};

// ------------- POST -------------
export const createUser = async (data) => {
  try {
    const response = await api.post("/users", cleanPayload(data));
    return response.data;
  } catch (error) {
    throw new Error("Failed to create user: " + error);
  }
};

// ------------- PUT -------------
export const editUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to edit user: " + error);
  }
};

// ------------- PATCH -------------
export const toggleUser = async (id) => {
  try {
    const response = await api.patch(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle user: " + error);
  }
};

import axios from "axios";

export const resetPassword = async ({ email, password }) => {
  try {
    const response = await axios.patch(
      "http://localhost:8003/users/senha",
      null, // PATCH precisa de algo no corpo, mas aqui deixamos null
      {
        withCredentials: false,
        params: { email, senha: password } // Axios vai gerar a query string automaticamente
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed reseting the password: " + error);
  }
};



// ------------- FIM EDIÇÃO -------------
