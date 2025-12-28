'use client'

import { ManagementCharts } from './charts'
import { ControlLists } from './control-lists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react'

interface ManagementDashboardClientProps {
    data: {
        monthlyStats: any[]
        activeProjects: number
        closedProjects: number
        negativeUtilityProjects: any[]
        pendingOrders: any[]
        agedProjects: any[]
    }
}

export function ManagementDashboardClient({ data }: ManagementDashboardClientProps) {
    // Current month stats (from the last entry in monthlyStats)
    const currentMonth = data.monthlyStats[data.monthlyStats.length - 1] || { ingresos: 0, egresos: 0, utilidad: 0 }

    return (
        <div className="space-y-10">
            <header className="border-b border-secondary pb-6">
                <h1 className="text-5xl font-brand-header text-primary tracking-tight">Panel de Dirección</h1>
                <p className="text-base text-foreground/70 font-brand-ui">Análisis estratégico y control de proyectos Kunst & Design</p>
            </header>

            {/* Quick Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-none shadow-xl bg-primary text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-brand-header tracking-widest text-white/70 uppercase">Ingresos Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-brand-header tracking-wider whitespace-nowrap">${currentMonth.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-secondary bg-white shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform text-rose-600">
                        <TrendingDown className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-brand-header tracking-widest text-primary/60 uppercase">Egresos Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-brand-header tracking-wider text-rose-600 whitespace-nowrap">${currentMonth.egresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-xl bg-secondary text-primary overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-16 w-16" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-brand-header tracking-widest text-primary/70 uppercase">Utilidad Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-brand-header tracking-wider whitespace-nowrap">${currentMonth.utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-secondary bg-white shadow-lg overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-brand-header tracking-widest text-primary/60 uppercase">Proyectos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-brand-header text-primary">{data.activeProjects}</span>
                            <span className="text-[10px] font-brand-header text-primary/40 uppercase tracking-tighter">activos /</span>
                            <span className="text-xl font-brand-header text-primary/30">{data.closedProjects}</span>
                            <span className="text-[10px] font-brand-header text-primary/40 uppercase tracking-tighter">cerrados</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visual Charts */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-brand-header text-primary tracking-wide">Tendencias Financieras</h2>
                </div>
                <ManagementCharts data={data.monthlyStats} />
            </section>

            {/* Critical Control Lists */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                    <Target className="h-6 w-6 text-rose-500" />
                    <h2 className="text-3xl font-brand-header text-primary tracking-wide uppercase">Listas de Control Crítico</h2>
                </div>
                <ControlLists
                    negativeUtilityProjects={data.negativeUtilityProjects}
                    pendingOrders={data.pendingOrders}
                    agedProjects={data.agedProjects}
                />
            </section>
        </div>
    )
}
