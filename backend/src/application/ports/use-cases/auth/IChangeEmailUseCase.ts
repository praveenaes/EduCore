export interface ChangeEmailDTO {
  newEmail?: string;
  confirmNewEmail?: string;
  emailChangeToken?: string;
}

export interface IChangeEmail {
  execute(userId: string, data: ChangeEmailDTO): Promise<void>;
}
