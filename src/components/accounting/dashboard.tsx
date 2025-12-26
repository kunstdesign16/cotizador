'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Calculator,
    TrendingUp,
    Wallet,
    Download,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { IncomeTable, VariableExpenseTable } from './tables'
import { IncomeForm, VariableExpenseForm } from './forms'
import { ExpensesClient } from '@/components/expenses-client'

function KPICard({ title, amount, icon: Icon, trend, color }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                {trend && (
                    <p className="text-xs text-muted-foreground pt-1">
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export function AccountingDashboard({ summary, trends, projects, suppliers, month }: { summary: any, trends: any[], projects: any[], suppliers: any[], month: string }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")
    const [localMonth, setLocalMonth] = useState(month)

    useEffect(() => {
        setLocalMonth(month)
    }, [month])

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setLocalMonth(val)
        router.push(`/accounting?month=${val}`)
    }

    const totalIncome = summary.incomes.reduce((sum: number, i: any) => sum + i.amount, 0)
    const totalIVAIncome = summary.incomes.reduce((sum: number, i: any) => sum + (i.iva || 0), 0)

    const totalVariable = summary.variableExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
    const totalIVAVariable = summary.variableExpenses.reduce((sum: number, e: any) => sum + (e.iva || 0), 0)

    const totalFixed = summary.fixedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
    const totalExpenses = totalVariable + totalFixed
    const netProfit = totalIncome - totalExpenses

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Finanzas</h2>
                <div className="flex items-center gap-2">
                    <Input
                        type="month"
                        value={localMonth}
                        onChange={handleMonthChange}
                        className="w-[180px]"
                    />
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(`/api/accounting/export?month=${month}`)}
                    >
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="incomes">Ingresos</TabsTrigger>
                    <TabsTrigger value="expenses">Egresos (Variables)</TabsTrigger>
                    <TabsTrigger value="fixed">Gastos Fijos</TabsTrigger>
                    <TabsTrigger value="historics">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KPICard
                            title="Ingreso Total (Subtotal)"
                            amount={totalIncome}
                            icon={TrendingUp}
                            trend="Monto facturado antes de impuestos"
                            color="text-green-600"
                        />
                        <KPICard
                            title="Utilidad Neta del Mes"
                            amount={netProfit}
                            icon={Wallet}
                            trend={`Margen: ${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%`}
                            color={netProfit >= 0 ? "text-blue-600" : "text-red-600"}
                        />
                        <KPICard
                            title="IVA Cobrado"
                            amount={totalIVAIncome}
                            icon={Calculator}
                            color="text-green-600"
                        />
                        <KPICard
                            title="IVA Pagado"
                            amount={totalIVAVariable}
                            icon={Calculator}
                            color="text-red-600"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Flujo de Caja</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <CashFlowChart incomes={summary.incomes} expenses={summary.variableExpenses.concat(summary.fixedExpenses)} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Distribución de Gastos</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ExpenseDistributionChart variable={summary.variableExpenses} fixed={summary.fixedExpenses} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="incomes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Registro de Ingresos</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <ArrowDownRight className="h-4 w-4" /> Registrar Cobro
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Registrar Cobro Manual</DialogTitle>
                                </DialogHeader>
                                <IncomeForm projects={projects} onSuccess={() => window.location.reload()} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <IncomeTable incomes={summary.incomes} />
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Gastos de Producción y Proveedores</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 border-red-200 text-red-700 hover:bg-red-50">
                                    <ArrowUpRight className="h-4 w-4" /> Registrar Egreso
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Registrar Egreso Manual</DialogTitle>
                                </DialogHeader>
                                <VariableExpenseForm projects={projects} suppliers={suppliers} onSuccess={() => window.location.reload()} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <VariableExpenseTable expenses={summary.variableExpenses} />
                </TabsContent>

                <TabsContent value="fixed" className="space-y-4">
                    <ExpensesClient initialExpenses={summary.fixedExpenses} />
                </TabsContent>

                <TabsContent value="historics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tendencias de los Últimos 6 Meses</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <TrendChart trends={trends} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Comparativa Mensual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 text-left">Mes</th>
                                            <th className="p-3 text-right">Ingresos</th>
                                            <th className="p-3 text-right">Egresos</th>
                                            <th className="p-3 text-right">Utilidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trends.map(t => (
                                            <tr key={t.month} className="border-t hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium capitalize">{t.label}</td>
                                                <td className="p-3 text-right text-green-600">${t.income.toLocaleString()}</td>
                                                <td className="p-3 text-right text-red-600">${t.expense.toLocaleString()}</td>
                                                <td className="p-3 text-right font-bold">${(t.income - t.expense).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function CashFlowChart({ incomes, expenses }: { incomes: any[], expenses: any[] }) {
    const totalInc = incomes.reduce((s, i) => s + i.amount + (i.iva || 0), 0)
    const totalExp = expenses.reduce((s, e) => s + e.amount + (e.iva || 0), 0)
    const max = Math.max(totalInc, totalExp, 1)

    return (
        <div className="h-full w-full flex items-end gap-8 px-4 pb-8">
            <div className="flex-1 flex flex-col items-center gap-2">
                <div
                    className="w-full bg-green-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(totalInc / max) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs font-medium">Ingresos</span>
                <span className="text-[10px] text-muted-foreground">${totalInc.toLocaleString()}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
                <div
                    className="w-full bg-red-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(totalExp / max) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs font-medium">Egresos</span>
                <span className="text-[10px] text-muted-foreground">${totalExp.toLocaleString()}</span>
            </div>
        </div>
    )
}

function ExpenseDistributionChart({ variable, fixed }: { variable: any[], fixed: any[] }) {
    const totalVar = variable.reduce((s, e) => s + e.amount + (e.iva || 0), 0)
    const totalFix = fixed.reduce((s, e) => s + e.amount, 0)
    const total = totalVar + totalFix || 1

    return (
        <div className="h-full flex flex-col justify-center space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Gastos Variables</span>
                    <span className="font-medium">${totalVar.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(totalVar / total) * 100}%` }} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Gastos Fijos</span>
                    <span className="font-medium">${totalFix.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(totalFix / total) * 100}%` }} />
                </div>
            </div>
            <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">Total Egresos</p>
                <p className="text-2xl font-bold">${(totalVar + totalFix).toLocaleString()}</p>
            </div>
        </div>
    )
}

function TrendChart({ trends }: { trends: any[] }) {
    const maxVal = Math.max(...trends.map(t => Math.max(t.income, t.expense)), 1)

    return (
        <div className="h-full w-full flex items-end gap-2 sm:gap-4 px-2 pb-10">
            {trends.map((t, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full max-h-[300px]">
                        <div
                            className="w-1/3 bg-green-500 rounded-t sm:rounded-t-md transition-all duration-500 hover:brightness-110 relative"
                            style={{ height: `${(t.income / maxVal) * 100}%`, minHeight: '2px' }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold bg-white border p-1 rounded shadow-sm z-10 pointer-events-none">
                                ${t.income.toLocaleString()}
                            </div>
                        </div>
                        <div
                            className="w-1/3 bg-red-500 rounded-t sm:rounded-t-md transition-all duration-500 hover:brightness-110 relative"
                            style={{ height: `${(t.expense / maxVal) * 100}%`, minHeight: '2px' }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold bg-white border p-1 rounded shadow-sm z-10 pointer-events-none">
                                ${t.expense.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap rotate-45 sm:rotate-0 mt-2">
                        {t.label}
                    </span>
                </div>
            ))}
        </div>
    )
}
