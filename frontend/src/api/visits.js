import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';

export const getVisits = () => apiGet('/api/visits/');
export const getVisit = (id) => apiGet(`/api/visits/${id}/`);
export const createVisit = (data) => apiPost('/api/visits/', data);
export const updateVisit = (id, data) => apiPut(`/api/visits/${id}/`, data);
export const deleteVisit = (id) => apiDelete(`/api/visits/${id}/`);
