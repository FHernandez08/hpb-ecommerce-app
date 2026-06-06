import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { validatedAWSSchema } from "../config/aws.config";

class S3Service {
    private readonly s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({ region: validatedAWSSchema.AWS_REGION });
    }

    async uploadStream(key: string, stream: any){
        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket: validatedAWSSchema.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: stream,
            }
        });

        await upload.done();
    }

    async deleteObject(key:string) {
        const input = {
            Bucket: validatedAWSSchema.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(input);
        const response = await this.s3Client.send(command);
    }
}