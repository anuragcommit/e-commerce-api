// src/api/axios.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api", // Tumhara backend URL
    withCredentials: true // Agar cookies use kar rahe ho
});

// Request Interceptor: Agar localStorage mein accessToken hai toh header mein bhejo
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;