"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@/hooks/use-chat"
import { BubbleChat } from "@/components/chat/bubble-chat"
import { ChatInput } from "@/components/chat/chat-input"
import { SidebarHistory } from "@/components/chat/sidebar-history"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles } from "lucide-react"

export default function ChatPage() {
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined)
    const { messages, loading, error, sendMessage } = useChat(activeSessionId)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll al recibir mensajes
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' })
            }
        }
    }, [messages])

    const handleNewChat = () => {
        setActiveSessionId(undefined)
    }

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 selection:bg-orange-500/30">
            <div className="hidden md:block h-full">
                <SidebarHistory
                    activeSessionId={activeSessionId}
                    onSelectSession={setActiveSessionId}
                    onNewChat={handleNewChat}
                />
            </div>

            <main className="flex-grow flex flex-col relative h-full w-full">
                {/* Header de la ventana de chat */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/20">
                            <Bot className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-100">AI Technician</h2>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase">Consultor Activo</span>
                            </div>
                        </div>
                    </div>

                    <Badge variant="outline" className="border-slate-800 text-slate-400 flex gap-2 py-1 px-3">
                        <Sparkles size={12} className="text-orange-500 hidden sm:block" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">N8N Powered</span>
                    </Badge>
                </header>

                {/* Área de mensajes */}
                <ScrollArea ref={scrollRef} className="flex-grow p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto py-10">
                        {messages.length === 0 ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-6 rounded-full bg-slate-900 border border-slate-800 shadow-2xl">
                                    <Bot size={48} className="text-orange-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-serif font-black italic tracking-tighter">¿En qué puedo asesorarte hoy?</h3>
                                    <p className="text-sm text-slate-500 max-w-sm font-medium">
                                        Analizo recetas de panificación, diagnósticos de laboratorio y optimización de procesos técnicos en tiempo real.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-4">
                                    {['Analizar receta', 'Optimizar W', 'Problema de Alveo', 'Costo Harina'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => sendMessage(`Hola, necesito ayuda con: ${tag}`)}
                                            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <BubbleChat key={i} role={m.role} content={m.content} />
                            ))
                        )}

                        {loading && (
                            <div className="flex gap-3 animate-pulse">
                                <div className="h-8 w-8 rounded-full bg-slate-900" />
                                <div className="h-10 w-32 rounded-2xl bg-slate-900" />
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-500 text-xs font-bold text-center mt-4">
                                ERROR TÉCNICO: {error}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input de Chat */}
                <div className="max-w-4xl mx-auto w-full px-4 mb-4">
                    <ChatInput onSend={sendMessage} disabled={loading} />
                    <p className="text-[8px] text-center text-slate-600 mt-2 uppercase font-bold tracking-[0.2em]">
                        Los modelos de IA pueden cometer fallos. Verifique siempre los resultados técnicos críticos.
                    </p>
                </div>
            </main>
        </div>
    )
}
