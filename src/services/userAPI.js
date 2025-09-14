/* eslint-disable no-unused-vars */
import api from "./axios";
import axios from "axios";

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

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to get user by id: " + error);
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

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw new Error("Failed to send forgot password email: " + error);
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
    const response = await api.patch(`/users`, {id});
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle user: " + error);
  }
};


export const validateToken = async (token) => {
  try {
    const response = await api.get(`/users/validate-token?token=${token}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to validate token: " + error);
  }
};

export const resetPassword = async ({ token, senha }) => {
  try {
    const response = await api.post("/users/reset-password", { token, senha });
    return response.data;
  } catch (error) {
    throw new Error("Failed reseting the password: " + error);
  }
};



// ------------- FIM EDIÇÃO -------------
