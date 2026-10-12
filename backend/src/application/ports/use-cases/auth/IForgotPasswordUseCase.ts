import { UserRole } from "@/domain/enums/UserRole";
 
export interface IForgotPassword {
  execute(email: string, role?: UserRole): Promise<void>;
}
