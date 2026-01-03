
/**
 * Utility to handle file downloading and sharing.
 * Uses Web Share API if available and falling back to traditional download.
 */
export async function downloadOrShareFile(blob: Blob, fileName: string, title?: string) {
    if (typeof window === 'undefined') return;

    // Check for Web Share API support
    const file = new File([blob], fileName, { type: blob.type });
    const canShare = !!navigator.share && !!navigator.canShare && navigator.canShare({ files: [file] });

    if (canShare) {
        try {
            await navigator.share({
                files: [file],
                title: title || fileName,
                text: title || fileName,
            });
            return;
        } catch (error) {
            // If sharing fails (e.g. user cancelled), fall back to download
            if ((error as Error).name !== 'AbortError') {
                console.error('Error sharing:', error);
            } else {
                return; // User cancelled
            }
        }
    }

    // Fallback: Traditional download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // For iOS Safari, we might need some extra handling if this fails
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Checks if the current browser/device is likely to support the Share API for files.
 * This is useful for deciding whether to use the Fetch-Blob-Share flow or just a direct link.
 */
export function isShareSupported() {
    if (typeof navigator === 'undefined') return false;

    // Basic check for navigator.share
    if (!navigator.share || !navigator.canShare) return false;

    // On desktop, we generally prefer direct download even if navigator.share exists
    // (like in Safari macOS) unless we specifically want the share menu.
    // For our case, we'll only assume sharing is preferred on mobile devices.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile;
}
