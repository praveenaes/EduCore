import { User } from "@/domain/entities/User";

export interface IResetPassword {
  execute(email: string, passwordHex: string, resetToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }>;
}
