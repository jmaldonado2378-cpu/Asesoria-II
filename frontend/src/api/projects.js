import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';

export const getProjects = () => apiGet('/api/projects/');
export const getProject = (id) => apiGet(`/api/projects/${id}/`);
export const createProject = (data) => apiPost('/api/projects/', data);
export const updateProject = (id, data) => apiPut(`/api/projects/${id}/`, data);
export const deleteProject = (id) => apiDelete(`/api/projects/${id}/`);
