"use client"

import { useState } from 'react'
import {
    LayoutDashboard,
    FileText,
    Truck,
    CheckSquare,
    DollarSign,
    TrendingUp,
    Calendar,
    Users,
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProjectHubClientProps {
    project: any
}

export function ProjectHubClient({ project }: ProjectHubClientProps) {
    const [activeTab, setActiveTab] = useState('resumen')

    // Calculated metrics
    const totalCotizado = project.quotes?.[0]?.total || 0
    const totalIngresado = project.incomes?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0
    const totalEgresado = project.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0
    const utilidad = totalIngresado - totalEgresado

    return (
        <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href="/projects" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Volver a Proyectos
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Archivar</Button>
                        <Button size="sm">Editar Proyecto</Button>
                    </div>
                </div>

                {/* Header Card */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm border-l-4 border-l-primary">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase text-[10px] px-3 font-bold">
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">{project.description || 'Sin descripción adicional.'}</p>
                            <div className="flex flex-wrap gap-4 text-sm pt-2">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span className="font-medium text-foreground">{project.client?.company || project.client?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Iniciado {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:border-l md:pl-8">
                            <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Cotizado</span>
                                <div className="text-xl font-bold">${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cobrao (Ingresos)</span>
                                <div className="text-xl font-bold text-emerald-600">${totalIngresado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pagado (Egresos)</span>
                                <div className="text-xl font-bold text-rose-600">${totalEgresado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="resumen" onValueChange={setActiveTab} className="space-y-6">
                    <div className="bg-card border rounded-xl p-1 shadow-sm sticky top-4 z-10 overflow-x-auto">
                        <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-1">
                            <TabsTrigger value="resumen" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 rounded-lg flex gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Resumen</span>
                            </TabsTrigger>
                            <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 rounded-lg flex gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Cotizaciones</span>
                                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 bg-muted/50">{project.quotes?.length || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 rounded-lg flex gap-2">
                                <Truck className="h-4 w-4" />
                                <span className="hidden sm:inline">Órdenes</span>
                                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 bg-muted/50">{project.supplierOrders?.length || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 rounded-lg flex gap-2">
                                <CheckSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Tareas</span>
                                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 bg-muted/50">{project.supplierTasks?.length || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 rounded-lg flex gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="hidden sm:inline">Finanzas</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="resumen" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detailed Balance Card */}
                            <div className="md:col-span-2 bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Balance del Proyecto
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground uppercase font-semibold">Ingresos Reales</span>
                                            <div className="text-2xl font-bold text-emerald-600">${totalIngresado.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all"
                                                style={{ width: `${Math.min((totalIngresado / (totalCotizado || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            {((totalIngresado / (totalCotizado || 1)) * 100).toFixed(1)}% del total cotizado cobrado.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground uppercase font-semibold">Egresos Reales</span>
                                            <div className="text-2xl font-bold text-rose-600">${totalEgresado.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500 transition-all"
                                                style={{ width: `${Math.min((totalEgresado / (totalIngresado || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            {totalIngresado > 0 ? ((totalEgresado / totalIngresado) * 100).toFixed(1) : 0}% del ingreso ejecutado.
                                        </p>
                                    </div>

                                    <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <div className="space-y-1">
                                            <span className="text-xs text-primary uppercase font-bold">Utilidad Actual</span>
                                            <div className="text-2xl font-black text-primary">${utilidad.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary/70 uppercase">
                                            Margen: {totalIngresado > 0 ? ((utilidad / totalIngresado) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h4 className="text-sm font-bold mb-4">Próximos Hitos Financieros</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center">
                                            <span className="text-xs">Pendiente por Cobrar:</span>
                                            <span className="font-bold text-sm">${(totalCotizado - totalIngresado).toLocaleString('es-MX')}</span>
                                        </div>
                                        <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center">
                                            <span className="text-xs">Pendiente por Pagar:</span>
                                            <span className="font-bold text-sm text-muted-foreground">Calculando...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity/Status Card */}
                            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Avance del Proyecto
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Tareas Completadas</span>
                                            <span className="font-bold">{project.supplierTasks?.filter((t: any) => t.status === 'COMPLETED').length || 0} / {project.supplierTasks?.length || 0}</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${(project.supplierTasks?.length > 0 ? (project.supplierTasks.filter((t: any) => t.status === 'COMPLETED').length / project.supplierTasks.length) * 100 : 0)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Órdenes Recibidas</span>
                                            <span className="font-bold">{project.supplierOrders?.filter((o: any) => o.status === 'RECEIVED').length || 0} / {project.supplierOrders?.length || 0}</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 transition-all"
                                                style={{ width: `${(project.supplierOrders?.length > 0 ? (project.supplierOrders.filter((o: any) => o.status === 'RECEIVED').length / project.supplierOrders.length) * 100 : 0)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Link href={`/projects/${project.id}/report`} className="w-full">
                                            <Button className="w-full justify-start text-xs h-9" variant="outline">
                                                <FileText className="mr-2 h-4 w-4" /> Descargar Status PDF
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="quotes" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Listado de Cotizaciones</h3>
                                <Button size="sm" className="gap-2">
                                    <FileText className="h-4 w-4" /> Nueva Versión
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {project.quotes?.map((quote: any) => (
                                    <div key={quote.id} className="group p-4 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-bold flex items-center gap-2">
                                                {quote.project_name}
                                                <Badge variant="outline" className="text-[10px]">v{quote.version}</Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(quote.date), 'dd MMMM yyyy', { locale: es })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-sm font-bold">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                                <Badge variant="outline" className="text-[10px]">{quote.status}</Badge>
                                            </div>
                                            <Link href={`/quotes/${quote.id}`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="m-0">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm text-center py-12 text-muted-foreground">
                            <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Funcionalidad de Órdenes de Compra por proyecto se activará en el siguiente paso.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="m-0">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm text-center py-12 text-muted-foreground">
                            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Gestión de Tareas (Kanban) centralizado por proyecto próximamente.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="financials" className="m-0">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm text-center py-12 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Control de Caja y Balance de Proyecto próximamente.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
