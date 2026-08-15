import { apiGet, apiPost, apiPut, apiDelete } from './httpClient';

export const getIngredients = () => apiGet('/api/ingredients/');
export const getIngredient = (id) => apiGet(`/api/ingredients/${id}/`);
export const createIngredient = (data) => apiPost('/api/ingredients/', data);
export const updateIngredient = (id, data) => apiPut(`/api/ingredients/${id}/`, data);
export const deleteIngredient = (id) => apiDelete(`/api/ingredients/${id}/`);
