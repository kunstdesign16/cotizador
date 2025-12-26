import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { QuoteDocument } from '@/lib/pdf';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { prisma } = await import('@/lib/prisma');

        const quote = await (prisma as any).quote.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
            }
        });

        if (!quote) {
            return NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
        }

        // Normalize data for the component
        const normalizedQuote = {
            ...quote,
            client: quote.client ? {
                ...quote.client,
                company: quote.client.company ?? undefined,
            } : undefined
        };

        // Render PDF directly to stream
        const stream = await renderToStream(
            <QuoteDocument quote={normalizedQuote as any} />
        );

        // Sanitize filename
        const projectName = quote.project_name.replace(/[^a-z0-9]/gi, '_');
        const clientName = (quote.client?.name || 'Cliente').replace(/[^a-z0-9]/gi, '_');
        const fileName = `Cotizacion_${projectName}_${clientName}.pdf`;

        // Return PDF response
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: any) {
        console.error('Error in Quote PDF route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
