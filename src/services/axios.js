import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:8003/", 
  headers: {
      'Content-Type': 'application/json',
    },
})