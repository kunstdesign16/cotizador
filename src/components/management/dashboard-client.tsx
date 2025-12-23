'use client'

import { ManagementCharts } from './charts'
import { ControlLists } from './control-lists'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown, Target, CheckCircle2, Clock } from 'lucide-react'

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
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Dirección</h1>
                <p className="text-muted-foreground">Análisis estratégico y control de proyectos</p>
            </header>

            {/* Quick Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl border shadow-sm bg-emerald-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">${currentMonth.ingresos.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-sm bg-rose-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Egresos Mes</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">${currentMonth.egresos.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-sm bg-indigo-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Utilidad Mes</CardTitle>
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-700">${currentMonth.utilidad.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
                        <div className="flex gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{data.activeProjects}</span>
                            <span className="text-xs text-muted-foreground">activos /</span>
                            <span className="text-lg font-semibold text-muted-foreground">{data.closedProjects}</span>
                            <span className="text-xs text-muted-foreground">cerrados</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visual Charts */}
            <ManagementCharts data={data.monthlyStats} />

            {/* Critical Control Lists */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Listas de Control Crítico</h2>
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
