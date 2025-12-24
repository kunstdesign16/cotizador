'use client'

import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useActionState } from "react"
import Link from 'next/link'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 rounded-3xl border border-secondary bg-white p-10 shadow-2xl"
            >
                <div className="text-center flex flex-col items-center">
                    <img src="/logo.svg" alt="Kunst Design" className="h-28 w-auto mb-8" />
                    <h1 className="text-4xl font-brand-header text-primary tracking-wide">Acceso al Sistema</h1>
                    <p className="text-sm text-foreground mt-2 font-light">Gestión de Cotizaciones y Proyectos</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-primary ml-1">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="usuario@kunst.mx"
                            required
                            className="rounded-xl border-secondary focus:ring-primary h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-primary ml-1">
                            Contraseña
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="rounded-xl border-secondary focus:ring-primary h-11"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-destructive font-medium text-center">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg font-brand-header tracking-widest rounded-xl shadow-lg hover:shadow-primary/20 transition-all" disabled={isPending}>
                        {isPending ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <div className="text-center pt-2">
                        <Link href="/register" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-semibold">
                            Soporte Técnico
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div >
    )
}
