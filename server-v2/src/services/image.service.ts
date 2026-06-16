import path from "path";
import sharp from "sharp";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({});

// Extensions allowed for input validation
const ALLOWED_EXTENSIONS = ['.jpeg', '.png', '.webp', '.gif', '.avif', '.tiff', '.svg'];

export async function sharpStreamingToS3(fileBuffer: Buffer, originalName: string, s3Bucket: string, s3Key: string): Promise<void> {
    const ext = path.extname(originalName).toLowerCase();

    // Runtime validation #1: Check file extension is valid
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error('Unsupported file extension!');
    }

    // Processing the original data into a compressed web block for main image
    const mainImageBuffer = await sharp(fileBuffer)
        .resize(600, 600, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();

    // Creates the thumbnail buffer
    const thumbImageBuffer = await sharp(fileBuffer)
        .resize(150, 150, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

    // key designed for thumbnail upload to keep the paths unique
    const thumbnailKey = s3Key.replace('.webp', '-thumb.webp')

    try {
        const mainImageUpload = new Upload({
            client: s3Client,
            params: {
                Bucket: s3Bucket,
                Key: s3Key,
                Body: mainImageBuffer,
                ContentType: "image/webp"
            },
            queueSize: 4,
            partSize: 5 * 1024 * 1024
        });

        const thumbnailUpload = new Upload({
            client: s3Client,
            params: {
                Bucket: s3Bucket,
                Key: thumbnailKey,
                Body: thumbImageBuffer,
                ContentType: "image/webp"
            },
        });

        await Promise.all([mainImageUpload.done(), thumbnailUpload.done()])
    }
    catch (err) {
        console.log('Failed to process or upload image to S3:', err);
        throw err;
    }

}