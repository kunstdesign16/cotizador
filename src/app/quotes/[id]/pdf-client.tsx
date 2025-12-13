'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuoteDocument } from '@/lib/pdf'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function QuotePDFClient({ quote }: { quote: any }) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <Button variant="default" disabled>Cargando PDF...</Button>
    }

    return (
        <PDFDownloadLink
            document={<QuoteDocument quote={quote} />}
            fileName={`cotizacion-${quote.project_name}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <Button variant="default" className="gap-2" disabled={loading}>
                    <Download className="h-4 w-4" />
                    {loading ? 'Generando...' : 'Descargar PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
