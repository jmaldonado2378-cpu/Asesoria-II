"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TypewriterProps {
    text: string
    speed?: number
    onComplete?: () => void
}

export function Typewriter({ text, speed = 20, onComplete }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        let i = 0
        setDisplayedText("")
        setIsComplete(false)

        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i))
                i++
            } else {
                clearInterval(timer)
                setIsComplete(true)
                if (onComplete) onComplete()
            }
        }, speed)

        return () => clearInterval(timer)
    }, [text, speed, onComplete])

    return (
        <div className="relative">
            <span>{displayedText}</span>
            {!isComplete && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-1.5 h-4 bg-orange-500 ml-1 align-middle"
                />
            )}
        </div>
    )
}
