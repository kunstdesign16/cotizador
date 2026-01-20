import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import path from 'path';

const LOGO_PATH = path.join(process.cwd(), 'public/brand/logo.png');

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
    },
    copyContainer: {
        height: '48%', // Half page approx
        borderBottomWidth: 1,
        borderBottomStyle: 'dashed',
        borderBottomColor: '#CBD5E1',
        paddingBottom: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15, // Added margin for copyLabel clearance
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#284960',
    },
    idStats: {
        flexDirection: 'row',
        gap: 20,
    },
    idBlock: {
        alignItems: 'center',
    },
    idLabel: {
        fontSize: 10,
        color: '#64748B',
        textTransform: 'uppercase',
    },
    idValue: {
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#545555',
    },
    logo: {
        width: 140,
        height: 'auto',
    },
    mainGrid: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    gridRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    gridLabel: {
        padding: 5,
        fontSize: 8,
        color: '#64748B',
        backgroundColor: '#F8FAFC',
        width: 80,
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
    },
    gridValue: {
        padding: 5,
        fontSize: 10,
        color: '#1E293B',
        flex: 1,
    },
    conformityNote: {
        marginTop: 10,
        fontSize: 10,
        color: '#1E293B',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#284960',
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: 'bold',
        padding: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        fontSize: 9,
        padding: 5,
    },
    colQty: { width: '15%', textAlign: 'center' },
    colConcept: { width: '40%', textAlign: 'left' },
    colPza: { width: '20%', textAlign: 'center' },
    colTotalPieces: { width: '25%', textAlign: 'center' },
    tableFooter: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#284960',
        fontSize: 10,
        fontWeight: 'bold',
        padding: 8,
        marginTop: 5,
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    signatureBlock: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: 150,
        textAlign: 'center',
        paddingTop: 5,
        fontSize: 10,
        color: '#64748B',
    },
    copyLabel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        textAlign: 'center', // Center it to avoid overlap with right-side date
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94A3B8',
        textTransform: 'uppercase',
        backgroundColor: '#F8FAFC',
        paddingVertical: 2,
    }
});

const DeliveryCopy = ({ project, label }: { project: any, label: string }) => {
    const approvedQuote = project.quotes?.find((q: any) => q.isApproved);
    const standardItems = approvedQuote?.items || [];
    const extraItems = project.deliveryExtraItems || [];

    // Merge only items that have at least one piece counted
    const allItems = [
        ...standardItems.map((item: any) => ({
            concept: item.packagingConcept || item.concept,
            boxes: item.boxes || 0,
            piecesPerBox: item.piecesPerBox || 0
        })),
        ...extraItems.map((item: any) => ({
            concept: item.packagingConcept || item.concept,
            boxes: item.boxes || 0,
            piecesPerBox: item.piecesPerBox || 0
        }))
    ].filter(item => item.boxes > 0 && item.piecesPerBox > 0);

    const sellerName = project.sellerName || (project.user?.name && project.user.name !== 'Administrador'
        ? project.user.name
        : project.user?.email || 'Vendedor Kunst');

    return (
        <View style={styles.copyContainer}>
            <Text style={styles.copyLabel}>{label}</Text>

            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Entrega de Mercancia</Text>
                    <Image src={LOGO_PATH} style={styles.logo} />
                </View>

                <View style={styles.idStats}>
                    <View style={styles.idBlock}>
                        <Text style={styles.idLabel}>Orden</Text>
                        <Text style={styles.idValue}>{project.orderNumber || '------'}</Text>
                    </View>
                    <View style={styles.idBlock}>
                        <Text style={styles.idLabel}>Folio</Text>
                        <Text style={styles.idValue}>{project.folioNumber || '------'}</Text>
                    </View>
                    <View style={styles.idBlock}>
                        <Text style={styles.idLabel}>Fecha Recibo</Text>
                        <Text style={[styles.idValue, { fontSize: 12 }]}>
                            {project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString('es-MX') : '---/---/---'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainGrid}>
                <View style={styles.gridRow}>
                    <Text style={styles.gridLabel}>Vendedor</Text>
                    <Text style={styles.gridValue}>{sellerName}</Text>
                    <Text style={styles.gridLabel}>Transporte</Text>
                    <Text style={styles.gridValue}>{project.transportType || '---'}</Text>
                </View>
            </View>

            <Text style={styles.conformityNote}>
                Recibi de conformidad de <Text style={{ fontWeight: 'bold' }}>Kunst & Design</Text> lo siguiente:
            </Text>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colQty}>PAQUETES</Text>
                    <Text style={styles.colConcept}>CONCEPTO (EMPAQUE)</Text>
                    <Text style={styles.colPza}>PZAS/PAQUETE</Text>
                    <Text style={styles.colTotalPieces}>TOTAL PZAS.</Text>
                </View>
                {allItems.length > 0 ? allItems.map((item: any, i: number) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={styles.colQty}>{item.boxes}</Text>
                        <Text style={styles.colConcept}>{item.concept}</Text>
                        <Text style={styles.colPza}>{item.piecesPerBox}</Text>
                        <Text style={styles.colTotalPieces}>{item.boxes * item.piecesPerBox}</Text>
                    </View>
                )) : (
                    <View style={styles.tableRow}>
                        <Text style={{ flex: 1, textAlign: 'center', color: '#94A3B8', fontSize: 8 }}>No se registraron piezas de envío</Text>
                    </View>
                )}

                {/* Total row */}
                <View style={styles.tableFooter}>
                    <Text style={{ flex: 1, textAlign: 'right', paddingRight: 10, color: '#284960' }}>TOTAL FINAL DE PIEZAS:</Text>
                    <Text style={{ width: '25%', textAlign: 'center', backgroundColor: '#F1F5F9' }}>
                        {allItems.reduce((sum: number, item: any) => sum + (item.boxes * item.piecesPerBox), 0)}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.signatureBlock}>
                    <Text>Cliente</Text>
                </View>
                <View style={[styles.signatureBlock, { borderTopWidth: 0, textAlign: 'right', width: 250 }]}>
                    <Text style={{ fontSize: 7, textAlign: 'right' }}>Kunst & Design - Desarrollando ideas, creando sueños.</Text>
                </View>
            </View>
        </View>
    );
};

export const DeliveryOrderDocument = ({ project }: { project: any }) => (
    <Document title={`Orden de Entrega - ${project.name}`}>
        <Page size="LETTER" style={styles.page}>
            <DeliveryCopy project={project} label="Copia Cliente" />
            <DeliveryCopy project={project} label="Copia Kunst Design" />
        </Page>
    </Document>
);
