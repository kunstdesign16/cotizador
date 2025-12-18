'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react'
import { IncomeTable, VariableExpenseTable } from './tables'
import { ExpensesClient } from '@/components/expenses-client' // Reuse existing fixed expenses
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
    const totalVariable = summary.variableExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
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
                    {/* <TabsTrigger value="projects">Por Proyecto</TabsTrigger> */}
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
                            icon={ShoppingCartIcon}
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
                    </div>

                    {/* Chart / Graphs Area (Placeholder for now) */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Flujo de Caja</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                {/* We can implement Recharts here later */}
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md">
                                    Gráfica de Ingresos vs Egresos
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Distribución de Gastos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md">
                                    Gráfica de Pastel
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* INCOMES TAB */}
                <TabsContent value="incomes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Registro de Ingresos</h3>
                        <Button className="gap-2">
                            <ArrowDownRight className="h-4 w-4" /> Registrar Cobro
                        </Button>
                    </div>
                    <IncomeTable incomes={summary.incomes} />
                </TabsContent>

                {/* EXPENSES TAB */}
                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Gastos de Producción y Proveedores</h3>
                        {/* 
                            Usually linked to Supplier Orders, but maybe manual entry too? 
                            For now, just listing.
                        */}
                    </div>
                    <VariableExpenseTable expenses={summary.variableExpenses} />
                </TabsContent>

                {/* FIXED EXPENSES TAB */}
                <TabsContent value="fixed" className="space-y-4">
                    {/* Reuse existing component but pass data */}
                    <ExpensesClient initialExpenses={summary.fixedExpenses} />
                </TabsContent>

            </Tabs>
        </div>
    )
}

function ShoppingCartIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    )
}
