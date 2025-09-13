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

export const getExecById = async (id, especialidade) => {
  try {
    const response = await api.get(`/exec/${id}`, {
        params: { especialidade: especialidade }
    });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar execução de formulário: " + error.message);
  }
};
