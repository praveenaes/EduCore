import { User } from "../../../domain/entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  savePasswordResetOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
  saveEmailChangeOtp(email: string, otp: string, expiresAt: Date): Promise<void>;
  clearEmailChangeOtp(email: string): Promise<void>;
  updatePassword(email: string, passwordHash: string): Promise<void>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
