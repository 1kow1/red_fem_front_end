import api from "../services/axios";


// TODO: Estudar como passar a paginação como parametro

// ------------- GET -------------

export const getUsers = async (token, page = 0, size = 10) => {
  try {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await api.get(`/usuarios/listar`, {
      headers,
      params: { page, size },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to get users: " + error);
  }
};

// ------------- POST -------------
export const createUser = async (data, token) => {
  try {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await api.post(
      "/usuarios",
      data,          
      { headers }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to create user: " + error);
  }
};
