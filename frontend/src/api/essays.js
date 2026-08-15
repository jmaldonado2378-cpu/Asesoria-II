import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';

export const getEssays = () => apiGet('/api/ensayos/');
export const getEssay = (id) => apiGet(`/api/ensayos/${id}/`);
export const createEssay = (data) => apiPost('/api/ensayos/', data);
export const updateEssay = (id, data) => apiPut(`/api/ensayos/${id}/`, data);
export const deleteEssay = (id) => apiDelete(`/api/ensayos/${id}/`);
