"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Typewriter } from "./typewriter"

interface BubbleChatProps {
    role: 'user' | 'assistant'
    content: string
}

export function BubbleChat({ role, content }: BubbleChatProps) {
    const isAssistant = role === 'assistant'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex w-full gap-3 mb-6",
                isAssistant ? "justify-start" : "justify-end flex-row-reverse"
            )}
        >
            <Avatar className={cn("h-8 w-8 border", isAssistant ? "border-orange-500/20" : "border-slate-800 shadow-xl")}>
                <AvatarImage src={isAssistant ? "/ai-avatar.png" : ""} />
                <AvatarFallback className={isAssistant ? "bg-orange-600 text-white font-black" : "bg-slate-800 text-slate-400 font-bold"}>
                    {isAssistant ? "IA" : "U"}
                </AvatarFallback>
            </Avatar>

            <div className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-[13px] shadow-2xl transition-all duration-300",
                isAssistant
                    ? "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none font-medium leading-relaxed"
                    : "bg-orange-600 text-white rounded-tr-none font-bold shadow-orange-950/20 border border-orange-500/30"
            )}>
                {isAssistant ? (
                    <Typewriter text={content} speed={15} />
                ) : (
                    content
                )}
            </div>
        </motion.div>
    )
}
