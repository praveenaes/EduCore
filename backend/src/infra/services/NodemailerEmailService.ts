import { injectable } from "inversify";
import nodemailer from "nodemailer";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { ENV } from "@/config/env.config";

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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">EduCore Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 4px; color: #1f2937;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code is valid for 1 minute. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">EduCore School Management System</p>
        </div>
      `,
    };

    await this._transporter.sendMail(mailOptions);
  }

  async sendEmailChangeOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: '"EduCore Admin" <no-reply@educore.com>',
      to: email,
      subject: "Educore Email Change OTP",
      text: `Your email change OTP is: ${otp}. It is valid for 1 minute.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">EduCore Email Change</h2>
          <p>Hello,</p>
          <p>We received a request to change your email address. Please use the following One-Time Password (OTP) to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 4px; color: #1f2937;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code is valid for 1 minute. If you did not request to change your email, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">EduCore School Management System</p>
        </div>
      `,
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
    const mailOptions = {
      from: '"EduCore Admin" <no-reply@educore.com>',
      to,
      subject: `Welcome to ${orgName} — Your Account Credentials`,
      text: `Welcome to ${orgName}!\n\nAn account has been created for you. Please use the following details to log in:\n\nUsername/Email: ${identifier}\nTemporary Password: ${tempPassword}\n\nFor security reasons, you will be forced to change your password upon your first login.\n\nPortal link: ${ENV.CLIENT_URL || "http://localhost:5173"}\n\nBest regards,\n${orgName} Administration`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Welcome to ${orgName}</h2>
          <p>Hello,</p>
          <p>An account has been created for you. Please use the following credentials to log in to the portal:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-weight: bold; width: 120px;">Username/Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-family: monospace;">${identifier}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-weight: bold;">Password:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; font-family: monospace;">${tempPassword}</td>
            </tr>
          </table>
          <p>For security reasons, you will be asked to change your password upon your first login.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ENV.CLIENT_URL || "http://localhost:5173"}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Login Portal</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">EduCore School Management System</p>
        </div>
      `,
    };

    await this._transporter.sendMail(mailOptions);
  }
}
