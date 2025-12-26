'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createIncome, createVariableExpense } from "@/actions/accounting"
import { toast } from "sonner"

export function IncomeForm({ projects = [], onSuccess }: { projects?: any[], onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [percentage, setPercentage] = useState('')

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        iva: '0',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'TRANSFER',
        quoteId: ''
    })

    const handleProjectChange = (quoteId: string) => {
        if (quoteId === 'none') {
            setSelectedProject(null)
            setFormData(prev => ({ ...prev, quoteId: '', description: '' }))
            return
        }

        const project = projects.find(p => p.id === quoteId)
        if (project) {
            setSelectedProject(project)
            setFormData(prev => ({
                ...prev,
                quoteId: project.id,
                description: `Cobro Proyecto: ${project.project_name}`
            }))
            // Reset percentage when project changes
            setPercentage('')
        }
    }

    const handlePercentageApply = (pct: string) => {
        setPercentage(pct)
        if (selectedProject) {
            const amount = selectedProject.subtotal * (Number(pct) / 100)
            const iva = amount * 0.16
            setFormData(prev => ({
                ...prev,
                amount: amount.toFixed(2),
                iva: iva.toFixed(2)
            }))
        }
    }

    const handleAmountChange = (val: string) => {
        const amount = Number(val)
        const iva = amount * 0.16
        setFormData({
            ...formData,
            amount: val,
            iva: iva.toFixed(2)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createIncome({
                description: formData.description,
                amount: Number(formData.amount),
                iva: Number(formData.iva),
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod,
                quoteId: formData.quoteId || undefined,
                status: 'PAID'
            })
            toast.success("Ingreso registrado")
            onSuccess()
        } catch {
            toast.error("Error al registrar ingreso")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Relacionar con Proyecto (Opcional)</Label>
                <Select onValueChange={handleProjectChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un proyecto..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Sin relación</SelectItem>
                        {projects.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.project_name} (${p.subtotal.toLocaleString()})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedProject && (
                <div className="grid grid-cols-4 gap-2">
                    {['30', '50', '100'].map(pct => (
                        <Button
                            key={pct}
                            type="button"
                            variant={percentage === pct ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePercentageApply(pct)}
                        >
                            {pct}%
                        </Button>
                    ))}
                    <Input
                        placeholder="%"
                        type="number"
                        className="h-9"
                        value={percentage}
                        onChange={(e) => handlePercentageApply(e.target.value)}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej. Anticipo Proyecto X"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => handleAmountChange(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>IVA (16%)</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.iva}
                        onChange={e => setFormData({ ...formData, iva: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                        required
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center text-sm">
                <span className="font-medium">Total Cobrado (IVA Incl.):</span>
                <span className="font-bold text-green-600 text-lg">
                    ${(Number(formData.amount) + Number(formData.iva)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
            </div>

            <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                    value={formData.paymentMethod}
                    onValueChange={val => setFormData({ ...formData, paymentMethod: val })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TRANSFER">Transferencia</SelectItem>
                        <SelectItem value="CASH">Efectivo</SelectItem>
                        <SelectItem value="CHECK">Cheque</SelectItem>
                        <SelectItem value="CARD">Tarjeta</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar Ingreso"}
                </Button>
            </div>
        </form>
    )
}

export function VariableExpenseForm({ projects = [], suppliers = [], onSuccess }: { projects?: any[], suppliers?: any[], onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [percentage, setPercentage] = useState('')
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        iva: '0',
        category: 'Material',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'TRANSFER',
        supplierId: '',
        quoteId: ''
    })

    const handleSupplierChange = (id: string) => {
        if (id === 'none') {
            setFormData(prev => ({ ...prev, supplierId: '' }))
            return
        }
        const supplier = suppliers.find(s => s.id === id)
        if (supplier) {
            setFormData(prev => ({
                ...prev,
                supplierId: id,
                description: prev.description || `Pago a Proveedor: ${supplier.name}`
            }))
        }
    }

    const handleProjectChange = (id: string) => {
        if (id === 'none') {
            setSelectedProject(null)
            setFormData(prev => ({ ...prev, quoteId: '' }))
            return
        }
        const project = projects.find(p => p.id === id)
        if (project) {
            setSelectedProject(project)
            setFormData(prev => ({
                ...prev,
                quoteId: id,
                description: prev.description || `Gasto Proyecto: ${project.project_name}`
            }))
            setPercentage('')
        }
    }

    const handlePercentageApply = (pct: string) => {
        setPercentage(pct)
        if (selectedProject) {
            const amount = selectedProject.subtotal * (Number(pct) / 100)
            const iva = amount * 0.16
            setFormData(prev => ({
                ...prev,
                amount: amount.toFixed(2),
                iva: iva.toFixed(2)
            }))
        }
    }

    const handleAmountChange = (val: string) => {
        const amount = Number(val)
        const iva = amount * 0.16
        setFormData({
            ...formData,
            amount: val,
            iva: iva.toFixed(2)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createVariableExpense({
                description: formData.description,
                amount: Number(formData.amount),
                iva: Number(formData.iva),
                category: formData.category,
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod,
                supplierId: formData.supplierId || undefined,
                quoteId: formData.quoteId || undefined
            })
            toast.success("Egreso registrado")
            onSuccess()
        } catch {
            toast.error("Error al registrar egreso")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Proveedor (Opcional)</Label>
                    <Select onValueChange={handleSupplierChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin proveedor</SelectItem>
                            {suppliers.map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Proyecto (Opcional)</Label>
                    <Select onValueChange={handleProjectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin proyecto</SelectItem>
                            {projects.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedProject && (
                <div className="grid grid-cols-4 gap-2">
                    {['30', '50', '100'].map(pct => (
                        <Button
                            key={pct}
                            type="button"
                            variant={percentage === pct ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePercentageApply(pct)}
                        >
                            {pct}%
                        </Button>
                    ))}
                    <Input
                        placeholder="%"
                        type="number"
                        className="h-9"
                        value={percentage}
                        onChange={(e) => handlePercentageApply(e.target.value)}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej. Compra de material extra"
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => handleAmountChange(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>IVA (16%)</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.iva}
                        onChange={e => setFormData({ ...formData, iva: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                        required
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center text-sm">
                <span className="font-medium">Total Pagado (IVA Incl.):</span>
                <span className="font-bold text-red-600 text-lg">
                    ${(Number(formData.amount) + Number(formData.iva)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Material">Material</SelectItem>
                            <SelectItem value="Labor">Mano de Obra</SelectItem>
                            <SelectItem value="Transport">Transporte</SelectItem>
                            <SelectItem value="Services">Servicios</SelectItem>
                            <SelectItem value="Other">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select
                        value={formData.paymentMethod}
                        onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TRANSFER">Transferencia</SelectItem>
                            <SelectItem value="CASH">Efectivo</SelectItem>
                            <SelectItem value="CARD">Tarjeta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar Egreso"}
                </Button>
            </div>
        </form>
    )
}
