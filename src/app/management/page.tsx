import { ManagementDashboardClient } from '@/components/management/dashboard-client'
import { getManagementDashboardData } from '@/actions/management'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ManagementPage() {
    try {
        const data = await getManagementDashboardData()

        return (
            <div className="min-h-screen bg-background p-8">
                <div className="mx-auto max-w-7xl">
                    <ManagementDashboardClient data={data} />
                </div>
            </div>
        )
    } catch (error: any) {
        console.error('Error in ManagementPage:', error)
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
                        <h2 className="text-red-800 font-bold text-lg mb-2">Error en Panel de Dirección</h2>
                        <p className="text-red-600 text-sm mb-4">
                            No se pudieron cargar los datos analíticos. Esto puede deberse a discrepancias en el esquema o datos incompletos.
                        </p>
                        <div className="text-left bg-white/50 p-3 rounded border text-[10px] font-mono text-gray-600 overflow-auto max-h-[150px]">
                            {error.message}
                        </div>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline">Volver al Inicio</Button>
                    </Link>
                </div>
            </div>
        )
    }
}
