/**
 * Compress an image file to reduce size before upload
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum size in MB (default 5MB)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default 1920)
 * @returns Compressed image as a Blob
 */
export async function compressImage(
    file: File,
    maxSizeMB: number = 5,
    maxWidthOrHeight: number = 1920
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidthOrHeight) {
                        height = (height * maxWidthOrHeight) / width;
                        width = maxWidthOrHeight;
                    }
                } else {
                    if (height > maxWidthOrHeight) {
                        width = (width * maxWidthOrHeight) / height;
                        height = maxWidthOrHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Start with high quality and reduce if needed
                let quality = 0.9;
                const maxSizeBytes = maxSizeMB * 1024 * 1024;

                const tryCompress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Compression failed'));
                                return;
                            }

                            // If still too large and quality can be reduced, try again
                            if (blob.size > maxSizeBytes && quality > 0.5) {
                                quality -= 0.1;
                                tryCompress();
                            } else {
                                resolve(blob);
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };

                tryCompress();
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Validate file size before processing
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns true if valid, false otherwise
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}
