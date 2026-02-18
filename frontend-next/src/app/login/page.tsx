"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/chat")
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) setError(error.message)
        else alert("Revisa tu email para confirmar cuenta")
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="border-orange-500 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                            App Asesor v3.0
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl font-black font-serif italic tracking-tighter">Acceso Directo</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Ingresa tus credenciales para administrar tus asesorías.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Corporativo</label>
                            <Input
                                type="email"
                                placeholder="email@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-950 border-slate-800 focus:border-orange-500 transition-all font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Clave de Seguridad</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-950 border-slate-800 focus:border-orange-500 transition-all font-mono"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-black uppercase bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest py-6" disabled={loading}>
                            {loading ? "Sincronizando..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500 font-bold text-[9px]">O registrar cuenta nueva</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={handleSignUp} disabled={loading}>
                        Crear Acceso
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
