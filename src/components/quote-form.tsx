// Force rebuild
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, ArrowLeft, Settings2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QuoteItemCostDialog from './quote-item-cost-dialog'

import { ClientCombobox } from './client-combobox'

// Types
export type QuoteItem = {
    id: string
    concept: string
    quantity: number
    // Product Reference (optional)
    productId?: string
    productCode?: string
    productName?: string
    supplierPrice?: number
    internal_unit_cost: number
    // Cost Breakdown
    cost_article: number
    cost_workforce: number
    cost_packaging: number
    cost_transport: number
    cost_equipment: number
    cost_other: number

    profit_margin: number // Percentage 0-100
    unit_cost: number // Calculated Client Price
    subtotal: number
}

export type QuoteFormData = {
    client: {
        name: string
        company: string
        email: string
        phone: string
    }
    clientId?: string // Added clientId to initialData
    projectId?: string // Added projectId for linking to existing projects
    project: {
        name: string
        date: string
        deliveryDate?: string
    }
    items: QuoteItem[]
    isr_rate?: number
}

interface QuoteFormProps {
    initialData?: QuoteFormData
    clients?: { id: string, name: string, company?: string | null, email?: string | null, phone?: string | null }[]
    action: (data: any) => Promise<{ success: boolean; id?: string }>
    title: string
}

