import { Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Disable Hyphenation globally for institutional documents
Font.registerHyphenationCallback(word => [word]);

const LOGO_PATH = '/Users/kunstdesign/Documents/cotizador_kunst/kunst_design.png';
const WATERMARK_PATH = '/Users/kunstdesign/Documents/cotizador_kunst/Imagotipo KD carta.png';

export const sharedStyles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        paddingTop: '30mm',
        paddingBottom: '35mm', // Space for the larger footer
        paddingLeft: '20mm',
        paddingRight: '20mm',
        fontSize: 10,
        color: '#545555',
        backgroundColor: '#FFFFFF',
    },
    // Watermark - Full Page Image KD Carta (as provided by user)
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        opacity: 0.05, // 5% opacity
    },
    watermark: {
        width: '80%', // size 70-80%
        height: 'auto',
    },
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
        position: 'absolute',
        top: '12mm',
        left: '20mm',
        right: '20mm',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 10,
    },
    logo: {
        width: '58mm', // Match the width used in the successful Quote PDF
        height: 'auto',
    },
    headerInfo: {
        alignItems: 'flex-end',
        textAlign: 'right'
    },
    locationText: {
        fontSize: 10,
        color: '#545555',
        marginBottom: 2
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#284960',
    },
    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: '15mm',
        left: '20mm',
        right: '20mm',
        alignItems: 'center',
    },
    contactLine: {
        fontSize: 12, // Larger as requested
        fontWeight: 'bold',
        color: '#284960',
        marginBottom: 8,
        textAlign: 'center',
        width: '100%',
    },
    footerDivider: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginBottom: 10
    },
    slogan: {
        fontSize: 20, // Larger and Bold
        fontWeight: 'bold',
        color: '#545555',
        textAlign: 'center',
        width: '100%',
        letterSpacing: 1.5,
    }
});

export const PDFWatermark = ({ isApproved = true }: { isApproved?: boolean }) => (
    <>
        <View style={sharedStyles.watermarkContainer}>
            <Image src={WATERMARK_PATH} style={sharedStyles.watermark} />
        </View>
        {!isApproved && (
            <Text style={sharedStyles.draftWatermark}>PRELIMINAR</Text>
        )}
    </>
);

export const PDFHeader = ({ date }: { date: string | Date }) => (
    <View style={sharedStyles.headerContainer}>
        <Image src={LOGO_PATH} style={sharedStyles.logo} />
        <View style={sharedStyles.headerInfo}>
            <Text style={sharedStyles.locationText}>Tlajomulco de Zúñiga, Jalisco</Text>
            <Text style={sharedStyles.dateText}>
                {new Date(date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </Text>
        </View>
    </View>
);

export const PDFFooter = () => (
    <View style={sharedStyles.footerContainer}>
        <Text style={sharedStyles.contactLine}>
            mayelam@kunstdesign.com.mx  |  +52 33 51 18 11 22  |  @kunstanddesign
        </Text>
        <View style={sharedStyles.footerDivider} />
        <Text style={sharedStyles.slogan}>
            Desarrollando ideas, creando sueños.
        </Text>
    </View>
);
