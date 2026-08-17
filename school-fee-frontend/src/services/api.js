import axios from "axios";

// Export API_BASE_URL for App.jsx and other components
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://fees-management-r4j5.onrender.com/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to every request if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Health check endpoint
export const healthAPI = {
    check: () => api.get("/health"),
    getStatus: () => api.get("/health"),
};

export const studentAPI = {
    list: (params) => api.get("/students", { params }),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post("/students", data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
};

export const billAPI = {
    list: (params) => api.get("/bills", { params }),
    getById: (id) => api.get(`/bills/${id}`),
    create: (data) => api.post("/bills", data),
    generateBills: (data) => api.post("/bills/generate", data),
    recordPayment: (id, data) => api.post(`/bills/${id}/payments`, data),
    getStats: () => api.get("/bills/stats/summary"),
    downloadPDF: (id) => api.get(`/bills/${id}/pdf`, { responseType: "blob" }),
};

export const feeStructureAPI = {
    list: (params) => api.get("/fee-structures", { params }),
    getById: (id) => api.get(`/fee-structures/${id}`),
    create: (data) => api.post("/fee-structures", data),
    update: (id, data) => api.put(`/fee-structures/${id}`, data),
    delete: (id) => api.delete(`/fee-structures/${id}`),
};

export default api;