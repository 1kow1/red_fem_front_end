import api from "../services/axios";

// ------------- GET -------------
export const getUsers = async (buscaGenerica = "", page = 0, size = 10) => {
  try {
    const response = await api.get(`/usuarios/buscar`, { params: { buscaGenerica, page, size }, });
    return response.data;
  } catch (error) {
    throw new Error("Failed to get users: " + error);
  }
};

// ------------- POST -------------
export const createUser = async (data, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post("/usuarios", data, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create user: " + error);
  }
};


// ------------- PUT -------------
export const editUser = async (token, id, userData) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put(`/usuarios/${id}`, userData, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Failed to edit user: " + error);
  }
};

// ------------- PATCH -------------
export const toggleUser = async (token, id) => {
  console.log("id no patch: " + id)
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.patch(`/usuarios/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Failed to toggle user: " + error);
  }
};

// ------------- FIM EDIÇÃO -------------