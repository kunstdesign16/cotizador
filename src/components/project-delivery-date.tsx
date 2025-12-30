'use client'

import React, { useState } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { format, differenceInDays, isPast, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateProjectDate } from '@/actions/quotes'
import { cn } from "@/lib/utils"

interface ProjectDeliveryDateProps {
    id: string
    date: Date | null | string
    status: string // We pass status to know if it's already completed
}

export function ProjectDeliveryDate({ id, date, status }: ProjectDeliveryDateProps) {
    const [currentDate, setCurrentDate] = useState<Date | null>(date ? new Date(date) : null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Calculate delay
    const isCompleted = ['closed', 'approved'].includes(status)
    const delayDays = (currentDate && !isCompleted && isPast(currentDate) && !isSameDay(currentDate, new Date()))
        ? differenceInDays(new Date(), currentDate)
        : 0

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setLoading(true)
        const newDate = val ? new Date(val + 'T12:00:00') : null // Avoid TZ issues being prev day

        const res = await updateProjectDate(id, newDate)
        if (res.success) {
            setCurrentDate(newDate)
            setIsOpen(false)
        }
        setLoading(false)
    }

    const dateString = currentDate ? currentDate.toISOString().split('T')[0] : ''

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors",
                    delayDays > 0
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "text-amber-600 hover:bg-amber-50"
                )}>
                    {delayDays > 0 ? (
                        <AlertCircle className="h-3 w-3" />
                    ) : (
                        <Calendar className="h-3 w-3" />
                    )}

                    {currentDate ? (
                        <span>
                            {delayDays > 0 ? `Retraso (+${delayDays}d)` : `Entrega: ${format(currentDate, 'd MMM', { locale: es })}`}
                        </span>
                    ) : (
                        <span>Sin fecha entrega</span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Fecha de Entrega</h4>
                    <p className="text-xs text-muted-foreground">
                        {currentDate
                            ? format(currentDate, "PPPP", { locale: es })
                            : "Selecciona una fecha para calcular tiempos de entrega."
                        }
                    </p>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={dateString}
                            onChange={handleDateChange}
                            disabled={loading}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
