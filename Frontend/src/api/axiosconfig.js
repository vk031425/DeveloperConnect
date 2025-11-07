import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // we'll connect this later
  withCredentials: true,
});

export default api;
