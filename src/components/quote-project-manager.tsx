'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import QuotePDFClient from '@/app/quotes/[id]/pdf-client'
import { Pencil, FileText, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'
import { createOrderFromQuoteItem } from '@/actions/supplier-orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Define types based on serialized data
interface QuoteData {
    id: string
    project_name: string
    status: string
    date: string
    deliveryDate?: string
    client: {
        name: string
        company?: string
        email?: string
        phone?: string
    }
    items: any[]
    supplierTasks: any[]
    subtotal: number
    iva_amount: number
    total: number
}

interface QuoteProjectManagerProps {
    quote: QuoteData & { project?: any }
    suppliers?: any[]
}

export function QuoteProjectManager({ quote, suppliers = [] }: QuoteProjectManagerProps) {
    const router = useRouter()
    const [isCreatingOrder, setIsCreatingOrder] = useState<string | null>(null)
    const [selectedSupplier, setSelectedSupplier] = useState<string>('')

    // Calculate total internal cost and profit
    const totalInternalCost = quote.items.reduce((acc, item) => {
        const itemInternal = (
            (item.cost_article || 0) +
            (item.cost_workforce || 0) +
            (item.cost_packaging || 0) +
            (item.cost_transport || 0) +
            (item.cost_equipment || 0) +
            (item.cost_other || 0)
        ) * item.quantity
        return acc + itemInternal
    }, 0)

    const grossProfit = quote.subtotal - totalInternalCost
    const marginPercent = quote.subtotal > 0 ? (grossProfit / quote.subtotal) * 100 : 0

    const handleCreateOrder = async (quoteItemId: string) => {
        if (!selectedSupplier) {
            toast.error('Por favor seleccione un proveedor')
            return
        }

        setIsCreatingOrder(quoteItemId)
        try {
            const res = await createOrderFromQuoteItem(quoteItemId, selectedSupplier)
            if (res.success) {
                toast.success('Orden de compra generada exitosamente')
                router.refresh()
            } else {
                toast.error(res.error || 'Error al generar orden')
            }
        } catch {
            toast.error('Error de red al generar orden')
        } finally {
            setIsCreatingOrder(null)
            setSelectedSupplier('')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{quote.project_name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant="outline">{quote.status}</Badge>
                        <span>•</span>
                        <span>{quote.client.company || quote.client.name}</span>
                        <span>•</span>
                        <span>{format(new Date(quote.date), 'PPP', { locale: es })}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/quotes/${quote.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Editar Cotización
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="resume" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                    <TabsTrigger value="resume" className="py-2">Resumen</TabsTrigger>
                    <TabsTrigger value="costs" className="py-2">Costos</TabsTrigger>
                    <TabsTrigger value="taxes" className="py-2">Impuestos y Utilidad</TabsTrigger>
                    <TabsTrigger value="tasks" className="py-2">Tareas ({quote.supplierTasks?.length || 0})</TabsTrigger>
                    <TabsTrigger value="pdf" className="py-2">Documento PDF</TabsTrigger>
                </TabsList>

                {/* RESUMEN */}
                <TabsContent value="resume">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                                    <div className="text-lg">{quote.client.company || '-'}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                                    <div className="font-medium">{quote.client.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <div className="text-sm">{quote.client.email || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                        <div className="text-sm">{quote.client.phone || '-'}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen Económico</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-lg font-medium">${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">IVA (16%)</span>
                                    <span className="text-lg font-medium">${quote.iva_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 pt-4">
                                    <span className="font-bold">Total</span>
                                    <span className="text-2xl font-bold text-primary">${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* COSTOS */}
                <TabsContent value="costs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desglose de Costos Internos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Concepto</th>
                                            <th className="p-3 text-right font-medium">Cant.</th>
                                            <th className="p-3 text-right font-medium text-muted-foreground">Costo Int. Unit.</th>
                                            <th className="p-3 text-right font-medium text-muted-foreground">Costo Int. Total</th>
                                            <th className="p-3 text-right font-medium">Precio Venta Unit.</th>
                                            <th className="p-3 text-right font-medium">Precio Venta Total</th>
                                            <th className="p-3 text-center font-medium">Operación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {quote.items.map((item: any) => {
                                            const itemInternalUnit = (
                                                (item.cost_article || 0) +
                                                (item.cost_workforce || 0) +
                                                (item.cost_packaging || 0) +
                                                (item.cost_transport || 0) +
                                                (item.cost_equipment || 0) +
                                                (item.cost_other || 0)
                                            )
                                            const itemInternalTotal = itemInternalUnit * item.quantity

                                            return (
                                                <tr key={item.id} className="hover:bg-muted/50">
                                                    <td className="p-3 font-medium">
                                                        <div className="flex flex-col">
                                                            {item.concept}
                                                            {item.productCode && <span className="text-[10px] text-muted-foreground">{item.productCode}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right">{item.quantity}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${itemInternalUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${itemInternalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right">${item.unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right font-bold">${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-center whitespace-nowrap">
                                                        {item.orderCreated ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-[9px] py-0 h-4">
                                                                    ORDEN GENERADA
                                                                </Badge>
                                                                {item.supplierOrder && (
                                                                    <Link href={`/supplier-orders/${item.supplierOrderId}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                                                        Ver {item.supplierOrderId.slice(-4)}
                                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ) : quote.project?.status !== 'COTIZANDO' ? (
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-2 border-primary/20 text-primary hover:bg-primary/5">
                                                                        <Plus className="h-3 w-3" />
                                                                        Generar Orden
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Generar Orden de Compra</DialogTitle>
                                                                        <DialogDescription>
                                                                            Se creará una Orden de Compra para &quot;{item.concept}&quot; basada en el costo cotizado de <strong>${item.cost_article.toLocaleString('es-MX')}</strong>.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="py-4 space-y-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">Seleccionar Proveedor</label>
                                                                            <Select onValueChange={setSelectedSupplier}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Seleccione un proveedor..." />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {suppliers.map((s: any) => (
                                                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <Button
                                                                            onClick={() => handleCreateOrder(item.id)}
                                                                            disabled={isCreatingOrder === item.id || !selectedSupplier}
                                                                        >
                                                                            {isCreatingOrder === item.id ? 'Generando...' : 'Confirmar Orden'}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] py-0 h-4 opacity-50">
                                                                PENDIENTE
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* IMPUESTOS Y UTILIDAD */}
                <TabsContent value="taxes">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análisis de Utilidad</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Venta Total (sin IVA)</span>
                                        <span className="font-medium">${quote.subtotal.toLocaleString('es-MX')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Costo Interno Total</span>
                                        <span className="font-medium text-red-600">-${totalInternalCost.toLocaleString('es-MX')}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                        <span>Utilidad Bruta</span>
                                        <span className="text-green-600">${grossProfit.toLocaleString('es-MX')}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Margen de Utilidad</span>
                                        <span className="font-bold text-xl">{marginPercent.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${Math.min(marginPercent, 100)}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Impuestos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg bg-muted/50 p-4 border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>Base Gravable</span>
                                        <span className="font-mono">${quote.subtotal.toLocaleString('es-MX')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Tasa IVA</span>
                                        <span>16%</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold pt-2 border-t border-border/50">
                                        <span>Monto IVA</span>
                                        <span>${quote.iva_amount.toLocaleString('es-MX')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAREAS */}
                <TabsContent value="tasks">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Tareas con Proveedores</CardTitle>
                            <Link href="/suppliers">
                                <Button size="sm" variant="outline">Gestionar Proveedores</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {!quote.supplierTasks || quote.supplierTasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                    No hay tareas asignadas para este proyecto.
                                </div>
                            ) : (
                                <div className="divide-y border rounded-md">
                                    {quote.supplierTasks.map((task: any) => (
                                        <div key={task.id} className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{task.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {task.status === 'PENDING' ? 'Pendiente' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completado'}
                                                    </Badge>
                                                    {task.expectedDate && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Entrega: {format(new Date(task.expectedDate), 'PPP', { locale: es })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Link to supplier could be added here if supplier info is included */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PDF */}
                <TabsContent value="pdf">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vista Previa del Documento</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                            <FileText className="h-16 w-16 text-muted-foreground/50" />

                            <p className="text-muted-foreground text-center max-w-md">
                                {quote.status === 'APPROVED'
                                    ? "Este documento es la versión oficial aprobada."
                                    : "Este documento es una versión preliminar para revisión del cliente."}
                            </p>

                            <div className="flex gap-4">
                                <QuotePDFClient quote={quote} />
                            </div>

                            {quote.status !== 'APPROVED' && (
                                <p className="text-xs text-amber-600/80 max-w-sm text-center">
                                    Nota: Esta cotización aún no está aprobada. El PDF incluirá una marca de &quot;PRELIMINAR&quot;.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
