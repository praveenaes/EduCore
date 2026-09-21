export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getSignedViewUrl(fileUrlOrKey: string, expiresInSeconds?: number): Promise<string>;
  getPresignedUploadUrl(fileName: string, mimeType: string, folder: string, expiresInSeconds?: number): Promise<PresignedUploadResult>;
}
