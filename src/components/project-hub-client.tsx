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
    Plus,
    History as HistoryIcon,
    Trash2,
    Info,
    X
} from 'lucide-react'
import { BackButton } from "@/components/ui/back-button"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { approveQuote } from '@/actions/quotes'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RegisterOrderPaymentDialog } from './register-order-payment-dialog'
import { closeProject, getProjectClosureEligibility, deleteProject, updateProjectStatus } from '@/actions/projects'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ProjectHubClientProps {
    project: any
}

export function ProjectHubClient({ project }: ProjectHubClientProps) {
    const router = useRouter()
    const [isApproving, setIsApproving] = useState<string | null>(null)
    const [isClosing, setIsClosing] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    // Income dialog states
    const [showIncomeDialog, setShowIncomeDialog] = useState(false)
    const [incomeAmount, setIncomeAmount] = useState('')
    const [incomeDescription, setIncomeDescription] = useState('')
    const [incomePaymentMethod, setIncomePaymentMethod] = useState('')
    const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0])
    const [loadingIncome, setLoadingIncome] = useState(false)

    // Calculated metrics
    const approvedQuote = project.quotes?.find((q: any) => q.isApproved)
    const totalCotizado = approvedQuote?.total || 0
    const totalCotizadoSubtotal = approvedQuote?.subtotal || 0
    const isrRetenido = approvedQuote?.isr_amount || 0

    const totalIngresado = project.incomes?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0
    const totalIngresadoSubtotal = project.incomes?.reduce((sum: number, i: any) => {
        const incomeIva = i.iva > 0 ? i.iva : (i.amount - (i.amount / 1.16))
        return sum + (i.amount - incomeIva)
    }, 0) || 0

    const totalEgresado = project.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0
    const totalEgresadoSubtotal = project.expenses?.reduce((sum: number, e: any) => {
        const expenseIva = e.iva > 0 ? e.iva : (e.amount - (e.amount / 1.16))
        return sum + (e.amount - expenseIva)
    }, 0) || 0

    // Utilidad Real = Ingresos (sin IVA) - Egresos (sin IVA) - ISR Retenido
    const utilidad = totalIngresadoSubtotal - totalEgresadoSubtotal - isrRetenido
    const totalCobrado = totalIngresado // Alias for clarity in financials tab

    const isFinancialmenteCerrado = project.financialStatus === 'CERRADO'


    const handleApprove = async (quoteId: string) => {
        if (isFinancialmenteCerrado) return
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
        } catch {
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
        } catch {
            toast.error('Error de red al cerrar')
        } finally {
            setIsClosing(false)
        }
    }


    const handleStatusChange = async (newStatus: string) => {
        setIsUpdatingStatus(true)
        try {
            const res = await updateProjectStatus(project.id, newStatus as any)
            if (res.success) {
                toast.success(`Estado operativo actualizado a ${newStatus}`)
                router.refresh()
            } else {
                toast.error(res.error || 'Error al actualizar estado')
            }
        } catch {
            toast.error('Error de red al actualizar estado')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleIncomeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingIncome(true)

        try {
            const { createIncome } = await import('@/actions/accounting')
            const amount = parseFloat(incomeAmount)
            const result = await createIncome({
                amount: amount,
                iva: amount - (amount / 1.16),
                description: incomeDescription || 'Pago del cliente',
                date: new Date(incomeDate),
                projectId: project.id,
                quoteId: approvedQuote?.id,
                paymentMethod: incomePaymentMethod || undefined
            })

            if (result.success) {
                toast.success('Ingreso registrado correctamente')
                setShowIncomeDialog(false)
                setIncomeAmount('')
                setIncomeDescription('')
                setIncomePaymentMethod('')
                setIncomeDate(new Date().toISOString().split('T')[0])
                router.refresh()
            } else {
                toast.error(result.error || 'Error al registrar ingreso')
            }
        } catch {
            console.error('Error al registrar ingreso')
            toast.error('Error al registrar ingreso')
        } finally {
            setLoadingIncome(false)
        }
    }


    return (
        <div className="min-h-screen bg-muted/30 p-3 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <BackButton fallbackUrl="/projects" label="Proyectos" className="bg-transparent hover:bg-transparent px-0 font-brand-header uppercase tracking-widest text-primary/60 hover:text-primary h-auto" />
                    <div className="flex flex-wrap gap-2">
                        {!isFinancialmenteCerrado && project.status === 'draft' && (
                            <>
                                {project.quotes?.length === 0 ? (
                                    <Link href={`/quotes/new?projectId=${project.id}`}>
                                        <Button className="rounded-xl font-brand-header uppercase tracking-wider text-xs shadow-lg shadow-primary/20 gap-2">
                                            <Plus className="h-4 w-4" /> Crear Cotización
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/quotes/${project.quotes[0].id}/edit`}>
                                        <Button className="rounded-xl font-brand-header uppercase tracking-wider text-xs shadow-lg shadow-primary/20 gap-2">
                                            <FileText className="h-4 w-4" /> Gestionar Cotización
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="outline" size="sm" className="rounded-xl border-secondary text-primary font-brand-header uppercase tracking-wider text-xs">
                                    Editar Proyecto
                                </Button>
                            </>
                        )}
                        {!isFinancialmenteCerrado && project.status !== 'draft' && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCloseProject} disabled={isClosing} className="rounded-xl border-secondary text-primary font-brand-header uppercase tracking-wider text-xs">
                                    {isClosing ? 'Cerrando...' : 'Cerrar Obra'}
                                </Button>
                                {/* Edición bloqueada si no es borrador */}
                            </>
                        )}
                        {isFinancialmenteCerrado && (
                            <div className="flex items-center gap-2">
                                <Badge className="bg-slate-900 text-white gap-1.5 px-3 py-1.5 font-brand-header tracking-widest uppercase text-[9px] sm:text-xs">
                                    <Lock className="h-3 w-3" /> PROYECTO CERRADO
                                </Badge>
                                <span className="text-[9px] text-muted-foreground font-brand-header uppercase tracking-widest max-w-[120px] sm:max-w-[150px] leading-tight">
                                    Solo lectura por cierre financiero
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Header Card */}
                <div className="bg-white border border-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-3">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <h1 className="text-xl sm:text-3xl font-brand-header text-primary tracking-tight leading-tight break-words flex-1 min-w-[200px]">{project.name}</h1>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={project.status}
                                        onValueChange={handleStatusChange}
                                        disabled={isUpdatingStatus || isFinancialmenteCerrado}
                                    >
                                        <SelectTrigger className={`w-full sm:w-[180px] h-8 uppercase text-[10px] sm:text-[11px] font-brand-header tracking-widest border-0 flex items-center gap-1.5 shadow-sm rounded-lg ${project.status === 'draft' ? 'bg-secondary text-primary' :
                                            project.status === 'active' ? 'bg-blue-500 text-white' :
                                                project.status === 'closed' ? 'bg-primary text-white' :
                                                    project.status === 'cancelled' ? 'bg-red-500 text-white' :
                                                        'bg-secondary text-primary'
                                            }`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">COTIZANDO</SelectItem>
                                            <SelectItem value="active">EN PRODUCCIÓN</SelectItem>
                                            <SelectItem value="closed">ENTREGADO</SelectItem>
                                            <SelectItem value="cancelled">CANCELADO</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Badge className={`uppercase text-[9px] sm:text-[11px] px-2 sm:px-3 py-1.5 font-brand-header tracking-widest border-0 flex items-center gap-1.5 rounded-lg shadow-sm whitespace-nowrap ${project.financialStatus === 'ABIERTO' ? 'bg-blue-50 text-blue-700' : 'bg-slate-900 text-white'}`}>
                                        {project.financialStatus === 'CERRADO' ? <Lock className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                                        FINANZAS: {project.financialStatus}
                                    </Badge>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className={`uppercase text-[10px] tracking-widest ${approvedQuote ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                        Cotización: {approvedQuote ? 'APROBADA' : 'BORRADOR'}
                                    </Badge>
                                    <Badge variant="outline" className="uppercase text-[10px] tracking-widest bg-slate-50 text-slate-700 border-slate-200">
                                        Proyecto: {project.status === 'active' ? 'EN PRODUCCIÓN' : project.status === 'draft' ? 'COTIZANDO' : project.status === 'closed' ? 'ENTREGADO' : 'CANCELADO'}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-foreground/70 max-w-2xl font-brand-ui text-sm leading-relaxed">{project.description || 'Sin descripción adicional disponible para este proyecto.'}</p>
                            {project.status === 'draft' && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl">
                                    <p className="text-xs text-blue-700 font-brand-ui">
                                        <strong>Siguiente paso:</strong> {project.quotes?.length === 0
                                            ? 'Crea una cotización para este proyecto.'
                                            : approvedQuote ? 'Proyecto aprobado. Cambie el estatus a Producción.' : 'Aprueba una cotización para continuar el flujo.'}
                                    </p>
                                </div>
                            )}
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
                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 md:border-l md:border-secondary md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-secondary/50 h-full items-center">
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest pl-1">Total Cotizado</span>
                                <div className="text-xl md:text-lg lg:text-xl xl:text-2xl font-brand-header text-primary whitespace-nowrap">
                                    ${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest pl-1">Cobrado (Ing)</span>
                                <div className="text-xl md:text-lg lg:text-xl xl:text-2xl font-brand-header text-primary whitespace-nowrap">
                                    ${totalIngresado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary/50 uppercase font-brand-header tracking-widest pl-1">Pagado (Egr)</span>
                                <div className="text-xl md:text-lg lg:text-xl xl:text-2xl font-brand-header text-primary whitespace-nowrap">
                                    ${totalEgresado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="resumen" className="space-y-6">
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
                                            <span className="text-[11px] text-primary/50 uppercase font-brand-header tracking-widest">Ingresos (Sin IVA)</span>
                                            <div className="text-2xl sm:text-3xl font-brand-header text-primary whitespace-nowrap">
                                                ${totalIngresadoSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${Math.min((totalIngresadoSubtotal / (totalCotizadoSubtotal || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-foreground/60 font-medium">
                                            {((totalIngresadoSubtotal / (totalCotizadoSubtotal || 1)) * 100).toFixed(1)}% RECAUDADO DEL SUBTOTAL
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-primary/50 uppercase font-brand-header tracking-widest">Egresos (Sin IVA)</span>
                                            <div className="text-2xl sm:text-3xl font-brand-header text-primary whitespace-nowrap">
                                                ${totalEgresadoSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/60 transition-all shadow-[0_0_8px_rgba(40,73,96,0.2)]"
                                                style={{ width: `${Math.min((totalEgresadoSubtotal / (totalIngresadoSubtotal || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-foreground/60 font-medium">
                                            {totalIngresadoSubtotal > 0 ? ((totalEgresadoSubtotal / totalIngresadoSubtotal) * 100).toFixed(1) : 0}% DEL CAPITAL ABSORBIDO
                                        </p>
                                    </div>

                                    <div className="space-y-4 bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/10">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-white/70 uppercase font-brand-header tracking-widest">Utilidad Real</span>
                                            <div className="text-2xl sm:text-3xl font-brand-header tracking-wider whitespace-nowrap">
                                                ${utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-brand-header tracking-widest uppercase border-t border-white/20 pt-2">
                                            {isrRetenido > 0 && <span>ISR: ${isrRetenido.toLocaleString('es-MX')} | </span>}
                                            MARGEN: {totalIngresadoSubtotal > 0 ? ((utilidad / totalIngresadoSubtotal) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h4 className="text-sm font-bold mb-4">Próximos Hitos Financieros</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center">
                                            <span className="text-xs">Pendiente por Cobrar:</span>
                                            <span className="font-bold text-sm text-right truncate pl-2">${(totalCotizado - totalIngresado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center">
                                            <span className="text-xs">Pendiente por Pagar:</span>
                                            <span className="font-bold text-sm text-muted-foreground text-right truncate pl-2">Calculando...</span>
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
                                        {project.status === 'draft' && project.quotes?.length === 0 && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-xs text-blue-700">
                                                    <strong>Acción requerida:</strong> Crea una cotización para activar el flujo del proyecto.
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            className="w-full justify-start text-xs h-9"
                                            variant="outline"
                                            onClick={async () => {
                                                const { isShareSupported, downloadOrShareFile } = await import('@/lib/mobile-utils');
                                                const reportUrl = `/projects/${project.id}/report`;

                                                if (!isShareSupported()) {
                                                    window.location.href = reportUrl;
                                                    return;
                                                }

                                                try {
                                                    const response = await fetch(reportUrl);
                                                    if (!response.ok) throw new Error('Error al generar PDF');
                                                    const blob = await response.blob();
                                                    await downloadOrShareFile(
                                                        blob,
                                                        `Status_Proyecto_${project.name.replace(/\s+/g, '_')}.pdf`,
                                                        `Status del Proyecto: ${project.name}`
                                                    );
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error('Error al descargar el status');
                                                }
                                            }}
                                        >
                                            <FileText className="mr-2 h-4 w-4" /> Descargar Status PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="quotes" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Listado de Cotizaciones</h3>
                                {!isFinancialmenteCerrado && approvedQuote && (
                                    <Link href={`/quotes/${approvedQuote.id}/duplicate`}>
                                        <Button size="sm" className="gap-2">
                                            <Plus className="h-4 w-4" /> Nueva Versión
                                        </Button>
                                    </Link>
                                )}
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
                                                <div className="text-sm font-bold">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <Badge variant="outline" className="text-[10px] uppercase">{quote.status}</Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!quote.isApproved && !isFinancialmenteCerrado && project.status !== 'closed' && (
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

                                                {/* Edit Rule: Allow edit if DRAFT. Strict rule says: DRAFT checks in backend. UI: Show 'Edit' if DRAFT, 'Ver' otherwise. */}
                                                <Link href={`/quotes/${quote.id}${quote.status === 'DRAFT' || quote.status === 'BORRADOR' ? '/edit' : ''}`}>
                                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs border">
                                                        {quote.status === 'DRAFT' || quote.status === 'BORRADOR' ? 'Editar' : 'Ver'}
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
                                <div className="bg-card border rounded-2xl p-12 text-center shadow-sm space-y-4">
                                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground">No hay órdenes de compra generadas para este proyecto.</p>
                                        {!approvedQuote ? (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
                                                <p className="text-sm text-amber-800 font-medium">
                                                    ⚠️ No puedes crear órdenes sin una cotización aprobada.
                                                </p>
                                                <p className="text-xs text-amber-700 mt-2">
                                                    Ve a la pestaña de <strong>Cotizaciones</strong> y aprueba una para continuar.
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm mt-2 text-muted-foreground">Ve a la pestaña de Cotizaciones y genera órdenes desde los costos internos.</p>
                                        )}
                                    </div>
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
                                                            ${totalOrdered.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-4 text-right font-medium text-emerald-600">
                                                            ${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <span className={`font-bold ${pending > 0.01 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                                                ${pending.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {pending > 0.01 && !isFinancialmenteCerrado && (
                                                                    <RegisterOrderPaymentDialog order={order} />
                                                                )}
                                                                {/* Enlace comentado temporalmente porque la página individual no existe */}
                                                                {/* <Link href={`/supplier-orders/${order.id}`}>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Button>
                                                                </Link> */}
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
                        <div className="space-y-6">
                            {/* Header con CTA */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                                <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-brand-header font-semibold text-green-900 mb-2">
                                            Cobros al Cliente (Ingresos)
                                        </h3>
                                        <p className="text-sm text-green-700 mb-4">
                                            Registra aquí los pagos que <strong>recibes del cliente</strong> por este proyecto.
                                            Estos ingresos impactan directamente la utilidad del proyecto y los reportes financieros.
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-2 w-fit">
                                            <Info className="h-4 w-4" />
                                            <span>Diferente a pagos a proveedores (ver pestaña Órdenes)</span>
                                        </div>
                                    </div>
                                    {!isFinancialmenteCerrado && (
                                        <Button
                                            onClick={() => setShowIncomeDialog(true)}
                                            className="rounded-xl font-brand-header uppercase tracking-wider text-xs bg-green-600 hover:bg-green-700 shadow-lg whitespace-nowrap"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar Ingreso
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Lista de Ingresos */}
                            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-muted/30 px-6 py-4 border-b">
                                    <h4 className="font-brand-header font-semibold text-sm uppercase tracking-wide">
                                        Historial de Cobros
                                    </h4>
                                </div>

                                {project.incomes && project.incomes.length > 0 ? (
                                    <div className="divide-y">
                                        {project.incomes.map((income: any) => (
                                            <div key={income.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 w-full">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium text-sm">
                                                                {income.description || 'Pago del cliente'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-7">
                                                            <span>{new Date(income.date).toLocaleDateString('es-MX')}</span>
                                                            {income.paymentMethod && (
                                                                <span className="bg-muted px-2 py-0.5 rounded">
                                                                    {income.paymentMethod}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right w-full sm:w-auto">
                                                        <p className="text-lg font-bold text-green-600">
                                                            ${income.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-6 py-12 text-center text-muted-foreground">
                                        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">Aún no hay cobros registrados para este proyecto</p>
                                        <p className="text-xs mt-1">Los ingresos aparecerán aquí una vez que registres pagos del cliente</p>
                                    </div>
                                )}
                            </div>

                            {/* Resumen Financiero */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Total Cobrado</p>
                                    <p className="text-2xl font-bold text-green-900 truncate" title={`$${totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>
                                        ${totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-xs text-blue-700 uppercase tracking-wide mb-1">Total Cotizado</p>
                                    <p className="text-2xl font-bold text-blue-900 truncate" title={`$${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>
                                        ${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className={`border rounded-xl p-4 ${totalCobrado >= totalCotizado
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-orange-50 border-orange-200'
                                    }`}>
                                    <p className={`text-xs uppercase tracking-wide mb-1 ${totalCobrado >= totalCotizado ? 'text-green-700' : 'text-orange-700'
                                        }`}>
                                        Saldo Pendiente
                                    </p>
                                    <p className={`text-2xl font-bold truncate ${totalCobrado >= totalCotizado ? 'text-green-900' : 'text-orange-900'
                                        }`} title={`$${(totalCotizado - totalCobrado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>
                                        ${(totalCotizado - totalCobrado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
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
                                    <div className="text-3xl font-black truncate" title={`$${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-[10px] text-muted-foreground">Importe aprobado por el cliente</p>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest">Total Ingresado</span>
                                    <div className="text-3xl font-black text-emerald-600 truncate" title={`$${totalIngresado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>${totalIngresado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-[10px] text-emerald-600/70">Pagos reales recibidos</p>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 space-y-2">
                                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-widest">Total Gastado</span>
                                    <div className="text-3xl font-black text-rose-600 truncate" title={`$${totalEgresado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>${totalEgresado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-[10px] text-rose-600/70">Pagos a proveedores y gastos</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2 text-white">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Utilidad Final</span>
                                    <div className="text-3xl font-black text-white truncate" title={`$${utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}>${utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-[10px] text-slate-400">Margen neto: {totalIngresadoSubtotal > 0 ? ((utilidad / totalIngresadoSubtotal) * 100).toFixed(1) : 0}%</p>
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
                                                            <td className="p-2 text-right">${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="p-2 text-right font-bold text-emerald-600">${paid.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                                        <HistoryIcon className="h-4 w-4" /> Auditoría de Flujo
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between p-3 bg-muted/40 rounded-lg border">
                                            <span className="text-xs">Diferencia Cotizado vs Cobrado:</span>
                                            <span className={`text-xs font-bold ${totalCotizado - totalIngresado > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                ${(totalCotizado - totalIngresado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-muted/40 rounded-lg border">
                                            <span className="text-xs">Gastos Variables Extra:</span>
                                            <span className="text-xs font-bold text-slate-700">
                                                ${(project.expenses?.filter((e: any) => !e.supplierOrderId).reduce((s: number, e: any) => s + e.amount, 0) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

            {/* Diálogo de Registro de Ingreso */}
            {
                showIncomeDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-brand-header font-semibold">
                                        Registrar Cobro al Cliente
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowIncomeDialog(false)}
                                        className="text-white hover:bg-white/20 h-8 w-8"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <p className="text-xs text-green-100 mt-1">
                                    Ingreso que recibes del cliente por este proyecto
                                </p>
                            </div>

                            <form onSubmit={handleIncomeSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monto Recibido *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={incomeAmount}
                                        onChange={(e) => setIncomeAmount(e.target.value)}
                                        className="text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <Input
                                        type="text"
                                        placeholder="Ej: Anticipo 50%, Pago final, etc."
                                        value={incomeDescription}
                                        onChange={(e) => setIncomeDescription(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Método de Pago</label>
                                    <select
                                        value={incomePaymentMethod}
                                        onChange={(e) => setIncomePaymentMethod(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="TRANSFERENCIA">Transferencia</option>
                                        <option value="EFECTIVO">Efectivo</option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="TARJETA">Tarjeta</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fecha</label>
                                    <Input
                                        type="date"
                                        value={incomeDate}
                                        onChange={(e) => setIncomeDate(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowIncomeDialog(false)}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loadingIncome}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {loadingIncome ? 'Guardando...' : 'Registrar Ingreso'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
