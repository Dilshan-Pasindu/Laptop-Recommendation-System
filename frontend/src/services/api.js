import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getLaptops = (params) => api.get("/laptops", { params });
export const recommendLaptops = (preferences) => api.post("/recommend", preferences);
export const getLaptopDetails = (id) => api.get(`/laptop/${id}`);
export const compareLaptops = (id1, id2) => api.post("/compare", { id1, id2 });
export const instantSearch = (q) => api.get("/search", { params: { q } });
export const getFavorites = () => api.get("/favorites");
export const toggleFavorite = (laptopId) => api.post("/favorites", { laptop_id: laptopId });
export const getHistory = () => api.get("/history");

export default api;
