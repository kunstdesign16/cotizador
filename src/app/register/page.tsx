'use client'

import { register } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useActionState } from "react"
import Link from 'next/link'

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null)

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
                <div className="text-center flex flex-col items-center">
                    <img src="/logo.svg" alt="Kunst Design" className="h-32 w-auto mb-6" />
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Nombre Completo
                        </label>
                        <Input id="name" name="name" type="text" placeholder="Tu Nombre" required />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Contraseña
                        </label>
                        <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-destructive font-medium">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Creando cuenta...' : 'Registrarse'}
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Inicia Sesión
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div >
    )
}
