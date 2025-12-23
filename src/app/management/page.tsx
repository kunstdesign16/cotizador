'use client'

import { BarChart, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ManagementPlaceholder() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Dirección</h1>
                    <p className="text-muted-foreground">
                        Estamos construyendo las herramientas de reporte avanzado para la Fase 10.
                    </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-left">
                    <Construction className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 space-y-1">
                        <p className="font-bold">Próximamente:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Rentabilidad por proyecto en tiempo real</li>
                            <li>Flujo de caja mensual detallado</li>
                            <li>Reportes descargables para contabilidad</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-4">
                    <Link href="/dashboard">
                        <Button variant="outline">Volver al Inicio</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
