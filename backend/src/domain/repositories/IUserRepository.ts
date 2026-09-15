import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  savePasswordResetOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
  saveEmailChangeOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
  clearEmailChangeOtp(email: string): Promise<void>;
  updatePassword(email: string, passwordHash: string): Promise<void>;
  delete(id: string): Promise<boolean>;
}
