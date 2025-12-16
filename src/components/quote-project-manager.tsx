'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import QuotePDFClient from '@/app/quotes/[id]/pdf-client'
import { Pencil, FileText, CheckSquare } from 'lucide-react'
import Link from 'next/link'

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
    quote: QuoteData
}

export function QuoteProjectManager({ quote }: QuoteProjectManagerProps) {
    // Calculate total internal cost and profit
    const totalInternalCost = quote.items.reduce((acc, item) => {
        const itemInternal = (
            item.cost_article +
            item.cost_workforce +
            item.cost_packaging +
            item.cost_transport +
            item.cost_equipment +
            item.cost_other
        ) * item.quantity
        return acc + itemInternal
    }, 0)

    const grossProfit = quote.subtotal - totalInternalCost
    const marginPercent = quote.subtotal > 0 ? (grossProfit / quote.subtotal) * 100 : 0

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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {quote.items.map((item: any) => {
                                            const itemInternalUnit = (
                                                item.cost_article +
                                                item.cost_workforce +
                                                item.cost_packaging +
                                                item.cost_transport +
                                                item.cost_equipment +
                                                item.cost_other
                                            )
                                            const itemInternalTotal = itemInternalUnit * item.quantity

                                            return (
                                                <tr key={item.id} className="hover:bg-muted/50">
                                                    <td className="p-3 font-medium">{item.concept}</td>
                                                    <td className="p-3 text-right">{item.quantity}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${itemInternalUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right text-muted-foreground">${itemInternalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right">${item.unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                                    <td className="p-3 text-right font-bold">${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
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
                                Este es el documento que se enviará al cliente. Verifica que toda la información esté correcta antes de descargar.
                            </p>
                            <div className="flex gap-4">
                                <QuotePDFClient quote={quote} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
