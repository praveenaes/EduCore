export interface IUpdateMyProfilePhoto {
  execute(
    userId: string,
    role: string,
    removePhoto: boolean,
    file?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<{ photoPath: string }>;
}
