import { UserRole } from "@/domain/enums/UserRole";
 
export interface IVerifyOtp {
  execute(email: string, otp: string, role?: UserRole): Promise<string>;
}
