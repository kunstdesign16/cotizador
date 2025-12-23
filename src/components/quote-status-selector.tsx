'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/actions/quotes'
import { useRouter } from 'next/navigation'

const STATUSES = {
    'DRAFT': 'Borrador',
    'SAVED': 'Guardado',
    'SENT': 'Enviado',
    'APPROVED': 'Aprobado',
    'FACTURADO': 'Facturado',
    'COBRADO': 'Cobrado'
}

const STATUS_COLORS: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-600 ring-gray-500/10',
    'SAVED': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'SENT': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    'APPROVED': 'bg-green-50 text-green-700 ring-green-600/20',
    'FACTURADO': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    'COBRADO': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
}

export function QuoteStatusSelector({ id, currentStatus, compact = false }: { id: string, currentStatus: string, compact?: boolean }) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        const res = await updateQuoteStatus(id, newStatus)
        if (res.success) {
            setStatus(newStatus)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
            }}
            disabled={loading}
            className={`rounded-full border-0 text-[10px] font-medium ring-1 ring-inset focus:ring-2 focus:ring-primary ${STATUS_COLORS[status] || 'bg-gray-100'} ${compact ? 'py-0.5 px-2 h-auto w-auto' : 'h-8 py-1 px-3 text-xs'}`}
        >
            {Object.entries(STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
            ))}
        </select>
    )
}
