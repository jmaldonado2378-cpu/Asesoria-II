"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizonal, Loader2 } from "lucide-react"

interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [text, setText] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "inherit"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [text])

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text.trim())
            setText("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex items-end gap-2 p-4 bg-slate-950/50 backdrop-blur-md border-t border-slate-900">
            <div className="flex-grow relative">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu consulta técnica aquí..."
                    disabled={disabled}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none min-h-[48px] max-h-[200px] transition-all disabled:opacity-50"
                    rows={1}
                />
            </div>
            <Button
                onClick={handleSend}
                disabled={!text.trim() || disabled}
                size="icon"
                className="h-12 w-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-950/20"
            >
                {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
            </Button>
        </div>
    )
}
