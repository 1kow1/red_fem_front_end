import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8003",
  withCredentials: true,  // cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;