import { AccountingDashboard } from '@/components/accounting/dashboard'
import { getAccountingSummary } from '@/actions/accounting'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth-utils'

// Allow searchParams
export const dynamic = 'force-dynamic'

export default async function AccountingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto py-32 text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
                <p className="text-muted-foreground">Solo los administradores pueden ver el panel de contabilidad.</p>
                <Link href="/dashboard">
                    <Button variant="outline">Ir a Mis Proyectos</Button>
                </Link>
            </div>
        )
    }
    const resolvedParams = await searchParams
    // Default to current month if not specified
    const month = typeof resolvedParams?.month === 'string' ? resolvedParams.month : new Date().toISOString().slice(0, 7)

    try {
        const { getAccountingTrends } = await import('@/actions/accounting')
        const { getActiveProjects } = await import('@/actions/quotes')
        const { getSuppliers } = await import('@/actions/suppliers')

        const summary = await getAccountingSummary(month)
        const trends = await getAccountingTrends()
        const projects = await getActiveProjects()
        const fetchedSuppliers = await getSuppliers()
        const serializedSuppliers = JSON.parse(JSON.stringify(fetchedSuppliers))

        return (
            <div className="container mx-auto py-8">
                <AccountingDashboard
                    summary={JSON.parse(JSON.stringify(summary))}
                    trends={JSON.parse(JSON.stringify(trends))}
                    projects={JSON.parse(JSON.stringify(projects))}
                    suppliers={serializedSuppliers}
                    month={month}
                />
            </div>
        )
    } catch (error: any) {
        console.error("Error fetching accounting data:", error)
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="p-6 border border-red-200 bg-red-50 rounded-xl">
                        <h2 className="text-red-800 font-bold text-lg mb-2">Error Contable</h2>
                        <p className="text-red-600 text-sm mb-4">
                            No se pudieron cargar los datos financieros. Esto puede deberse a discrepancias en el esquema de la base de datos.
                        </p>
                        <div className="text-left bg-white/50 p-3 rounded border text-[10px] font-mono text-gray-600 overflow-auto max-h-[150px]">
                            {error.message}
                        </div>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline">Volver al Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }
}
