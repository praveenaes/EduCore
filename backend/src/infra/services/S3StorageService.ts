import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { injectable } from "inversify";
import { IStorageService } from "../../application/ports/services/IStorageService";
import { ENV } from "../../config/env.config";

@injectable()
export class S3StorageService implements IStorageService {
  private _s3Client: S3Client;

  constructor() {
    this._s3Client = new S3Client({
      region: ENV.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID || "dummy",
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY || "dummy",
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const bucket = ENV.AWS_S3_BUCKET || "dummy-bucket";
    
    await this._s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    return `https://${bucket}.s3.${ENV.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = ENV.AWS_S3_BUCKET 
    const urlParts = fileUrl.split(`.amazonaws.com/`);
    if (urlParts.length < 2) return;
    const key = urlParts[1];

    await this._s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }
}
