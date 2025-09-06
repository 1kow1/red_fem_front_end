import api from './axios'

export const createForm = async (data, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log(data)
    const response = await api.post('/form', data, { headers })
    return response.data
}
