"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { ChatMessage, sendToN8N } from "@/lib/n8n"
import { v4 as uuidv4 } from "uuid"

export function useChat(sessionId?: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Cargar mensajes iniciales si hay session_id
    useEffect(() => {
        if (sessionId) {
            const fetchMessages = async () => {
                const { data, error } = await supabase
                    .from('messages')
                    .select('role, content')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true })

                if (error) setError(error.message)
                else setMessages(data as ChatMessage[])
            }
            fetchMessages()
        }
    }, [sessionId, supabase])

    const sendMessage = async (content: string) => {
        if (!content.trim()) return

        setLoading(true)
        setError(null)

        const userMessage: ChatMessage = { role: 'user', content }
        setMessages(prev => [...prev, userMessage])

        try {
            // 1. Persistir mensaje de usuario en Supabase (si hay sesión)
            if (sessionId) {
                await supabase.from('messages').insert({
                    session_id: sessionId,
                    role: 'user',
                    content
                })
            }

            // 2. Enviar a N8N
            const response = await sendToN8N(content, sessionId || uuidv4(), messages)

            const assistantMessage: ChatMessage = { role: 'assistant', content: response }
            setMessages(prev => [...prev, assistantMessage])

            // 3. Persistir respuesta del asistente
            if (sessionId) {
                await supabase.from('messages').insert({
                    session_id: sessionId,
                    role: 'assistant',
                    content: response
                })
            }
        } catch (err: any) {
            setError(err.message)
            // Opcional: eliminar el último mensaje de usuario o marcar error
        } finally {
            setLoading(false)
        }
    }

    return {
        messages,
        loading,
        error,
        sendMessage
    }
}
