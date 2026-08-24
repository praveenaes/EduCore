import { injectable } from "inversify";
import nodemailer from "nodemailer";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { ENV } from "@/config/env.config";
import { EmailTemplates } from "./EmailTemplates";

@injectable()
export class NodemailerEmailService implements IEmailService {
  private _transporter: nodemailer.Transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: Number(ENV.SMTP_PORT),
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: '"EduCore Admin" <no-reply@educore.com>',
      to: email,
      subject: "Educore Admin Password Reset OTP",
      text: `Your password reset OTP is: ${otp}. It is valid for 1 minute.`,
      html: EmailTemplates.getPasswordResetOtpHtml(otp),
    };

    await this._transporter.sendMail(mailOptions);
  }

  async sendEmailChangeOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: '"EduCore Admin" <no-reply@educore.com>',
      to: email,
      subject: "Educore Email Change OTP",
      text: `Your email change OTP is: ${otp}. It is valid for 1 minute.`,
      html: EmailTemplates.getEmailChangeOtpHtml(otp),
    };

    await this._transporter.sendMail(mailOptions);
  }

  async sendWelcome(
    to: string,
    identifier: string,
    tempPassword: string,
    organizationName?: string
  ): Promise<void> {
    const orgName = organizationName || "EduCore";
    const clientUrl = ENV.CLIENT_URL || "http://localhost:5173";
    const mailOptions = {
      from: '"EduCore Admin" <no-reply@educore.com>',
      to,
      subject: `Welcome to ${orgName} — Your Account Credentials`,
      text: `Welcome to ${orgName}!\n\nAn account has been created for you. Please use the following details to log in:\n\nUsername/Email: ${identifier}\nTemporary Password: ${tempPassword}\n\nFor security reasons, you will be forced to change your password upon your first login.\n\nPortal link: ${clientUrl}\n\nBest regards,\n${orgName} Administration`,
      html: EmailTemplates.getWelcomeHtml(identifier, tempPassword, orgName, clientUrl),
    };

    await this._transporter.sendMail(mailOptions);
  }
}
