import { User } from "@/domain/entities/User";
import { UserRole } from "@/domain/enums/UserRole";

export interface IResetPassword {
  execute(email: string, passwordHex: string, resetToken: string, role?: UserRole): Promise<{ accessToken: string; refreshToken: string; user: User }>;
}
