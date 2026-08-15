import { apiGet, apiPost, apiPut, apiDelete } from './httpClient.js';

export const getClients = () => apiGet('/api/clients/');
export const getClient = (id) => apiGet(`/api/clients/${id}/`);
export const createClient = (data) => apiPost('/api/clients/', data);
export const updateClient = (id, data) => apiPut(`/api/clients/${id}/`, data);
export const deleteClient = (id) => apiDelete(`/api/clients/${id}/`);
