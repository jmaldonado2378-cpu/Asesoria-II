export const API_URL = import.meta.env.VITE_API_URL || 'https://app-asesoria.onrender.com';

// Fetcher global para SWR (stale-while-revalidate)
export const fetcher = (url) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Error al conectar con el servidor');
    return r.json();
});

// Configuración global de SWR para evitar reintentos infinitos
export const swrConfig = {
    revalidateOnFocus: false,        // No revalidar al volver a la pestaña
    errorRetryCount: 3,              // Máximo 3 reintentos en caso de error
    errorRetryInterval: 5000,        // Esperar 5 segundos entre reintentos
    dedupingInterval: 10000,         // No duplicar peticiones en 10 segundos
};
