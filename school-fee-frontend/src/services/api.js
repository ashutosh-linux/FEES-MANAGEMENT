import axios from "axios";

// Direct absolute backend URL
export const API_BASE_URL = "https://fees-management-r4j5.onrender.com/api";

// Create an Axios instance pointing directly to the backend API
const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ── Student APIs ──────────────────────────────────────────────────────────────

export const studentAPI = {
    list: (params) => API.get("/students", { params }),
    get: (id) => API.get(`/students/${id}`),
    create: (data) => API.post("/students", data),
    update: (id, data) => API.put(`/students/${id}`, data),
    delete: (id) => API.delete(`/students/${id}`),
    stats: () => API.get("/students/stats/summary"),
    getBills: (id) => API.get(`/students/${id}/bills`),
};

// ── Fee Structure APIs ────────────────────────────────────────────────────────

export const feeStructureAPI = {
    list: (params) => API.get("/fee-structures", { params }),
    get: (id) => API.get(`/fee-structures/${id}`),
    create: (data) => API.post("/fee-structures", data),
    update: (id, data) => API.put(`/fee-structures/${id}`, data),
    delete: (id) => API.delete(`/fee-structures/${id}`),
    getByClass: (className) => API.get(`/fee-structures/class/${className}`),
    bulkCreate: (data) => API.post("/fee-structures/bulk", data),
};

// ── Bill APIs ─────────────────────────────────────────────────────────────────

export const billAPI = {
    list: (params) => API.get("/bills", { params }),
    get: (id) => API.get(`/bills/${id}`),
    create: (data) => API.post("/bills", data),
    update: (id, data) => API.put(`/bills/${id}`, data),
    recordPayment: (id, data) => API.post(`/bills/${id}/payments`, data),
    downloadPDF: (id) => API.get(`/bills/${id}/pdf`, { responseType: "blob" }),
    generateBills: (data) => API.post("/bills/generate", data),
    getByStudent: (studentId) => API.get(`/bills/student/${studentId}`),
    stats: () => API.get("/bills/stats/summary"),
};

// ── Health Check ──────────────────────────────────────────────────────────────

export const healthAPI = {
    check: () => API.get("/health"),
};

export default API;