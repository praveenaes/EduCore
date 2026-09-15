import { injectable } from "inversify";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel, IUserDocument } from "./models/UserModel";
import { UserMapper } from "../../application/mappers/UserMapper";
import { BaseMongoRepository } from "./BaseMongoRepository";

@injectable()
export class MongoUserRepository 
  extends BaseMongoRepository<User, IUserDocument> 
  implements IUserRepository 
{
  protected readonly _model = UserModel;
  protected readonly _mapper = UserMapper;

  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email });
    if (!document) return null;

    return UserMapper.toDomain(document);
  }

  async savePasswordResetOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        passwordResetOtp: otp,
        passwordResetOtpExpiresAt: expiresAt,
      }
    );
  }

  async saveEmailChangeOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        emailChangeOtp: otp,
        emailChangeOtpExpiresAt: expiresAt,
      }
    );
  }

  async clearEmailChangeOtp(email: string): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        $unset: { emailChangeOtp: 1, emailChangeOtpExpiresAt: 1 }
      }
    );
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        password: passwordHash,
        $unset: { passwordResetOtp: 1, passwordResetOtpExpiresAt: 1 }
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
