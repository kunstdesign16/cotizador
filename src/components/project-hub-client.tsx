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
    ChevronLeft,
    CheckCircle2,
    Lock,
    ExternalLink,
    Plus,
    History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { approveQuote } from '@/actions/quotes'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RegisterOrderPaymentDialog } from './register-order-payment-dialog'
import { closeProject, getProjectClosureEligibility } from '@/actions/projects'

interface ProjectHubClientProps {
    project: any
}

export function ProjectHubClient({ project }: ProjectHubClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('resumen')
    const [isApproving, setIsApproving] = useState<string | null>(null)
    const [isClosing, setIsClosing] = useState(false)

    // Calculated metrics
    const approvedQuote = project.quotes?.find((q: any) => q.isApproved) || project.quotes?.[0]
    const totalCotizado = approvedQuote?.total || 0
    const totalIngresado = project.incomes?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0
    const totalEgresado = project.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0
    const utilidad = totalIngresado - totalEgresado

    const handleApprove = async (quoteId: string) => {
        if (!confirm('¿Está seguro de aprobar esta cotización? Esto marcará el proyecto como APROBADO y bloqueará ediciones en esta versión.')) return

        setIsApproving(quoteId)
        try {
            const res = await approveQuote(quoteId)
            if (res.success) {
                toast.success('Proyecto aprobado exitosamente')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al aprobar')
            }
        } catch (error) {
            toast.error('Error de red al aprobar')
        } finally {
            setIsApproving(null)
        }
    }

    const handleCloseProject = async () => {
        const eligibility = await getProjectClosureEligibility(project.id)
        if (!eligibility.eligible) {
            toast.error(eligibility.error || 'No se puede cerrar el proyecto aún.')
            return
        }

        if (!confirm('¿Está seguro de CERRAR el proyecto? Esta acción es irreversible y bloqueará todos los pagos, órdenes y ediciones de cotizaciones.')) return

        setIsClosing(true)
        try {
            const res = await (closeProject as any)(project.id)
            if (res.success) {
                toast.success('Proyecto cerrado exitosamente')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al cerrar proyecto')
            }
        } catch (error) {
            toast.error('Error de red al cerrar')
        } finally {
            setIsClosing(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href="/projects" className="flex items-center text-xs font-brand-header uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Proyectos
                    </Link>
                    <div className="flex gap-2">
                        {project.status !== 'CERRADO' && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCloseProject} disabled={isClosing} className="rounded-xl border-secondary text-primary font-brand-header uppercase tracking-wider text-xs">
                                    {isClosing ? 'Cerrando...' : 'Cerrar Obra'}
                                </Button>
                                <Button size="sm" className="rounded-xl font-brand-header uppercase tracking-wider text-xs shadow-lg shadow-primary/20">Editar</Button>
                            </>
                        )}
                        {project.status === 'CERRADO' && (
                            <Badge className="bg-primary text-white gap-1.5 px-4 py-1.5 font-brand-header tracking-widest uppercase">
                                <Lock className="h-3 w-3" /> CERRADO
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Header Card */}
                <div className="bg-white border border-secondary rounded-3xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-5xl font-brand-header text-primary tracking-tight leading-none">{project.name}</h1>
                                <Badge className={`uppercase text-[11px] px-3 py-1 font-brand-header tracking-widest border-0 flex items-center gap-1.5 ${project.status === 'COTIZANDO' ? 'bg-secondary text-primary' :
                                    project.status === 'APROBADO' ? 'bg-primary text-white' :
                                        project.status === 'CERRADO' ? 'bg-primary/20 text-primary' :
                                            'bg-secondary text-primary'
                                    }`}>
                                    {project.status !== 'COTIZANDO' && <Lock className="h-3 w-3" />}
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-foreground/70 max-w-2xl font-brand-ui text-sm leading-relaxed">{project.description || 'Sin descripción adicional disponible para este proyecto.'}</p>
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
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:border-l md:border-secondary md:pl-10">
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest">Total Cotizado</span>
                                <div className="text-3xl font-brand-header text-primary">${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest">Cobrado (Ing)</span>
                                <div className="text-3xl font-brand-header text-primary">${totalIngresado.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest">Pagado (Egr)</span>
                                <div className="text-3xl font-brand-header text-primary">${totalEgresado.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</div>
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
                            <TabsTrigger value="closure" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white py-2.5 px-4 rounded-lg flex gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Cierre Final</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="resumen" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detailed Balance Card */}
                            <div className="md:col-span-2 bg-white border border-secondary rounded-3xl p-8 shadow-lg space-y-8">
                                <h3 className="text-3xl font-brand-header text-primary flex items-center gap-3 tracking-wide">
                                    <TrendingUp className="h-6 w-6" />
                                    Balance Operativo
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-primary/50 uppercase font-brand-header tracking-widest">Ingresos Totales</span>
                                            <div className="text-4xl font-brand-header text-primary">${totalIngresado.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${Math.min((totalIngresado / (totalCotizado || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-foreground/60 font-medium">
                                            {((totalIngresado / (totalCotizado || 1)) * 100).toFixed(1)}% RECAUDADO DEL TOTAL
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-primary/50 uppercase font-brand-header tracking-widest">Egresos Ejecutados</span>
                                            <div className="text-4xl font-brand-header text-primary">${totalEgresado.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/60 transition-all shadow-[0_0_8px_rgba(40,73,96,0.2)]"
                                                style={{ width: `${Math.min((totalEgresado / (totalIngresado || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-foreground/60 font-medium">
                                            {totalIngresado > 0 ? ((totalEgresado / totalIngresado) * 100).toFixed(1) : 0}% DEL CAPITAL ABSORBIDO
                                        </p>
                                    </div>

                                    <div className="space-y-4 bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/10">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-white/70 uppercase font-brand-header tracking-widest">Utilidad Obra</span>
                                            <div className="text-4xl font-brand-header tracking-wider">${utilidad.toLocaleString('es-MX')}</div>
                                        </div>
                                        <div className="text-[11px] font-brand-header tracking-widest uppercase border-t border-white/20 pt-2">
                                            MARGEN: {totalIngresado > 0 ? ((utilidad / totalIngresado) * 100).toFixed(1) : 0}%
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
                                    <div key={quote.id} className={`group p-4 rounded-xl border transition-all flex items-center justify-between ${quote.isApproved ? 'border-emerald-500/50 bg-emerald-50/5' : 'hover:border-primary/50 hover:shadow-md'}`}>
                                        <div className="space-y-1">
                                            <div className="font-bold flex items-center gap-2">
                                                {quote.project_name}
                                                <Badge variant="outline" className="text-[10px]">v{quote.version}</Badge>
                                                {quote.isApproved && (
                                                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1 text-[10px] h-5 border-0">
                                                        <CheckCircle2 className="h-3 w-3" /> APROBADA
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(quote.date), 'dd MMMM yyyy', { locale: es })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right mr-2">
                                                <div className="text-sm font-bold">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                                <Badge variant="outline" className="text-[10px] uppercase">{quote.status}</Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!quote.isApproved && project.status === 'COTIZANDO' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleApprove(quote.id)}
                                                        disabled={!!isApproving}
                                                    >
                                                        {isApproving === quote.id ? 'Aprobando...' : 'Aprobar'}
                                                    </Button>
                                                )}

                                                <Link href={`/quotes/${quote.id}${project.status !== 'COTIZANDO' ? '' : '/edit'}`}>
                                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs border">
                                                        {project.status !== 'COTIZANDO' ? 'Ver' : 'Editar'}
                                                        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="m-0 pt-6">
                        <div className="space-y-4">
                            {!project.supplierOrders || project.supplierOrders.length === 0 ? (
                                <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground shadow-sm">
                                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No hay órdenes de compra generadas para este proyecto.</p>
                                    <p className="text-sm mt-2">Ve a la pestaña de Cotizaciones y genera órdenes desde los costos internos.</p>
                                </div>
                            ) : (
                                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="p-4 text-left font-semibold">Referencia / Proveedor</th>
                                                <th className="p-4 text-center font-semibold text-muted-foreground">Estado Pago</th>
                                                <th className="p-4 text-right font-semibold">Total Ordenado</th>
                                                <th className="p-4 text-right font-semibold">Total Pagado</th>
                                                <th className="p-4 text-right font-semibold">Saldo Pendiente</th>
                                                <th className="p-4 text-center font-semibold">Operaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {project.supplierOrders.map((order: any) => {
                                                const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
                                                const totalOrdered = items.reduce((sum: number, item: any) =>
                                                    sum + (item.unitCost || 0) * (item.quantity || 0), 0
                                                )
                                                const totalPaid = order.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0
                                                const pending = totalOrdered - totalPaid

                                                return (
                                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-medium flex items-center gap-2">
                                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                                {order.supplier?.name}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase">
                                                                ID: {order.id.slice(-6)} • {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es })}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-[10px] py-0 h-5 border-transparent ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                                    order.paymentStatus === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                                    }`}
                                                            >
                                                                {order.paymentStatus === 'PAID' ? 'PAGADA' :
                                                                    order.paymentStatus === 'PARTIAL' ? 'PARCIAL' :
                                                                        'PENDIENTE'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right font-medium">
                                                            ${totalOrdered.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-4 text-right font-medium text-emerald-600">
                                                            ${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <span className={`font-bold ${pending > 0.01 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                                                ${pending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {pending > 0.01 && (
                                                                    <RegisterOrderPaymentDialog order={order} />
                                                                )}
                                                                <Link href={`/supplier-orders/${order.id}`}>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
                    <TabsContent value="closure" className="m-0 space-y-6">
                        <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-8 relative overflow-hidden">
                            {project.status === 'CERRADO' && (
                                <div className="absolute top-10 right-10 rotate-12 opacity-10 pointer-events-none">
                                    <div className="border-8 border-slate-900 text-slate-900 px-8 py-4 font-black text-6xl rounded-2xl uppercase">CERRADO</div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Resumen Final de Obra</h3>
                                    <p className="text-muted-foreground">Balance consolidado y auditoría de egresos vs ingresos.</p>
                                </div>
                                {project.status !== 'CERRADO' && (
                                    <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 gap-2" onClick={handleCloseProject} disabled={isClosing}>
                                        <Lock className="h-4 w-4" />
                                        Finalizar y Cerrar Proyecto
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-muted/40 p-6 rounded-2xl border space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Cotizado</span>
                                    <div className="text-3xl font-black">${totalCotizado.toLocaleString('es-MX')}</div>
                                    <p className="text-[10px] text-muted-foreground">Importe aprobado por el cliente</p>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest">Total Ingresado</span>
                                    <div className="text-3xl font-black text-emerald-600">${totalIngresado.toLocaleString('es-MX')}</div>
                                    <p className="text-[10px] text-emerald-600/70">Pagos reales recibidos</p>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-widest">Total Gastado</span>
                                    <div className="text-3xl font-black text-rose-600">${totalEgresado.toLocaleString('es-MX')}</div>
                                    <p className="text-[10px] text-rose-600/70">Pagos a proveedores y gastos</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2 text-white">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Utilidad Final</span>
                                    <div className="text-3xl font-black text-white">${utilidad.toLocaleString('es-MX')}</div>
                                    <p className="text-[10px] text-slate-400">Margen neto: {totalIngresado > 0 ? ((utilidad / totalIngresado) * 100).toFixed(1) : 0}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Desglose de Órdenes
                                    </h4>
                                    <div className="bg-muted/30 rounded-xl overflow-hidden border">
                                        <table className="w-full text-[11px]">
                                            <thead className="bg-muted border-b">
                                                <tr>
                                                    <th className="p-2 text-left">Proveedor</th>
                                                    <th className="p-2 text-right">Cotizado</th>
                                                    <th className="p-2 text-right">Pagado</th>
                                                    <th className="p-2 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {project.supplierOrders?.map((o: any) => {
                                                    const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
                                                    const total = items.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0)
                                                    const paid = o.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0
                                                    return (
                                                        <tr key={o.id}>
                                                            <td className="p-2 font-medium">{o.supplier?.name}</td>
                                                            <td className="p-2 text-right">${total.toLocaleString()}</td>
                                                            <td className="p-2 text-right font-bold text-emerald-600">${paid.toLocaleString()}</td>
                                                            <td className="p-2 text-center capitalize">{o.paymentStatus}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                        <History className="h-4 w-4" /> Auditoría de Flujo
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between p-3 bg-muted/40 rounded-lg border">
                                            <span className="text-xs">Diferencia Cotizado vs Cobrado:</span>
                                            <span className={`text-xs font-bold ${totalCotizado - totalIngresado > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                ${(totalCotizado - totalIngresado).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-muted/40 rounded-lg border">
                                            <span className="text-xs">Gastos Variables Extra:</span>
                                            <span className="text-xs font-bold text-slate-700">
                                                ${(project.expenses?.filter((e: any) => !e.supplierOrderId).reduce((s: number, e: any) => s + e.amount, 0) || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Estatus de Cierre</span>
                                            <p className="text-xs leading-relaxed italic text-slate-600">
                                                {project.status === 'CERRADO'
                                                    ? 'Este proyecto ha sido auditado y cerrado. No se permiten más movimientos financieros.'
                                                    : 'Proyecto en curso. El balance final se bloqueará al confirmar el cierre de obra.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
