'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/actions/quotes'

const STATUSES = {
    'DRAFT': 'Borrador',
    'COTIZADO': 'Cotizado',
    'PRODUCCION': 'Producción',
    'ENTREGADO': 'Entregado',
    'FACTURADO': 'Facturado',
    'COBRADO': 'Cobrado'
}

export function QuoteStatusSelector({ id, currentStatus, compact = false }: { id: string, currentStatus: string, compact?: boolean }) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        const res = await updateQuoteStatus(id, newStatus)
        if (res.success) {
            setStatus(newStatus)
        }
        setLoading(false)
    }

    // Colors mapping (reused or imported, preferably reused)
    const STATUS_COLORS: Record<string, string> = {
        'DRAFT': 'bg-gray-100 text-gray-600',
        'COTIZADO': 'bg-blue-50 text-blue-700',
        'PRODUCCION': 'bg-amber-50 text-amber-700',
        'ENTREGADO': 'bg-purple-50 text-purple-700',
        'FACTURADO': 'bg-indigo-50 text-indigo-700',
        'COBRADO': 'bg-emerald-50 text-emerald-700'
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
            className={`rounded-full border-0 text-xs font-medium ring-1 ring-inset focus:ring-2 focus:ring-primary ${STATUS_COLORS[status] || 'bg-gray-100'} ${compact ? 'py-1 pl-2 pr-6 h-auto w-auto' : 'h-9 py-1 text-sm'}`}
        >
            {Object.entries(STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
            ))}
        </select>
    )
}
