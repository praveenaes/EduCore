import { UserRole } from "../enums/UserRole";

export interface UserProps {
  id?: string;//when creating a new user id dont exist,mongo creates it
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  passwordResetOtp?: string;
  passwordResetOtpExpiresAt?: Date;
  emailChangeOtp?: string;
  emailChangeOtpExpiresAt?: Date;
  photo?: string;
}

//domain entity
export class User {
  private _props: UserProps;

  constructor(props: UserProps) {
    this._props = { ...props };//We store it in this._props mainly because the User object needs to keep its own data after the constructor finishes.
  }

  // Getters
  get id(): string | undefined {
    return this._props.id;//gets id by writing user.id
  }

  get email(): string | undefined {
    return this._props.email;
  }

  get password(): string | undefined {
    return this._props.password;
  }

  get role(): UserRole | undefined {
    return this._props.role;
  }

  get name(): string | undefined {
    return this._props.name;
  }

  get passwordResetOtp(): string | undefined {
    return this._props.passwordResetOtp;
  }

  get passwordResetOtpExpiresAt(): Date | undefined {
    return this._props.passwordResetOtpExpiresAt;
  }

  get emailChangeOtp(): string | undefined {
    return this._props.emailChangeOtp;
  }

  get emailChangeOtpExpiresAt(): Date | undefined {
    return this._props.emailChangeOtpExpiresAt;
  }

  get photo(): string | undefined {
    return this._props.photo;
  }

  // entity related Business Methods
  verifyRole(role: string): void {
    if (this._props.role?.toLowerCase() !== role.toLowerCase()) {
      throw new Error("Access denied: role mismatch");
    }
  }

  generatePasswordResetOtp(): void {
    this._props.passwordResetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this._props.passwordResetOtpExpiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiration
  }

  resetPassword(newHash: string, token: string): void {
    this.verifyPasswordResetOtp(token);
    this._props.password = newHash;
    this._props.passwordResetOtp = undefined;
    this._props.passwordResetOtpExpiresAt = undefined;
  }

  changePassword(newHash: string): void {
    this._props.password = newHash;
    this._props.passwordResetOtp = undefined;
    this._props.passwordResetOtpExpiresAt = undefined;
  }

  changeEmail(newEmail: string): void {
    if (!newEmail.includes("@")) {
      throw new Error("Invalid email format");
    }
    this._props.email = newEmail;
  }

  generateEmailChangeOtp(): void {
    this._props.emailChangeOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this._props.emailChangeOtpExpiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiration
  }

  verifyPasswordResetOtp(otp: string): void {
    if (this._props.passwordResetOtp !== otp) {
      throw new Error("Invalid OTP");
    }
    if (this._props.passwordResetOtpExpiresAt && this._props.passwordResetOtpExpiresAt < new Date()) {
      throw new Error("Expired OTP");
    }
  }

  verifyAndClearEmailChangeOtp(otp: string): void {
    if (!this._props.emailChangeOtp || this._props.emailChangeOtp !== otp) {
      throw new Error("Invalid OTP");
    }
    if (this._props.emailChangeOtpExpiresAt && this._props.emailChangeOtpExpiresAt < new Date()) {
      this._props.emailChangeOtp = undefined;
      this._props.emailChangeOtpExpiresAt = undefined;
      throw new Error("Expired OTP");
    }
    this._props.emailChangeOtp = undefined;
    this._props.emailChangeOtpExpiresAt = undefined;
  }

  static createNew(props: Pick<UserProps, "name" | "email" | "password" | "role">): User {
    if (props.email && !props.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    return new User({
      ...props,
    });
  }
}

// here using a private property called _props that can be only changed from inside
// from outside only can read the values
// and to change email we can only use the methods inside like user.changeEmail(...)
//that is encapsulation