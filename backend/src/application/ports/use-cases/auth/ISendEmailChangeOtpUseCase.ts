export interface ISendEmailChangeOtp {
  execute(userId: string): Promise<void>;
}
