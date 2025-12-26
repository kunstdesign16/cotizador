"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calculator, TrendingUp, TrendingDown, Wallet, Download, DollarSign } from 'lucide-react'

interface AccountingClientProps {
    quotes: any[]
    supplierOrders: any[]
    fixedExpenses: any[]
}

export function AccountingClient({ quotes, supplierOrders, fixedExpenses }: AccountingClientProps) {
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // Current month YYYY-MM
    )

    // Filter by selected month
    const filterByMonth = (date: string) => {
        return date.slice(0, 7) === selectedMonth
    }

    const filteredQuotes = quotes.filter(q => filterByMonth(q.date))
    const filteredOrders = supplierOrders.filter(o => filterByMonth(o.createdAt))
    const filteredExpenses = fixedExpenses.filter(e => filterByMonth(e.date))

    // Calculate totals
    const calculateOrderTotal = (items: any[]) => {
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : (items || [])
        return parsedItems.reduce((sum: number, item: any) => sum + (item.unitCost || 0) * (item.quantity || 0), 0)
    }

    const totalIncome = filteredQuotes.reduce((sum, q) => sum + q.total, 0)
    const totalSupplierCosts = filteredOrders.reduce((sum, o) => sum + calculateOrderTotal(o.items), 0)
    const totalFixedExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalExpenses = totalSupplierCosts + totalFixedExpenses
    const netProfit = totalIncome - totalExpenses

    // Export to CSV
    const handleExport = () => {
        const rows: string[][] = [
            ['Tipo', 'Descripción', 'Monto', 'Fecha']
        ]

        // Add income
        filteredQuotes.forEach(q => {
            rows.push(['Ingreso', `${q.project_name} - ${q.client?.company || q.client?.name}`, q.total.toString(), q.date.split('T')[0]])
        })

        // Add supplier orders
        filteredOrders.forEach(o => {
            const total = calculateOrderTotal(o.items)
            rows.push(['Egreso (Proveedor)', `${o.supplier.name} - ${o.quote?.project_name || 'Sin proyecto'}`, (-total).toString(), o.createdAt.split('T')[0]])
        })

        // Add fixed expenses
        filteredExpenses.forEach(e => {
            rows.push(['Gasto Fijo', e.description, (-e.amount).toString(), e.date.split('T')[0]])
        })

        const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `contabilidad-${selectedMonth}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Calculator className="h-7 w-7 text-primary" />
                            Contabilidad
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Resumen financiero de la agencia</p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-40"
                        />
                        <Button variant="outline" onClick={handleExport} className="gap-2">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Exportar CSV</span>
                        </Button>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Ingresos (Cobrado)
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">
                            ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredQuotes.length} proyecto{filteredQuotes.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="bg-card border rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            Pagos a Proveedores
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600">
                            ${totalSupplierCosts.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''}
                        </p>
                    </div>

                    <div className="bg-card border rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Wallet className="h-4 w-4 text-amber-500" />
                            Gastos Fijos
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                            ${totalFixedExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredExpenses.length} gasto{filteredExpenses.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className={`bg-card border rounded-xl p-4 sm:p-6 ${netProfit >= 0 ? 'ring-2 ring-green-200' : 'ring-2 ring-red-200'}`}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            Utilidad Neta
                        </div>
                        <p className={`text-2xl sm:text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {netProfit >= 0 ? 'Ganancia' : 'Pérdida'}
                        </p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income Section */}
                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-green-50">
                            <h2 className="font-semibold flex items-center gap-2 text-green-800">
                                <TrendingUp className="h-5 w-5" />
                                Ingresos (Cobrado)
                            </h2>
                        </div>
                        <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="py-2 px-4 text-left font-medium">Proyecto</th>
                                        <th className="py-2 px-4 text-left font-medium">Cliente</th>
                                        <th className="py-2 px-4 text-right font-medium">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredQuotes.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-muted-foreground">Sin ingresos este mes</td>
                                        </tr>
                                    ) : (
                                        filteredQuotes.map(q => (
                                            <tr key={q.id} className="hover:bg-muted/50">
                                                <td className="py-2 px-4 font-medium">{q.project_name}</td>
                                                <td className="py-2 px-4 text-muted-foreground">{q.client?.company || q.client?.name}</td>
                                                <td className="py-2 px-4 text-right text-green-600 font-medium">
                                                    ${q.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-red-50">
                            <h2 className="font-semibold flex items-center gap-2 text-red-800">
                                <TrendingDown className="h-5 w-5" />
                                Egresos (Pagados)
                            </h2>
                        </div>
                        <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="py-2 px-4 text-left font-medium">Concepto</th>
                                        <th className="py-2 px-4 text-left font-medium">Tipo</th>
                                        <th className="py-2 px-4 text-right font-medium">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredOrders.length === 0 && filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-muted-foreground">Sin egresos este mes</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {filteredOrders.map(o => (
                                                <tr key={o.id} className="hover:bg-muted/50">
                                                    <td className="py-2 px-4 font-medium">{o.supplier.name}</td>
                                                    <td className="py-2 px-4">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">Proveedor</span>
                                                    </td>
                                                    <td className="py-2 px-4 text-right text-red-600 font-medium">
                                                        ${calculateOrderTotal(o.items).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredExpenses.map(e => (
                                                <tr key={e.id} className="hover:bg-muted/50">
                                                    <td className="py-2 px-4 font-medium">{e.description}</td>
                                                    <td className="py-2 px-4">
                                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs">Gasto Fijo</span>
                                                    </td>
                                                    <td className="py-2 px-4 text-right text-red-600 font-medium">
                                                        ${e.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
