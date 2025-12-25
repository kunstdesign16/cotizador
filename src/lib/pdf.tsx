import { Page, Text, View, Document, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer';

// Disable Hyphenation for all fonts (Prevents breaking words with hyphens)
Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        paddingTop: '25mm',
        paddingBottom: '25mm',
        paddingLeft: '20mm',
        paddingRight: '20mm',
        fontSize: 10,
        color: '#545555',
    },
    // Background Watermark (Full Page Image KD Carta)
    // Using a full-page container to match the exact position in the provided PNG
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: 0.05, // Applying 5% opacity as requested
    },
    watermark: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' // Cover full page to maintain coordinates
    },
    // Draft Status Watermark Text - PRELIMINAR
    draftWatermark: {
        position: 'absolute',
        fontSize: 110,
        color: '#94A3B8',
        opacity: 0.12,
        transform: 'rotate(-45deg)',
        fontWeight: 'bold',
        width: 800,
        textAlign: 'center',
        top: '40%',
        left: '50%',
        marginLeft: -400,
        zIndex: 50
    },
    // Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 15
    },
    logo: {
        width: '58mm', // Increased by 20% (from 48mm)
        height: 'auto'
    },
    headerInfo: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    headerCityDate: {
        fontSize: 10,
        color: '#545555',
        marginBottom: 2
    },
    headerDate: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 2
    },
    // Project Info Block
    projectInfoContainer: {
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 4
    },
    projectInfoColumn: {
        flex: 1
    },
    projectTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#284960',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    clientName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 2
    },
    clientDetail: {
        fontSize: 9,
        color: '#64748B'
    },

    // Table
    table: {
        width: '100%',
        marginBottom: 15,
        marginTop: 5
    },
    tableHeaderNode: {
        flexDirection: 'row',
        backgroundColor: '#284960',
        color: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: 11,
        letterSpacing: 0.5
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: 'center'
    },
    // Columns
    colQty: { width: '10%', textAlign: 'center' },
    colDesc: { width: '50%', textAlign: 'left', paddingRight: 10 },
    colUnit: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    // Totals Section
    totalsContainer: {
        alignItems: 'flex-end',
        marginTop: 15
    },
    totalRow: {
        flexDirection: 'row',
        width: '40%',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 8
    },
    totalLabel: {
        fontWeight: 'bold',
        fontSize: 11,
        color: '#545555',
        textAlign: 'right',
        width: '60%'
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#545555',
        textAlign: 'right',
        width: '40%'
    },
    totalFinalRow: {
        flexDirection: 'row',
        width: '40%',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: '#284960',
        marginTop: 8,
        borderRadius: 4
    },
    totalFinalLabel: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#FFFFFF',
        textAlign: 'right',
        width: '60%'
    },
    totalFinalValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'right',
        width: '40%'
    },

    // Legal Legend
    legalLegend: {
        marginTop: 8,
        fontSize: 8,
        color: '#64748B',
        textAlign: 'right',
        fontStyle: 'italic'
    },

    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
        alignItems: 'center'
    },
    footerContactLine: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 8,
        textAlign: 'center'
    },
    footerDivider: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginBottom: 10
    },
    footerSlogan: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#545555',
        textAlign: 'center',
        width: '100%',
        letterSpacing: 1
    }
});

// Helper to format currency
const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const QuoteDocument = ({ quote }: { quote: any }) => {
    // Logic for dynamic quantities/prices
    const items = quote.items || [];
    const totalQuantity = items.length > 0 ? Math.max(...items.map((i: any) => i.quantity || 0)) : 1;
    const unitPrice = quote.subtotal / totalQuantity;

    const logoSrc = "/logo_header.png";
    const watermarkSrc = "/imagotipo_full.png";

    return (
        <Document title={`Cotización ${quote.project_name}`}>
            <Page size="LETTER" style={styles.page}>
                {/* Background Watermark Layer */}
                <View style={styles.watermarkContainer}>
                    <Image src={watermarkSrc} style={styles.watermark} />
                </View>

                {/* Conditional Watermark Text (PRELIMINAR) */}
                {quote.status !== 'APPROVED' && (
                    <Text style={styles.draftWatermark}>PRELIMINAR</Text>
                )}

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Image src={logoSrc} style={styles.logo} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerCityDate}>Tlajomulco de Zúñiga, Jalisco</Text>
                        <Text style={styles.headerDate}>{new Date(quote.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    </View>
                </View>

                {/* Project Info */}
                <View style={styles.projectInfoContainer}>
                    <View style={styles.projectInfoColumn}>
                        <Text style={[styles.clientDetail, { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>Proyecto</Text>
                        <Text style={styles.projectTitle}>{quote.project_name}</Text>
                    </View>
                    <View style={[styles.projectInfoColumn, { alignItems: 'flex-end' }]}>
                        <Text style={[styles.clientDetail, { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>Cliente</Text>
                        <Text style={styles.clientName}>
                            {quote.client?.company || quote.client?.name}
                        </Text>
                        {quote.client?.company && (
                            <Text style={styles.clientDetail}>{quote.client.name}</Text>
                        )}
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderNode}>
                        <Text style={[styles.colQty, styles.tableHeaderText]}>CANT.</Text>
                        <Text style={[styles.colDesc, styles.tableHeaderText]}>CONCEPTO / DESCRIPCIÓN</Text>
                        <Text style={[styles.colUnit, styles.tableHeaderText]}>PRECIO U.</Text>
                        <Text style={[styles.colTotal, styles.tableHeaderText]}>IMPORTE</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.colQty}>{totalQuantity}</Text>
                        <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>{quote.project_name}</Text>
                        <Text style={styles.colUnit}>{formatCurrency(unitPrice)}</Text>
                        <Text style={styles.colTotal}>{formatCurrency(quote.subtotal)}</Text>
                    </View>
                </View>

                {/* Totals Section */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
                    </View>

                    {quote.iva_amount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA (16%)</Text>
                            <Text style={styles.totalValue}>{formatCurrency(quote.iva_amount)}</Text>
                        </View>
                    )}

                    {quote.isr_amount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Retenciones (ISR)</Text>
                            <Text style={styles.totalValue}>{formatCurrency(quote.isr_amount)}</Text>
                        </View>
                    )}

                    <View style={styles.totalFinalRow}>
                        <Text style={styles.totalFinalLabel}>IMPORTE TOTAL</Text>
                        <Text style={styles.totalFinalValue}>{formatCurrency(quote.total)}</Text>
                    </View>

                    <Text style={styles.legalLegend}>
                        Vigencia de la cotización: 10 días naturales a partir de su fecha de envío.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerContactLine}>
                        mayelam@kunstdesign.com.mx  |  +52 33 51 18 11 22  |  @kunstanddesign
                    </Text>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerSlogan}>
                        Desarrollando ideas, creando sueños.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
