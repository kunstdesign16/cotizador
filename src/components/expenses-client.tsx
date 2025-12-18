"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Pencil, X, Wallet, Calendar, RefreshCw } from 'lucide-react'
import { createExpense, updateExpense, deleteExpense } from '@/actions/expenses'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Expense {
    id: string
    description: string
    amount: number
    category: string | null
    date: string
    recurring: boolean
}

interface ExpensesClientProps {
    initialExpenses: Expense[]
}

const CATEGORIES = ['Renta', 'Servicios', 'Nómina', 'Insumos', 'Transporte', 'Otros']

export function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
    const [expenses, setExpenses] = useState(initialExpenses)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState('')
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        recurring: false
    })

    const resetForm = () => {
        setFormData({
            description: '',
            amount: 0,
            category: '',
            date: new Date().toISOString().split('T')[0],
            recurring: false
        })
        setEditingId(null)
        setShowForm(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingId) {
                const result = await updateExpense(editingId, {
                    description: formData.description,
                    amount: formData.amount,
                    category: formData.category || undefined,
                    date: new Date(formData.date + 'T12:00:00'),
                    recurring: formData.recurring
                })
                if (result.success) {
                    router.refresh()
                    resetForm()
                } else {
                    alert(result.error)
                }
            } else {
                const result = await createExpense({
                    description: formData.description,
                    amount: formData.amount,
                    category: formData.category || undefined,
                    date: new Date(formData.date + 'T12:00:00'),
                    recurring: formData.recurring
                })
                if (result.success) {
                    router.refresh()
                    resetForm()
                } else {
                    alert(result.error)
                }
            }
        } catch (error) {
            alert('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (expense: Expense) => {
        setFormData({
            description: expense.description,
            amount: expense.amount,
            category: expense.category || '',
            date: new Date(expense.date).toISOString().split('T')[0],
            recurring: expense.recurring
        })
        setEditingId(expense.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return

        const result = await deleteExpense(id)
        if (result.success) {
            setExpenses(expenses.filter(e => e.id !== id))
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    // Filter by month
    const filteredExpenses = selectedMonth
        ? expenses.filter(e => {
            const expenseMonth = new Date(e.date).toISOString().slice(0, 7)
            return expenseMonth === selectedMonth
        })
        : expenses

    // Calculate totals
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const recurringTotal = filteredExpenses.filter(e => e.recurring).reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Wallet className="h-7 w-7 text-primary" />
                            Gastos Fijos
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Administra los gastos fijos de la agencia</p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-40"
                            placeholder="Filtrar mes"
                        />
                        <Button onClick={() => setShowForm(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nuevo Gasto</span>
                        </Button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border rounded-xl p-4 sm:p-6">
                        <p className="text-sm text-muted-foreground">Total Gastos</p>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600">
                            ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 sm:p-6">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" /> Gastos Recurrentes
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                            ${recurringTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Fecha</th>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Descripción</th>
                                    <th className="py-3 px-4 text-left font-medium whitespace-nowrap">Categoría</th>
                                    <th className="py-3 px-4 text-right font-medium whitespace-nowrap">Monto</th>
                                    <th className="py-3 px-4 text-center font-medium whitespace-nowrap">Recurrente</th>
                                    <th className="py-3 px-4 text-center font-medium whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No hay gastos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-muted/50">
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                {format(new Date(expense.date), 'd MMM yyyy', { locale: es })}
                                            </td>
                                            <td className="py-3 px-4">{expense.description}</td>
                                            <td className="py-3 px-4">
                                                {expense.category && (
                                                    <span className="bg-muted px-2 py-1 rounded text-xs">
                                                        {expense.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-red-600">
                                                ${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {expense.recurring && <RefreshCw className="h-4 w-4 text-amber-500 mx-auto" />}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleEdit(expense)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(expense.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">
                                    {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Descripción *</label>
                                    <Input
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ej: Renta de oficina"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium block mb-1">Monto *</label>
                                        <Input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium block mb-1">Fecha</label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium block mb-1">Categoría</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={formData.recurring}
                                        onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                                        className="rounded border-input"
                                    />
                                    <label htmlFor="recurring" className="text-sm">Es gasto recurrente (mensual)</label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
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
