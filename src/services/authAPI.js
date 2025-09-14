import api from './axios'

export const loginUser = async (email, senha) => {
  const resp = await api.post("/login", { email, senha });
  return { data: resp.data, status: resp.status };
};

export const pingProtected = async () => {
  const resp = await api.get("/users/buscar", { params: { buscaGenerica: "", page: 0, size: 1 }});
  return { data: resp.data, status: resp.status };
};

export const logoutUser = async () => {
  const resp = await api.post("/login/logout");
  return { data: resp.data, status: resp.status };
};

export const getCurrentUser = async () => {
  const resp = await api.get("/login/me"); // Endpoint para buscar dados do usuário atual
  return { data: resp.data, status: resp.status };
};

export const updateCurrentUserProfile = async (profileData) => {
  const resp = await api.put("/login/me", profileData);
  return { data: resp.data, status: resp.status };
};