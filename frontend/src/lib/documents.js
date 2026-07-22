import { api } from "./api";

export const documentsApi = {
  list: (filter) => api.get(`/api/documents${filter ? `?filter=${filter}` : ""}`),
  get: (id) => api.get(`/api/documents/${id}`),
  upload: (formData) => api.post("/api/documents", formData),
  update: (id, body) => api.patch(`/api/documents/${id}`, body),
  trash: (id) => api.del(`/api/documents/${id}`),
  restore: (id) => api.post(`/api/documents/${id}/restore`),
  permanentDelete: (id) => api.del(`/api/documents/${id}/permanent`),
};
