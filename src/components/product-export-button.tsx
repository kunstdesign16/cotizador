'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportProductsToCSV } from "@/actions/products"

export function ProductExportButton() {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            const csvData = await exportProductsToCSV()

            // Create Blob and download
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `productos_kunst_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error(error)
            alert("Error al exportar productos")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" className="gap-2" onClick={handleExport} disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? 'Exportando...' : 'Exportar Excel'}
        </Button>
    )
}
