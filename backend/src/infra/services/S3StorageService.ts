import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";
import { IStorageService, PresignedUploadResult } from "../../application/ports/services/IStorageService";
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

  private _extractKey(fileUrlOrKey: string): string {
    if (fileUrlOrKey.includes(".amazonaws.com/")) {
      return fileUrlOrKey.split(".amazonaws.com/")[1];
    }
    return fileUrlOrKey;
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
    const bucket = ENV.AWS_S3_BUCKET || "dummy-bucket";
    const key = this._extractKey(fileUrl);
    if (!key) return;

    await this._s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }

  async getSignedViewUrl(fileUrlOrKey: string, expiresInSeconds: number = 3600): Promise<string> {
    const bucket = ENV.AWS_S3_BUCKET || "dummy-bucket";
    const key = this._extractKey(fileUrlOrKey);
    if (!key) return fileUrlOrKey;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(this._s3Client, command, { expiresIn: expiresInSeconds });
  }

  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string,
    expiresInSeconds: number = 300
  ): Promise<PresignedUploadResult> {
    const bucket = ENV.AWS_S3_BUCKET || "dummy-bucket";
    const sanitizedFileName = fileName.replace(/\s+/g, "_");
    const key = `${folder}/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this._s3Client, command, { expiresIn: expiresInSeconds });
    const fileUrl = `https://${bucket}.s3.${ENV.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return { uploadUrl, key, fileUrl };
  }
}
