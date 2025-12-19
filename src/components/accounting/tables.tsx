'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Trash2, Pencil, MoreHorizontal } from "lucide-react"
import { deleteIncome, deleteVariableExpense } from "@/actions/accounting"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function IncomeTable({ incomes }: { incomes: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Cliente / Proyecto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">IVA</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {incomes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No hay ingresos registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        incomes.map((income) => (
                            <TableRow key={income.id}>
                                <TableCell>{format(new Date(income.date), 'd MMM yyyy', { locale: es })}</TableCell>
                                <TableCell>{income.description || 'Sin descripción'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{income.client?.name || '-'}</span>
                                        <span className="text-xs text-muted-foreground">{income.quote?.project_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{income.paymentMethod || '-'}</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    ${(income.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ${(income.amount + (income.iva || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={async () => {
                                                    if (confirm('¿Eliminar este ingreso?')) {
                                                        await deleteIncome(income.id)
                                                        window.location.reload()
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export function VariableExpenseTable({ expenses }: { expenses: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-right">IVA</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No hay egresos registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{format(new Date(expense.date), 'd MMM yyyy', { locale: es })}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>
                                    <span className="bg-muted px-2 py-1 rounded text-xs">{expense.category || 'General'}</span>
                                </TableCell>
                                <TableCell>{expense.supplier?.name || '-'}</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    ${(expense.iva || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right font-bold text-red-600">
                                    ${(expense.amount + (expense.iva || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={async () => {
                                                    if (confirm('¿Eliminar este egreso?')) {
                                                        await deleteVariableExpense(expense.id)
                                                        window.location.reload()
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
