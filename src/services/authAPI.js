import api from './axios'

export const loginUser = async (email, senha) => {
  const resp = await api.post("/login", { email, senha });
  return { data: resp.data, status: resp.status };
};

export const pingProtected = async () => {
  // Tenta buscar dados do usuário atual primeiro
  try {
    const resp = await api.get("/login/me");
    return { data: resp.data, status: resp.status };
  } catch (error) {
    // Fallback para o endpoint antigo
    const resp = await api.get("/users/buscar", { params: { buscaGenerica: "", page: 0, size: 1 }});
    return { data: resp.data, status: resp.status };
  }
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
  try {
    const resp = await api.put("/login/me", profileData);
    return { data: resp.data, status: resp.status };
  } catch (error) {
    // Re-throw para que o componente possa tratar
    throw error;
  }
};

export const changeMyPassword = async (passwordData) => {
  const resp = await api.patch("/users/me/change-password", passwordData);
  return { data: resp.data, status: resp.status };
};

export const changeCurrentUserPassword = async (senhaAtual, novaSenha) => {
  const resp = await api.patch("/login/me/change-password", { senhaAtual, novaSenha });
  return { data: resp.data, status: resp.status };
};