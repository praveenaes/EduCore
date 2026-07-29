import { UserRole } from "@/domain/enums/UserRole";

export interface LoginUserResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    photo?: string;
  };
}
