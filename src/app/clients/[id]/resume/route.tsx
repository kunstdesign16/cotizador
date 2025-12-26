import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ClientResumeDocument } from '@/lib/client-resume-pdf';
import { getClientReport } from '@/actions/reports';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Fetch client report data using the existing action
        const result = await getClientReport(id);

        if (!result.success || !result.report) {
            return NextResponse.json(
                { error: result.error || 'Client report not found' },
                { status: 404 }
            );
        }

        // Render PDF directly to stream
        const stream = await renderToStream(
            <ClientResumeDocument data={ result.report } />
        );

        // Return PDF response
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Hoja_de_Vida_${id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Error in Client Resume PDF route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
