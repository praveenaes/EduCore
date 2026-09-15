export interface ChangePasswordDTO {
  oldPassword?: string;
  newPassword?: string;
}

export interface IChangePassword {
  execute(userId: string, data: ChangePasswordDTO): Promise<void>;
}
