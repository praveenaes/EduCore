export interface ITokenBlacklistService {
  addToBlacklist(token: string, expiresAt: Date): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}
