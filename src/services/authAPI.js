import api from './axios'

export const loginUser = async (email, senha) => {
  const resp = await api.post("/login", { email, senha });
  return { data: resp.data, status: resp.status };
};

export const pingProtected = async () => {
  const resp = await api.get("/usuarios/buscar", { params: { buscaGenerica: "", page: 0, size: 1 }});
  return { data: resp.data, status: resp.status };
};