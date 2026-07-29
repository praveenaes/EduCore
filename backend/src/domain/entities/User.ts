import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public readonly id?: string,
    public readonly email?: string,
    public readonly password?: string,
    public readonly role?: UserRole,
    public readonly name?: string,
    public readonly passwordResetOtp?: string,
    public readonly passwordResetOtpExpiresAt?: Date,
    public readonly emailChangeOtp?: string,
    public readonly emailChangeOtpExpiresAt?: Date,
    public readonly photo?: string
  ) {}
}
