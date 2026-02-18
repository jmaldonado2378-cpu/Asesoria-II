const N8N_WEBHOOK_URL = "https://app-asesoria.onrender.com"

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export const sendToN8N = async (message: string, sessionId: string, history: ChatMessage[] = []) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                session_id: sessionId,
                chat_history: history,
                timestamp: new Date().toISOString()
            }),
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `Error del servidor: ${response.status}`)
        }

        const data = await response.json()
        // N8N usualmente devuelve la respuesta en un campo 'output' o 'response'
        return data.output || data.response || data.text || "No se recibió respuesta del asesor."

    } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
            throw new Error("El asesor está tardando demasiado en responder. Inténtalo de nuevo.")
        }
        throw error
    }
}
