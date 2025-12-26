"use client"

import { useState, useEffect } from 'react'
import { FileText, BarChart3, Users, Truck, Download, Calendar, Filter, Search, Package, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    getProjectsList,
    getProjectReport,
    getFinancialKardex,
    getClientReport,
    getSupplierReport,
    getClientsList,
    getSuppliersList
} from '@/actions/reports'
import {
    generateProjectPDF,
    generateFinancialExcel,
    generateFinancialCSV,
    generateClientPDF,
    generateSupplierExcel
} from '@/lib/export-utils'
import { toast } from 'sonner'

export function ReportsClient() {
    const [activeTab, setActiveTab] = useState('proyectos')

    // Projects state
    const [projects, setProjects] = useState<any[]>([])
    const [projectsLoading, setProjectsLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [projectReport, setProjectReport] = useState<any>(null)
    const [projectReportLoading, setProjectReportLoading] = useState(false)
    const [projectSearch, setProjectSearch] = useState('')

    // Financial state
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [flowType, setFlowType] = useState<'all' | 'ingresos' | 'egresos'>('all')
    const [kardex, setKardex] = useState<any>(null)
    const [kardexLoading, setKardexLoading] = useState(false)

    // Clients state
    const [clients, setClients] = useState<any[]>([])
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [clientReport, setClientReport] = useState<any>(null)
    const [clientReportLoading, setClientReportLoading] = useState(false)

    // Suppliers state
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<string>('')
    const [supplierReport, setSupplierReport] = useState<any>(null)
    const [supplierReportLoading, setSupplierReportLoading] = useState(false)

    // Load projects on mount
    useEffect(() => {
        loadProjects()
        loadClients()
        loadSuppliers()
    }, [])

    async function loadProjects() {
        setProjectsLoading(true)
        const result = await getProjectsList()
        if (result.success) {
            setProjects(result.projects || [])
        } else {
            toast.error('Error al cargar proyectos')
        }
        setProjectsLoading(false)
    }

    async function loadClients() {
        const result = await getClientsList()
        if (result.success) {
            setClients(result.clients || [])
        }
    }

    async function loadSuppliers() {
        const result = await getSuppliersList()
        if (result.success) {
            setSuppliers(result.suppliers || [])
        }
    }

    async function handleSelectProject(project: any) {
        setSelectedProject(project)
        setProjectReportLoading(true)
        const result = await getProjectReport(project.id)
        if (result.success) {
            setProjectReport(result.report)
        } else {
            toast.error('Error al generar reporte de proyecto')
        }
        setProjectReportLoading(false)
    }

    async function handleFilterKardex() {
        if (!startDate || !endDate) {
            toast.error('Por favor selecciona ambas fechas')
            return
        }

        setKardexLoading(true)
        const result = await getFinancialKardex(startDate, endDate, flowType)
        if (result.success) {
            setKardex(result.kardex)
        } else {
            toast.error('Error al generar kárdex financiero')
        }
        setKardexLoading(false)
    }

    async function handleSelectClient(clientId: string) {
        setSelectedClient(clientId)
        setClientReportLoading(true)
        const result = await getClientReport(clientId)
        if (result.success) {
            setClientReport(result.report)
        } else {
            toast.error('Error al generar reporte de cliente')
        }
        setClientReportLoading(false)
    }

    async function handleSelectSupplier(supplierId: string) {
        setSelectedSupplier(supplierId)
        setSupplierReportLoading(true)
        const result = await getSupplierReport(supplierId)
        if (result.success) {
            setSupplierReport(result.report)
        } else {
            toast.error('Error al generar reporte de proveedor')
        }
        setSupplierReportLoading(false)
    }

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const formatDate = (date: string | Date) => {
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date))
    }

    return (
        <div className="space-y-10 p-4 sm:p-8 animate-in fade-in duration-500">
            <header className="border-b border-secondary pb-8">
                <h1 className="text-6xl font-brand-header text-primary tracking-tighter uppercase">Reportes</h1>
                <p className="text-lg text-[#545555] font-brand-ui opacity-70">Documentación y análisis histórico corporativo</p>
            </header>

            <Tabs defaultValue="proyectos" onValueChange={setActiveTab} className="space-y-8">
                <div className="bg-white/50 backdrop-blur-sm border-b border-secondary sticky top-0 z-10 py-4 -mx-8 px-8">
                    <TabsList className="bg-secondary/20 h-14 p-1 rounded-2xl gap-2">
                        <TabsTrigger value="proyectos" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 font-brand-header uppercase tracking-widest text-xs h-full">
                            <Package className="h-4 w-4 mr-2" /> Por Proyecto
                        </TabsTrigger>
                        <TabsTrigger value="financieros" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 font-brand-header uppercase tracking-widest text-xs h-full">
                            <BarChart3 className="h-4 w-4 mr-2" /> Financieros
                        </TabsTrigger>
                        <TabsTrigger value="entidades" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-8 font-brand-header uppercase tracking-widest text-xs h-full">
                            <Users className="h-4 w-4 mr-2" /> Clientes / Proveedores
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* PROJECTS TAB */}
                <TabsContent value="proyectos" className="m-0 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Selector Column */}
                        <Card className="rounded-3xl border border-secondary shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl font-brand-header text-primary uppercase">Seleccionar Proyecto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-primary/30" />
                                    <Input
                                        placeholder="Buscar proyecto..."
                                        className="pl-10 rounded-xl"
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {projectsLoading ? (
                                        <div className="flex items-center justify-center p-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    ) : filteredProjects.length === 0 ? (
                                        <div className="text-center p-8 text-primary/40 space-y-2">
                                            {projectSearch ? (
                                                <>
                                                    <p className="text-sm font-brand-header uppercase tracking-wide">No hay proyectos que coincidan con la búsqueda</p>
                                                    <p className="text-xs">Intenta con otro término de búsqueda</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-brand-header uppercase tracking-wide">Aún no hay proyectos disponibles</p>
                                                    <p className="text-xs">Los proyectos aparecerán aquí una vez que estén creados</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        filteredProjects.map((project) => (
                                            <div
                                                key={project.id}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedProject?.id === project.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-secondary hover:bg-secondary/20'
                                                    }`}
                                                onClick={() => handleSelectProject(project)}
                                            >
                                                <p className="font-brand-header text-primary uppercase tracking-wide text-sm">{project.name}</p>
                                                <p className="text-[10px] text-primary/40 uppercase mt-1">{project.clientName}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-[8px]">{project.status}</Badge>
                                                    <span className="text-[8px] text-primary/30">{project.quotesCount} cotizaciones</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview Column */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="rounded-3xl border border-secondary shadow-xl overflow-hidden min-h-[500px] flex flex-col bg-white">
                                <div className="bg-secondary/10 p-4 border-b border-secondary flex items-center justify-between">
                                    <Badge variant="outline" className="font-brand-header text-[10px] tracking-widest uppercase border-primary/20 text-primary">Vista Previa Documental</Badge>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-secondary" />
                                        <div className="w-3 h-3 rounded-full bg-secondary" />
                                        <div className="w-3 h-3 rounded-full bg-secondary" />
                                    </div>
                                </div>
                                <CardContent className="p-12 flex-1 overflow-y-auto">
                                    {projectReportLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                            <p className="text-sm text-primary/60">Generando reporte...</p>
                                        </div>
                                    ) : !projectReport ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <FileText className="h-20 w-20 text-primary/10 mb-6 pointer-events-none" />
                                            <p className="text-lg font-brand-header text-primary/40 uppercase tracking-widest">Selecciona un proyecto para visualizar su reporte oficial</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Project Header */}
                                            <div className="border-b border-secondary pb-6">
                                                <h2 className="text-2xl font-brand-header text-primary uppercase mb-2">{projectReport.project.name}</h2>
                                                <p className="text-sm text-primary/60">Cliente: {projectReport.client.name}</p>
                                                {projectReport.client.company && (
                                                    <p className="text-sm text-primary/60">Empresa: {projectReport.client.company}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Badge>{projectReport.project.status}</Badge>
                                                    <span className="text-xs text-primary/40">Creado: {formatDate(projectReport.project.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Financial Summary */}
                                            <div>
                                                <h3 className="text-lg font-brand-header text-primary uppercase mb-4">Resumen Financiero</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                                        <p className="text-xs text-green-600 uppercase tracking-wide">Ingresos</p>
                                                        <p className="text-xl font-bold text-green-700">{formatCurrency(projectReport.financial.totalIngresos)}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                                        <p className="text-xs text-red-600 uppercase tracking-wide">Egresos</p>
                                                        <p className="text-xl font-bold text-red-700">{formatCurrency(projectReport.financial.totalEgresos)}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                                        <p className="text-xs text-blue-600 uppercase tracking-wide">Utilidad</p>
                                                        <p className="text-xl font-bold text-blue-700">{formatCurrency(projectReport.financial.utilidad)}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                                                        <p className="text-xs text-purple-600 uppercase tracking-wide">Margen</p>
                                                        <p className="text-xl font-bold text-purple-700">{projectReport.financial.margenUtilidad}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quotes Summary */}
                                            <div>
                                                <h3 className="text-lg font-brand-header text-primary uppercase mb-4">Cotizaciones</h3>
                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                    <div className="p-3 rounded-xl bg-secondary/10">
                                                        <p className="text-2xl font-bold text-primary">{projectReport.quotes.total}</p>
                                                        <p className="text-[10px] text-primary/60 uppercase">Total</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-secondary/10">
                                                        <p className="text-2xl font-bold text-primary">{projectReport.quotes.approved}</p>
                                                        <p className="text-[10px] text-primary/60 uppercase">Aprobadas</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-secondary/10">
                                                        <p className="text-2xl font-bold text-primary">{projectReport.quotes.cobrado}</p>
                                                        <p className="text-[10px] text-primary/60 uppercase">Cobradas</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Orders & Tasks */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-brand-header text-primary uppercase mb-2">Órdenes</h4>
                                                    <p className="text-xs text-primary/60">Total: {projectReport.orders.total}</p>
                                                    <p className="text-xs text-primary/60">Recibidas: {projectReport.orders.received}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-brand-header text-primary uppercase mb-2">Tareas</h4>
                                                    <p className="text-xs text-primary/60">Total: {projectReport.tasks.total}</p>
                                                    <p className="text-xs text-primary/60">Completadas: {projectReport.tasks.completed}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="p-6 bg-white border-t border-secondary flex justify-end gap-3">
                                    <Button
                                        disabled={!projectReport}
                                        onClick={() => projectReport && window.open(`/projects/${projectReport.project.id}/report`, '_blank')}
                                        className={`rounded-xl font-brand-header tracking-widest uppercase text-xs h-12 px-8 transition-all ${!projectReport
                                            ? 'bg-secondary/30 text-primary/30 cursor-not-allowed shadow-none hover:bg-secondary/30'
                                            : 'bg-primary text-white shadow-xl hover:shadow-2xl hover:bg-primary/90'
                                            }`}
                                    >
                                        <Download className="h-4 w-4 mr-2" /> Descargar PDF Oficial
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* FINANCIAL TAB */}
                <TabsContent value="financieros" className="m-0 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-3xl border border-secondary shadow-lg overflow-hidden">
                        <CardHeader className="bg-secondary/10 border-b border-secondary">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <CardTitle className="text-2xl font-brand-header text-primary uppercase">Reporte Financiero de Periodo</CardTitle>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white rounded-xl border border-secondary p-1">
                                        <Calendar className="h-4 w-4 ml-2 text-primary/40" />
                                        <Input
                                            type="date"
                                            className="border-0 focus-visible:ring-0 h-9 w-36 text-xs font-brand-ui"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span className="text-primary/20">—</span>
                                        <Input
                                            type="date"
                                            className="border-0 focus-visible:ring-0 h-9 w-36 text-xs font-brand-ui"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <Select value={flowType} onValueChange={(v: any) => setFlowType(v)}>
                                        <SelectTrigger className="w-40 rounded-xl h-11 border-secondary">
                                            <SelectValue placeholder="Tipo de Flujo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todo el Flujo</SelectItem>
                                            <SelectItem value="ingresos">Solo Ingresos</SelectItem>
                                            <SelectItem value="egresos">Solo Egresos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleFilterKardex}
                                        disabled={kardexLoading}
                                        className="rounded-xl h-11 bg-primary text-white font-brand-header uppercase tracking-widest text-[10px] px-6"
                                    >
                                        {kardexLoading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Filter className="h-4 w-4 mr-2" />
                                        )}
                                        Filtrar
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm font-brand-ui">
                                    <thead className="bg-secondary/10 border-b border-secondary">
                                        <tr className="font-brand-header uppercase text-[10px] tracking-widest text-primary/60">
                                            <th className="p-4 text-left">Fecha</th>
                                            <th className="p-4 text-left">Proyecto</th>
                                            <th className="p-4 text-left">Concepto / Cliente</th>
                                            <th className="p-4 text-right">Ingreso</th>
                                            <th className="p-4 text-right">Egreso</th>
                                            <th className="p-4 text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary/40">
                                        {!kardex ? (
                                            <tr>
                                                <td colSpan={6} className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                                        <BarChart3 className="h-12 w-12" />
                                                        <p className="font-brand-header uppercase tracking-widest">Define un periodo para visualizar el kárdex financiero</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : kardex.transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <AlertCircle className="h-8 w-8 text-primary/30" />
                                                        <p className="text-sm text-primary/60">No hay transacciones en este periodo</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {kardex.transactions.map((transaction: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-secondary/5 transition-colors">
                                                        <td className="p-4 text-xs">{formatDate(transaction.date)}</td>
                                                        <td className="p-4 text-xs">{transaction.proyecto}</td>
                                                        <td className="p-4 text-xs">{transaction.concepto}</td>
                                                        <td className="p-4 text-right text-xs text-green-600 font-semibold">
                                                            {transaction.ingreso > 0 ? formatCurrency(transaction.ingreso) : '-'}
                                                        </td>
                                                        <td className="p-4 text-right text-xs text-red-600 font-semibold">
                                                            {transaction.egreso > 0 ? formatCurrency(transaction.egreso) : '-'}
                                                        </td>
                                                        <td className="p-4 text-right text-xs font-bold">
                                                            {formatCurrency(transaction.saldo)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-primary/5 font-bold">
                                                    <td colSpan={3} className="p-4 text-sm uppercase tracking-wide">Totales</td>
                                                    <td className="p-4 text-right text-sm text-green-700">{formatCurrency(kardex.totals.totalIngresos)}</td>
                                                    <td className="p-4 text-right text-sm text-red-700">{formatCurrency(kardex.totals.totalEgresos)}</td>
                                                    <td className="p-4 text-right text-sm text-primary">{formatCurrency(kardex.totals.saldoFinal)}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-white border-t border-secondary flex items-center justify-between">
                            <p className="text-[10px] font-brand-header text-primary/40 uppercase tracking-widest">
                                Reporte generado para contabilidad • Kunst & Design
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    disabled={!kardex}
                                    onClick={() => kardex && generateFinancialCSV(kardex)}
                                    className="rounded-xl font-brand-header tracking-widest uppercase text-xs h-12 shadow-sm border-secondary text-primary"
                                >
                                    <Download className="h-4 w-4 mr-2" /> CSV
                                </Button>
                                <Button
                                    disabled={!kardex}
                                    onClick={() => kardex && generateFinancialExcel(kardex)}
                                    className="rounded-xl font-brand-header tracking-widest uppercase text-xs h-12 px-10 shadow-lg"
                                >
                                    <Download className="h-4 w-4 mr-2" /> Exportar Excel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* ENTITIES TAB */}
                <TabsContent value="entidades" className="m-0 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Card */}
                        <Card className="rounded-3xl border border-secondary shadow-lg overflow-hidden bg-white">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-2xl font-brand-header text-primary uppercase">Reporte por Cliente</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-foreground/70 leading-relaxed font-brand-ui">
                                    Historial comercial acumulado, proyectos realizados y rentabilidad total por cliente.
                                </p>
                                <Select value={selectedClient} onValueChange={handleSelectClient}>
                                    <SelectTrigger className="w-full rounded-xl h-12 border-secondary">
                                        <SelectValue placeholder="Buscar Cliente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name} {client.company ? `(${client.company})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {clientReportLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : clientReport ? (
                                    <div className="space-y-4 p-4 rounded-xl bg-secondary/5 border border-secondary">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Proyectos</p>
                                                <p className="text-xl font-bold text-primary">{clientReport.metrics.totalProyectos}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Cotizaciones</p>
                                                <p className="text-xl font-bold text-primary">{clientReport.metrics.totalCotizaciones}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Ingresos</p>
                                                <p className="text-sm font-bold text-green-600">{formatCurrency(clientReport.metrics.totalIngresos)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Margen</p>
                                                <p className="text-sm font-bold text-blue-600">{clientReport.metrics.margenPromedio}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <Button
                                    variant="outline"
                                    disabled={!clientReport}
                                    onClick={() => clientReport && window.open(`/clients/${clientReport.client.id}/resume`, '_blank')}
                                    className="w-full rounded-xl font-brand-header tracking-widest uppercase text-xs h-12 border-secondary text-primary"
                                >
                                    <Download className="h-4 w-4 mr-2" /> Hoja de Vida Comercial (PDF)
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Supplier Card */}
                        <Card className="rounded-3xl border border-secondary shadow-lg overflow-hidden bg-white">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-2xl font-brand-header text-primary uppercase">Reporte por Proveedor</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-foreground/70 leading-relaxed font-brand-ui">
                                    Auditoría de órdenes de compra, pagos realizados y saldos pendientes por proveedor.
                                </p>
                                <Select value={selectedSupplier} onValueChange={handleSelectSupplier}>
                                    <SelectTrigger className="w-full rounded-xl h-12 border-secondary">
                                        <SelectValue placeholder="Buscar Proveedor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier.id} value={supplier.id}>
                                                {supplier.name} ({supplier.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {supplierReportLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : supplierReport ? (
                                    <div className="space-y-4 p-4 rounded-xl bg-secondary/5 border border-secondary">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Órdenes</p>
                                                <p className="text-xl font-bold text-primary">{supplierReport.metrics.totalOrdenes}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-primary/60 uppercase">Tareas</p>
                                                <p className="text-xl font-bold text-primary">{supplierReport.metrics.totalTareas}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-primary/60 uppercase">Total Pagado</p>
                                                <p className="text-lg font-bold text-green-600">{formatCurrency(supplierReport.metrics.totalPagos)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <Button
                                    variant="outline"
                                    disabled={!supplierReport}
                                    onClick={() => supplierReport && generateSupplierExcel(supplierReport)}
                                    className="w-full rounded-xl font-brand-header tracking-widest uppercase text-xs h-12 border-secondary text-primary"
                                >
                                    <Download className="h-4 w-4 mr-2" /> Estado de Cuenta (EXCEL)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
