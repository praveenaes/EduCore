import { User } from "@/domain/entities/User";

export interface IGetMe {
  execute(userId: string): Promise<User>;
}
