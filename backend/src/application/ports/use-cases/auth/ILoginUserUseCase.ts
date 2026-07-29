import { LoginUserResponseDTO } from "@/application/dto/auth/authDtos";

export interface ILoginUser {
  execute(email: string, password: string, role: string): Promise<LoginUserResponseDTO>;
}
