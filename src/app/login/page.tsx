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
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
                <div className="text-center flex flex-col items-center">
                    <img src="/logo.svg" alt="Kunst Design" className="h-[80px] w-auto mb-6" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Kunst & Design</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Ingresa para gestionar cotizaciones</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <Input id="email" name="email" type="email" placeholder="admin@kunst.mx" required />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Contraseña
                        </label>
                        <Input id="password" name="password" type="password" required />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-destructive">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <div className="text-center text-sm">
                        <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                            ¿No tienes cuenta? <span className="underline underline-offset-4">Regístrate aquí</span>
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
