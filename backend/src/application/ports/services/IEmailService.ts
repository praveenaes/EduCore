export interface IEmailService {
  sendPasswordResetOtp(email: string, otp: string): Promise<void>;
  sendEmailChangeOtp(email: string, otp: string): Promise<void>;
  sendWelcome(
    to: string,
    identifier: string,
    tempPassword: string,
    organizationName?: string
  ): Promise<void>;
}
