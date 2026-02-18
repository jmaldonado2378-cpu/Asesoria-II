"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface SidebarHistoryProps {
    activeSessionId?: string
    onSelectSession: (id: string) => void
    onNewChat: () => void
}

export function SidebarHistory({ activeSessionId, onSelectSession, onNewChat }: SidebarHistoryProps) {
    const [sessions, setSessions] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchSessions = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('chat_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (!error) setSessions(data)
            }
        }
        fetchSessions()
    }, [supabase, activeSessionId])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = "/login"
    }

    return (
        <div className="flex flex-col h-full w-64 bg-slate-950 border-r border-slate-900">
            <div className="p-4">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 bg-slate-900 hover:bg-slate-800 border-dashed border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest"
                    variant="outline"
                >
                    <Plus size={14} className="text-orange-500" /> Nueva Asesoría
                </Button>
            </div>

            <Separator className="bg-slate-900 mx-4 w-auto" />

            <ScrollArea className="flex-grow px-2 py-4">
                <div className="space-y-1">
                    <div className="px-2 mb-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Historial Reciente</div>
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all group",
                                activeSessionId === session.id
                                    ? "bg-orange-600/10 text-orange-500 border border-orange-500/20 shadow-inner"
                                    : "text-slate-400 hover:bg-slate-900 border border-transparent"
                            )}
                        >
                            <MessageSquare size={14} className={activeSessionId === session.id ? "text-orange-500" : "text-slate-600 group-hover:text-slate-400"} />
                            <span className="truncate font-medium">{session.title}</span>
                        </button>
                    ))}
                    {sessions.length === 0 && (
                        <div className="px-3 py-8 text-center text-[9px] font-bold text-slate-700 uppercase italic">Sin chats previos</div>
                    )}
                </div>
            </ScrollArea>

            <div className="mt-auto p-4 space-y-2">
                <Separator className="bg-slate-900 mb-4" />
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500 hover:text-white hover:bg-slate-900 text-[10px] font-bold uppercase">
                    <Settings size={14} /> Configuración
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/20 text-[10px] font-bold uppercase"
                >
                    <LogOut size={14} /> Cerrar Sesión
                </Button>
            </div>
        </div>
    )
}