export default function QuoteForm({ initialData, clients = [], action, title }: QuoteFormProps) {
    const router = useRouter()
    // Client State
    const [loading, setLoading] = useState(false)
    const [editingCostId, setEditingCostId] = useState<string | null>(null)
    const [isrRate, setIsrRate] = useState(initialData?.isr_rate || 0)
    const [selectedClientId, setSelectedClientId] = useState<string | null>(initialData?.clientId || null)
    const [projectId] = useState<string | null>(initialData?.projectId || null) // Store projectId from initialData
    const [showNewClientDialog, setShowNewClientDialog] = useState(false)

    const [client, setClient] = useState(initialData?.client || { name: '', company: '', email: '', phone: '' })
    const [project, setProject] = useState(initialData?.project || { name: '', date: new Date().toISOString().split('T')[0], deliveryDate: '' })

    // Global Margin State
    const [useGlobalMargin, setUseGlobalMargin] = useState(false)
    const [globalMargin, setGlobalMargin] = useState(30)

    // Ensure items have internal_unit_cost and profit_margin if loading from legacy data or partial data
    const safeItems = (initialData?.items || [{
        id: '1',
        concept: '',
        quantity: 1,
        internal_unit_cost: 0,
        cost_article: 0,
        cost_workforce: 0,
        cost_packaging: 0,
        cost_transport: 0,
        cost_equipment: 0,
        cost_other: 0,
        profit_margin: 30,
        unit_cost: 0,
        subtotal: 0
    }]).map(item => ({
        ...item,
        internal_unit_cost: item.internal_unit_cost ?? 0,
        cost_article: item.cost_article ?? 0,
        cost_workforce: item.cost_workforce ?? 0,
        cost_packaging: item.cost_packaging ?? 0,
        cost_transport: item.cost_transport ?? 0,
        cost_equipment: item.cost_equipment ?? 0,
        cost_other: item.cost_other ?? 0,
        profit_margin: item.profit_margin ?? 30,
    }))

    const [items, setItems] = useState<QuoteItem[]>(safeItems)

    // Computed
    const totalInternalCost = items.reduce((acc, item) => acc + (item.internal_unit_cost * item.quantity), 0)
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
    // Calculate total unit price (sum of unit prices) as requested
    const totalUnitPrices = items.reduce((acc, item) => acc + item.unit_cost, 0)

    const iva = subtotal * 0.16
    const isrRetention = subtotal * (isrRate / 100)
    const total = subtotal + iva - isrRetention
    const estimatedProfit = subtotal - totalInternalCost

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await action({
                client,
                project,
                items,
                iva_rate: 0.16,
                isr_rate: isrRate / 100,
                clientId: selectedClientId,
                projectId: projectId // Pass projectId to action
            })
            if (result && result.success) {
                // Determine redirect based on context or return value
                // For now redirect to dashboard
                router.push('/dashboard')
                router.refresh()
            } else {
                alert("Error in save result")
            }
        } catch (error) {
            console.error(error)
            alert("Error al guardar")
        } finally {
            setLoading(false)
        }
    }

    const handleItemChange = (id: string, field: keyof QuoteItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updates: Partial<QuoteItem> = { [field]: value }

                // Logic: 
                // 1. If Internal Cost or Margin changes -> Recalculate Unit Price (Client)
                // 2. If Unit Price changed manually -> Recalculate Margin? (Optional, let's stick to Cost+Margin drive Price for now)

                let newInternalCost = item.internal_unit_cost
                let newMargin = item.profit_margin
                let newQuantity = item.quantity

                if (field === 'internal_unit_cost') newInternalCost = Number(value)
                if (field === 'profit_margin') newMargin = Number(value)
                if (field === 'quantity') newQuantity = Number(value)

                // Calculate Unit Price = Internal / (1 - Margin/100) -- This is Gross Margin
                // User might mean Markup? "Costo + 30%". Let's use Markup: Cost * (1 + Margin/100). It's safer and easier.
                const markup = 1 + (newMargin / 100)
                const newUnitCost = newInternalCost * markup

                const newSubtotal = newQuantity * newUnitCost

                return {
                    ...item, ...updates,
                    internal_unit_cost: newInternalCost,
                    profit_margin: newMargin,
                    quantity: newQuantity,
                    unit_cost: newUnitCost,
                    subtotal: newSubtotal
                }
            }
            return item
        }))
    }

    const handleCostUpdate = (id: string, costs: { cost_article: number, cost_workforce: number, cost_packaging: number, cost_other: number, cost_transport: number, cost_equipment: number }) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newInternalCost = (costs.cost_article || 0) + (costs.cost_workforce || 0) + (costs.cost_packaging || 0) + (costs.cost_other || 0) + (costs.cost_transport || 0) + (costs.cost_equipment || 0)

                // Recalculate with new cost
                const markup = 1 + (item.profit_margin / 100)
                const newUnitCost = newInternalCost * markup
                const newSubtotal = item.quantity * newUnitCost

                return {
                    ...item,
                    ...costs,
                    internal_unit_cost: newInternalCost,
                    unit_cost: newUnitCost,
                    subtotal: newSubtotal
                }
            }
            return item
        }))
    }

    const handleGlobalMarginChange = (enabled: boolean, newMargin: number) => {
        setUseGlobalMargin(enabled)
        setGlobalMargin(newMargin)

        if (enabled) {
            setItems(items.map(item => {
                const markup = 1 + (newMargin / 100)
                const newUnitCost = item.internal_unit_cost * markup
                const newSubtotal = item.quantity * newUnitCost
                return {
                    ...item,
                    profit_margin: newMargin,
                    unit_cost: newUnitCost,
                    subtotal: newSubtotal
                }
            }))
        }
    }

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            concept: '',
            quantity: 1,
            internal_unit_cost: 0,
            cost_article: 0,
            cost_workforce: 0,
            cost_packaging: 0,
            cost_transport: 0,
            cost_equipment: 0,
            cost_other: 0,
            profit_margin: 30, // Default 30%
            unit_cost: 0,
            subtotal: 0
        }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id))
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-sm text-muted-foreground">Define costos internos para calcular el precio final</p>
                        </div>
                    </div>
                    <Button className="gap-2" onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4" />
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Client Info */}
                    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Información del Cliente</h2>
                            {/* Client Selector */}
                            <div className="w-[250px] flex gap-2">
                                <ClientCombobox
                                    clients={clients}
                                    value={selectedClientId || undefined}
                                    onSelect={(client) => {
                                        if (client) {
                                            setSelectedClientId(client.id)
                                            setClient({
                                                name: client.name,
                                                company: client.company || '',
                                                email: client.email || '',
                                                phone: client.phone || ''
                                            })
                                        } else {
                                            setSelectedClientId(null)
                                            setClient({ name: '', company: '', email: '', phone: '' })
                                        }
                                    }}
                                />
                                <Button size="icon" variant="outline" onClick={() => setShowNewClientDialog(true)} title="Nuevo Cliente Rápido">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Input
                                placeholder="Nombre del Cliente"
                                value={client.name}
                                onChange={e => setClient({ ...client, name: e.target.value })}
                            />
                            <Input
                                placeholder="Empresa / Organización"
                                value={client.company}
                                onChange={e => setClient({ ...client, company: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={client.email}
                                onChange={e => setClient({ ...client, email: e.target.value })}
                            />
                            <Input
                                placeholder="Teléfono" // Added phone input as it was missing in previous view but exists in type
                                value={client.phone}
                                onChange={e => setClient({ ...client, phone: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Project Info */}
                    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="font-semibold text-lg">Detalles del Proyecto</h2>
                        <div className="space-y-3">
                            <Input
                                placeholder="Nombre del Proyecto"
                                value={project.name}
                                onChange={e => setProject({ ...project, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Fecha de Creación</label>
                                    <Input
                                        type="date"
                                        value={project.date}
                                        onChange={e => setProject({ ...project, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Fecha de Entrega</label>
                                    <Input
                                        type="date"
                                        value={project.deliveryDate || ''}
                                        onChange={e => setProject({ ...project, deliveryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Items Table with Cost Analysis */}
                <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="font-semibold text-lg">Conceptos y Costos</h2>

                        <div className="flex items-center gap-6 bg-muted/30 p-2 rounded-lg border border-muted/50">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="global-margin"
                                    checked={useGlobalMargin}
                                    onCheckedChange={(checked) => handleGlobalMarginChange(checked, globalMargin)}
                                />
                                <Label htmlFor="global-margin" className="text-sm font-medium cursor-pointer">Margen Global</Label>
                            </div>

                            {useGlobalMargin && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                    <div className="relative w-24">
                                        <Input
                                            type="number"
                                            value={globalMargin}
                                            onChange={(e) => handleGlobalMarginChange(true, Number(e.target.value))}
                                            className="h-8 pr-6 text-right font-medium text-blue-700 border-blue-200 focus-visible:ring-blue-500"
                                        />
                                        <span className="absolute right-2 top-2 text-xs text-muted-foreground">%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
                            <Plus className="h-4 w-4" /> Agregar Item
                        </Button>
                    </div>

                    {/* Mobile Card View (Visible on small screens) */}
                    <div className="md:hidden space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
                                {/* Header: Concept & Actions */}
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Concepto</label>
                                        <Input
                                            value={item.concept}
                                            onChange={(e) => handleItemChange(item.id, 'concept', e.target.value)}
                                            placeholder="Descripción..."
                                            className="mt-1 font-medium"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Quantity & Profit */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Cantidad</label>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-xs font-semibold uppercase ${useGlobalMargin ? 'text-muted-foreground' : 'text-blue-700'}`}>% Margen</label>
                                        <div className="relative mt-1">
                                            <Input
                                                type="number"
                                                value={item.profit_margin}
                                                onChange={e => !useGlobalMargin && handleItemChange(item.id, 'profit_margin', e.target.value)}
                                                disabled={useGlobalMargin}
                                                className={`pr-6 text-right font-medium ${useGlobalMargin ? 'bg-muted text-muted-foreground' : 'text-blue-700'}`}
                                            />
                                            <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Internal Cost & Dialog Trigger */}
                                <div className="rounded-md bg-blue-50/50 p-3 border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-blue-900 uppercase">Costo Interno Unit.</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100 -mr-2"
                                            onClick={() => setEditingCostId(item.id)}
                                        >
                                            <Settings2 className="h-3 w-3 mr-1" />
                                            <span className="text-xs">Detalles</span>
                                        </Button>
                                    </div>
                                    <div className="text-lg font-semibold text-blue-900 text-right">
                                        ${item.internal_unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>

                                {/* Results: Unit Price & Subtotal */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Precio Unitario</p>
                                        <p className="font-medium">
                                            ${item.unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Total Línea</p>
                                        <p className="font-bold text-lg">
                                            ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View (Hidden on small screens) */}
                    <div className="hidden md:block relative overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b text-xs uppercase text-muted-foreground bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 min-w-[200px]">Concepto</th>
                                    <th className="px-4 py-3 w-20 text-center">Cant.</th>
                                    <th className="px-4 py-3 w-40 text-right bg-blue-50/50 text-blue-900 border-l">Costo Int.</th>
                                    <th className="px-4 py-3 w-24 text-right bg-blue-50/50 text-blue-900">% Margen</th>
                                    <th className="px-4 py-3 w-32 text-right border-l font-semibold">P. Unitario</th>
                                    <th className="px-4 py-3 w-32 text-right font-semibold">Total</th>
                                    <th className="px-4 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map((item) => (
                                    <tr key={item.id} className="group hover:bg-muted/5">
                                        <td className="p-2 relative">
                                            <Input
                                                value={item.concept}
                                                onChange={(e) => handleItemChange(item.id, 'concept', e.target.value)}
                                                placeholder="Descripción..."
                                                className="border-transparent shadow-none focus-visible:ring-0 bg-transparent px-2"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                                                className="border-transparent shadow-none focus-visible:ring-0 bg-transparent px-2 text-center"
                                            />
                                        </td>

                                        {/* Internal Inputs (With Dialog Trigger) */}
                                        <td className="p-2 bg-blue-50/30 border-l border-blue-100">
                                            <div className="flex items-center justify-end gap-2 px-2">
                                                <span className="text-sm font-medium text-blue-900">
                                                    ${item.internal_unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                                                    onClick={() => setEditingCostId(item.id)}
                                                    title="Editar Costos Detallados"
                                                >
                                                    <Settings2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="p-2 bg-blue-50/30">
                                            <div className="flex items-center justify-end px-2">
                                                <Input
                                                    type="number"
                                                    value={item.profit_margin}
                                                    onChange={e => !useGlobalMargin && handleItemChange(item.id, 'profit_margin', e.target.value)}
                                                    disabled={useGlobalMargin}
                                                    className={`border-transparent shadow-none focus-visible:ring-0 bg-transparent text-right w-16 p-0 ${useGlobalMargin ? 'text-muted-foreground cursor-not-allowed' : 'text-blue-700'}`}
                                                />
                                                <span className="text-muted-foreground ml-1">%</span>
                                            </div>
                                        </td>
                                        {/* Client Outputs */}
                                        <td className="p-2 text-right font-medium text-foreground border-l">
                                            ${item.unit_cost.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right font-bold text-foreground">
                                            ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-2 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/50 border-t font-semibold text-sm">
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 text-right text-muted-foreground uppercase text-xs">Totales</td>
                                    <td className="px-4 py-3 text-right text-blue-900 bg-blue-50/50 border-l border-blue-100">
                                        ${totalInternalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 bg-blue-50/50"></td>
                                    <td className="px-4 py-3 text-right">
                                        ${totalUnitPrices.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg">
                                        ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 text-sm p-4 bg-blue-50/30 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Análisis Interno</h3>
                            <div className="flex justify-between text-blue-800">
                                <span>Costo Total Proyecto</span>
                                <span>${totalInternalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-green-700 font-medium">
                                <span>Utilidad Estimada</span>
                                <span>${estimatedProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm p-4 bg-muted/20 rounded-lg">
                            <h3 className="font-semibold mb-2">Totales al Cliente</h3>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA (16%)</span>
                                <span>${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-700/80">
                                <span className="text-sm">Retención ISR</span>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        className="h-6 w-12 text-right p-1 text-xs bg-transparent border-amber-200 focus-visible:ring-amber-500"
                                        value={isrRate}
                                        onChange={e => setIsrRate(Number(e.target.value))}
                                    />
                                    <span className="text-xs">%</span>
                                    <span className="ml-2 font-medium">-${isrRetention.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary">
                                <span>Total Final</span>
                                <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dialog Renderer */}
                {editingCostId && (() => {
                    const item = items.find(i => i.id === editingCostId)
                    if (!item) return null
                    return (
                        <QuoteItemCostDialog
                            isOpen={true}
                            onClose={() => setEditingCostId(null)}
                            title={`Costos: ${item.concept || 'Nuevo Concepto'}`}
                            initialValues={{
                                cost_article: item.cost_article,
                                cost_workforce: item.cost_workforce,
                                cost_packaging: item.cost_packaging,
                                cost_transport: item.cost_transport,
                                cost_equipment: item.cost_equipment,
                                cost_other: item.cost_other
                            }}
                            onSave={(values) => handleCostUpdate(item.id, values)}
                        />
                    )
                })()}

                {/* Quick Add Client Dialog */}
                {showNewClientDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
                        <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold">Nuevo Cliente Rápido</h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowNewClientDialog(false)} className="h-8 w-8 p-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <form action={async (formData) => {
                                setLoading(true)
                                const { createClient } = await import('@/actions/clients')
                                const result = await createClient({}, formData)
                                setLoading(false)
                                if (result.success && result.id) {
                                    setShowNewClientDialog(false)
                                    // Optimistic update logic would involve adding to the list, 
                                    // but for now we rely on the parent page revalidation or manual set
                                    // Since we can't easily update the 'clients' prop from here without a router refresh...
                                    // We will just set the current client data manually and assume the ID is valid
                                    setSelectedClientId(result.id)
                                    setClient({
                                        name: formData.get('name') as string,
                                        company: formData.get('company') as string,
                                        email: formData.get('email') as string,
                                        phone: formData.get('phone') as string
                                    })
                                    router.refresh()
                                } else {
                                    alert(result.message || 'Error al crear cliente')
                                }
                            }} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre *</label>
                                    <Input name="name" required placeholder="Nombre del cliente" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Empresa</label>
                                    <Input name="company" placeholder="Nombre de la empresa" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input name="email" type="email" placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Teléfono</label>
                                        <Input name="phone" placeholder="555-0000" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Guardando...' : 'Crear Cliente'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
