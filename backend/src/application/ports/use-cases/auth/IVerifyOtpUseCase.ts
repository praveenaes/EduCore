export interface IVerifyOtp {
  execute(email: string, otp: string): Promise<string>;
}
