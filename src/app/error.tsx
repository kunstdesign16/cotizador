'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-red-600">
                        ¡Ups! Algo salió mal
                    </h2>
                    <p className="text-muted-foreground">
                        Ocurrió un error inesperado en la aplicación.
                    </p>
                </div>

                {error.digest && (
                    <div className="p-3 bg-muted rounded-md text-[10px] font-mono text-muted-foreground break-all">
                        Digest ID: {error.digest}
                    </div>
                )}

                <div className="text-left space-y-4">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Detalle del Error:</p>
                    <pre className="p-4 bg-muted/30 border rounded-lg text-[10px] font-mono text-gray-700 overflow-auto max-h-[300px] whitespace-pre-wrap">
                        {error.message || 'No se proporcionó mensaje público de error.'}
                        {"\n\n"}
                        {error.stack || 'No hay stack trace disponible.'}
                    </pre>
                </div>

                <div className="flex justify-center gap-4">
                    <Button onClick={() => reset()} variant="default">
                        Reintentar
                    </Button>
                    <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                        Volver al Inicio
                    </Button>
                </div>
            </div>
        </div>
    )
}
