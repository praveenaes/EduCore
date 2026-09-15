export interface IVerifyEmailChangeOtp {
  execute(userId: string, otp: string): Promise<string>;
}
