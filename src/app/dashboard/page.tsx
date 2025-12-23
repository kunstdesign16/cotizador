import { Button } from "@/components/ui/button"
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    return (
        <div className="p-8 text-center space-y-4">
            <h1 className="text-3xl font-bold">Modo de Diagnóstico</h1>
            <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl inline-block max-w-xl">
                <p className="text-blue-800 mb-4">
                    El tablero está temporalmente en <strong>Modo Estático</strong> para identificar la causa del error.
                </p>
                <p className="text-sm text-blue-600">
                    Si estás viendo esta pantalla, el error <strong>NO</strong> está en el diseño global (Sidebar/Layout), sino en las consultas de datos del tablero.
                </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
                <Button asChild>
                    <Link href="/projects">Ver Proyectos</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/quotes/new">Nueva Cotización</Link>
                </Button>
            </div>
        </div>
    )
}
