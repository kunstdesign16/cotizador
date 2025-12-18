'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createIncome, createVariableExpense } from "@/actions/accounting"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function IncomeForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'TRANSFER'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createIncome({
                description: formData.description,
                amount: Number(formData.amount),
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod,
                status: 'PAID'
            })
            toast.success("Ingreso registrado")
            onSuccess()
        } catch (error) {
            toast.error("Error al registrar ingreso")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej. Anticipo Proyecto X"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
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
                        <SelectItem value="dCHECK">Cheque</SelectItem>
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

export function VariableExpenseForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Material',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'TRANSFER'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createVariableExpense({
                description: formData.description,
                amount: Number(formData.amount),
                category: formData.category,
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod
            })
            toast.success("Egreso registrado")
            onSuccess()
        } catch (error) {
            toast.error("Error al registrar egreso")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej. Compra de material extra"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                        value={formData.category}
                        onValueChange={val => setFormData({ ...formData, category: val })}
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
                        onValueChange={val => setFormData({ ...formData, paymentMethod: val })}
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
