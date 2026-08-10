import { injectable } from "inversify";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { BlacklistedTokenModel } from "../db/models/BlacklistedTokenModel";

@injectable()
export class MongoTokenBlacklistService implements ITokenBlacklistService {
  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    await BlacklistedTokenModel.create({
      token,
      expiresAt,
    }).catch((err) => {
      if (err.code !== 11000) throw err;
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const doc = await BlacklistedTokenModel.findOne({ token }).lean();
    return !!doc;
  }
}
