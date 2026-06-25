import axios from "axios";

export const SaveTokens = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
};

export const getToken = () => {
    return localStorage.getItem("access");
};

export const axiosRequest = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

axiosRequest.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);