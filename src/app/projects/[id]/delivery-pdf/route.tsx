import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { DeliveryOrderDocument } from '@/lib/delivery-pdf';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { prisma } = await import('@/lib/prisma');

        const project = await (prisma as any).project.findUnique({
            where: { id },
            include: {
                client: true,
                user: true,
                quotes: {
                    where: { isApproved: true },
                    include: {
                        items: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Render PDF directly to stream
        const stream = await renderToStream(
            <DeliveryOrderDocument project={project as any} />
        );

        // Sanitize filename
        const projectName = project.name.replace(/[^a-z0-9]/gi, '_');
        const fileName = `Orden_Entrega_${projectName}.pdf`;

        // Return PDF response
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: any) {
        console.error('Error in Delivery Order PDF route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
