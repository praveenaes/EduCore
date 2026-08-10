export interface ILogoutUser {
  execute(refreshToken: string, expiresAt: Date): Promise<void>;
}
