'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    Wallet,
    Download,
    DollarSign,
    FileText,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    ShoppingCart
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
import { ExpensesClient } from '@/components/expenses-client' // Reuse existing fixed expenses

// KPI Card Component
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

export function AccountingDashboard({ summary, month }: { summary: any, month: string }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonth = e.target.value
        router.push(`/accounting?month=${newMonth}`)
    }

    // Calculations
    const totalIncome = summary.incomes.reduce((sum: number, i: any) => sum + i.amount, 0)
    const totalIVAIncome = summary.incomes.reduce((sum: number, i: any) => sum + (i.iva || 0), 0)

    const totalVariable = summary.variableExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
    const totalIVAVariable = summary.variableExpenses.reduce((sum: number, e: any) => sum + (e.iva || 0), 0)

    const totalFixed = summary.fixedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
    const totalExpenses = totalVariable + totalFixed
    const netProfit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Finanzas</h2>
                <div className="flex items-center gap-2">
                    <Input
                        type="month"
                        value={month}
                        onChange={handleMonthChange}
                        className="w-[180px]"
                    />
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="incomes">Ingresos</TabsTrigger>
                    <TabsTrigger value="expenses">Egresos (Variables)</TabsTrigger>
                    <TabsTrigger value="fixed">Gastos Fijos</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* KPIs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KPICard
                            title="Ingresos Totales"
                            amount={totalIncome}
                            icon={TrendingUp}
                            color="text-green-500"
                        />
                        <KPICard
                            title="Gastos Variables"
                            amount={totalVariable}
                            icon={ShoppingCart}
                            color="text-blue-500"
                        />
                        <KPICard
                            title="Gastos Fijos"
                            amount={totalFixed}
                            icon={Wallet}
                            color="text-amber-500"
                        />
                        <KPICard
                            title="Utilidad Neta"
                            amount={netProfit}
                            icon={DollarSign}
                            color={netProfit >= 0 ? "text-green-500" : "text-red-500"}
                            trend={`${profitMargin.toFixed(1)}% Margen`}
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

                    {/* Chart / Graphs Area */}
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

                {/* INCOMES TAB */}
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
                                <IncomeForm onSuccess={() => window.location.reload()} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <IncomeTable incomes={summary.incomes} />
                </TabsContent>

                {/* EXPENSES TAB */}
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
                                <VariableExpenseForm onSuccess={() => window.location.reload()} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <VariableExpenseTable expenses={summary.variableExpenses} />
                </TabsContent>

                {/* FIXED EXPENSES TAB */}
                <TabsContent value="fixed" className="space-y-4">
                    <ExpensesClient initialExpenses={summary.fixedExpenses} />
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
    const totalFix = fixed.reduce((s, e) => s + e.amount + (e.iva || 0), 0)
    const total = totalVar + totalFix || 1

    const varPerc = (totalVar / total) * 100
    const fixPerc = (totalFix / total) * 100

    return (
        <div className="h-full w-full flex flex-col justify-center gap-6">
            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Variables</span>
                    <span className="font-bold">{varPerc.toFixed(1)}%</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${varPerc}%` }} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Fijos</span>
                    <span className="font-bold">{fixPerc.toFixed(1)}%</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${fixPerc}%` }} />
                </div>
            </div>
            <div className="pt-4 border-t text-center">
                <p className="text-sm font-bold text-muted-foreground">
                    Total Gastos: ${(totalVar + totalFix).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    )
}
