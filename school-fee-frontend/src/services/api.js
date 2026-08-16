import axios from "axios";

// Create an Axios instance pointing to the backend API
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: Add request interceptor for auth tokens (Phase 4+)
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Optional: Add response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ── Student APIs ──────────────────────────────────────────────────────────────

export const studentAPI = {
    // GET /api/students
    list: (params) => API.get("/students", { params }),

    // GET /api/students/:id
    get: (id) => API.get(`/students/${id}`),

    // POST /api/students
    create: (data) => API.post("/students", data),

    // PUT /api/students/:id
    update: (id, data) => API.put(`/students/${id}`, data),

    // DELETE /api/students/:id
    delete: (id) => API.delete(`/students/${id}`),

    // GET /api/students/stats/summary
    stats: () => API.get("/students/stats/summary"),

    // GET /api/students/:id/bills
    getBills: (id) => API.get(`/students/${id}/bills`),
};

// ── Fee Structure APIs ────────────────────────────────────────────────────────

export const feeStructureAPI = {
    // GET /api/fee-structures
    list: (params) => API.get("/fee-structures", { params }),

    // GET /api/fee-structures/:id
    get: (id) => API.get(`/fee-structures/${id}`),

    // POST /api/fee-structures
    create: (data) => API.post("/fee-structures", data),

    // PUT /api/fee-structures/:id
    update: (id, data) => API.put(`/fee-structures/${id}`, data),

    // DELETE /api/fee-structures/:id
    delete: (id) => API.delete(`/fee-structures/${id}`),

    // GET /api/fee-structures/class/:className
    getByClass: (className) => API.get(`/fee-structures/class/${className}`),

    // POST /api/fee-structures/bulk
    bulkCreate: (data) => API.post("/fee-structures/bulk", data),
};

// ── Bill APIs ─────────────────────────────────────────────────────────────────

export const billAPI = {
    // GET /api/bills
    list: (params) => API.get("/bills", { params }),

    // GET /api/bills/:id
    get: (id) => API.get(`/bills/${id}`),

    // POST /api/bills
    create: (data) => API.post("/bills", data),

    // PUT /api/bills/:id
    update: (id, data) => API.put(`/bills/${id}`, data),

    // POST /api/bills/:id/payments
    recordPayment: (id, data) => API.post(`/bills/${id}/payments`, data),

    // GET /api/bills/:id/pdf
    downloadPDF: (id) => API.get(`/bills/${id}/pdf`, { responseType: "blob" }),

    // POST /api/bills/generate
    generateBills: (data) => API.post("/bills/generate", data),

    // GET /api/bills/student/:studentId
    getByStudent: (studentId) => API.get(`/bills/student/${studentId}`),

    // GET /api/bills/stats/summary
    stats: () => API.get("/bills/stats/summary"),
};

// ── Health Check ──────────────────────────────────────────────────────────────

export const healthAPI = {
    check: () => API.get("/health"),
};

export default API;
