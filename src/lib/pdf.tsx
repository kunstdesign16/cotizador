import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { sharedStyles, PDFHeader, PDFFooter, PDFWatermark } from './pdf-shared';

const styles = StyleSheet.create({
    ...sharedStyles,
    // Project Info Block
    projectInfoContainer: {
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 4,
        marginTop: 20,
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
        marginTop: 20 // Changed from 5 to 20 based on the instruction's intent to increase marginTop
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
    }
});

// Helper to format currency
const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const QuoteDocument = ({ quote }: {
    quote: {
        project_name: string;
        date: string | Date;
        status: string;
        subtotal: number;
        iva_amount: number;
        isr_amount: number;
        total: number;
        client?: { name: string; company?: string };
        items?: Array<{
            concept: string;
            quantity: number;
            unit_cost: number;
            subtotal: number;
            isSubItem?: boolean;
            productName?: string;
        }>;
    }
}) => {
    const rawItems = quote.items || [];

    // Grouping Logic
    const groupedItems: Array<{
        concept: string;
        quantity: number;
        unit_cost: number;
        subtotal: number;
    }> = [];

    rawItems.forEach((item) => {
        if (item.isSubItem && groupedItems.length > 0) {
            const lastRow = groupedItems[groupedItems.length - 1];
            lastRow.concept += ` + ${item.concept || item.productName || ''}`;
            lastRow.unit_cost += item.unit_cost;
            lastRow.subtotal += item.subtotal;
        } else {
            groupedItems.push({
                concept: item.concept || item.productName || 'Concepto',
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                subtotal: item.subtotal
            });
        }
    });

    const isApproved = quote.status === 'APPROVED';

    return (
        <Document title={`Cotización ${quote.project_name}`}>
            <Page size="LETTER" style={styles.page}>
                {/* Unified Branding Header, Watermark and Footer */}
                <PDFWatermark isApproved={isApproved} />
                <PDFHeader date={quote.date} />

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

                    {groupedItems.map((item, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colDesc}>{item.concept}</Text>
                            <Text style={styles.colUnit}>{formatCurrency(item.unit_cost)}</Text>
                            <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
                        </View>
                    ))}
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

                <PDFFooter />
            </Page>
        </Document>
    );
};
