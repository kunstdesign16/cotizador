'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/actions/quotes'
import { useRouter } from 'next/navigation'

const STATUSES = {
    'draft': 'Borrador',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'replaced': 'Reemplazado'
}

const STATUS_COLORS: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-600 ring-gray-500/10',
    'approved': 'bg-green-50 text-green-700 ring-green-600/20',
    'rejected': 'bg-red-50 text-red-700 ring-red-600/20',
    'replaced': 'bg-orange-50 text-orange-700 ring-orange-600/20'
}

export function QuoteStatusSelector({ id, currentStatus, compact = false, disabled = false }: { id: string, currentStatus: string, compact?: boolean, disabled?: boolean }) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (newStatus: 'draft' | 'approved' | 'rejected' | 'replaced') => {
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
            onChange={(e) => handleStatusChange(e.target.value as any)}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
            }}
            disabled={loading || disabled}
            className={`rounded-full border-0 text-[10px] font-medium ring-1 ring-inset focus:ring-2 focus:ring-primary ${STATUS_COLORS[status] || 'bg-gray-100'} ${compact ? 'py-0.5 px-2 h-auto w-auto' : 'h-8 py-1 px-3 text-xs'}`}
        >
            {Object.entries(STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
            ))}
        </select>
    )
}
