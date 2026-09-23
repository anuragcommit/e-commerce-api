import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true
});

// 1. Request Interceptor: Attach Access Token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Catch 401s globally across all pages
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the backend says token is expired or unauthorized
        if (error.response && error.response.status === 401) {
            // Do not redirect if the failure is from an intentional login attempt
            const isLoginRequest = error.config?.url?.includes("/users/login");

            if (!isLoginRequest) {
                // Clear user auth storage
                localStorage.removeItem("accessToken");
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Broadcast an auth event so AuthContext syncs instantly
                window.dispatchEvent(new Event("auth:unauthorized"));

                // Redirect to login preserving destination route
                if (window.location.pathname !== "/login") {
                    window.location.href = `/login?session_expired=true`;
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;