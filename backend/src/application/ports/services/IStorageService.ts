export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
