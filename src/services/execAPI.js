import api from "./axios";

export const createExec = async (data) => {
  try {
    const response = await api.post("/exec", data);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar execução de formulário: " + error.message);
  }
};

export const getExecs = async (page = 0, size = 10, especialidade, isLiberado) => {
    try {
      const response = await api.get("/exec", {
        params: { page, size, especialidade, isLiberado },
      });
      return response.data;
    } catch (error) {
      throw new Error("Erro ao buscar execuções de formulários: " + error.message);
    }
  };

export const getExecById = async (id) => {
  try {
    const response = await api.get(`/exec/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar execução de formulário: " + error.message);
  }
};

export const updateExec = async (id, data) => {
  try {
    const response = await api.put(`/exec/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao atualizar execução de formulário: " + error.message);
  }
};

export const deleteExec = async (id) => {
  try {
    const response = await api.delete(`/exec/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao excluir execução de formulário: " + error.message);
  }
};

export const releaseExec = async (id) => {
  try {
    const response = await api.patch(`/exec/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao liberar execução de formulário: " + error.message);
  }
};
