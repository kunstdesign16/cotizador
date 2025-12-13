'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ClientExportButton() {
    const handleExport = () => {
        window.location.href = '/api/clients/export'
    }

    return (
        <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar
        </Button>
    )
}
