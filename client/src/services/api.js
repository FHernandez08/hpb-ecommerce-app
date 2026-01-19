import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true,
})

console.log("API BASE URL =", import.meta.env.VITE_API_URL);

export default api;