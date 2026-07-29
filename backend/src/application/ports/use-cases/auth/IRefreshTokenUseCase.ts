export interface IRefreshToken {
  execute(refreshToken: string): Promise<string>;
}
