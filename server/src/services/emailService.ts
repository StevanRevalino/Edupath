import nodemailer from "nodemailer";
import { TransportOptions } from "nodemailer";
import { google } from "googleapis";

export class EmailService {
  // Private method to refresh access token

  // Private method to create transporter with OAuth2 and auto-refresh
  private async createTransporter() {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", 
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_APP_PASSWORD,
        },
      } as TransportOptions);

      return transporter;
    } catch (error) {
      console.error("❌ Error creating transporter:", error);
      throw new Error("Failed to create email transporter");
    }
  }

  async sendOtpEmail(email: string, otp: string) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `EduPath <${process.env.MAIL_USERNAME}>`,
        to: email,
        subject: "Reset Password - OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">EduPath</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Reset Password Request</h2>
            <p style="color: #475569; line-height: 1.6;">
              Hi there! We received a request to reset your password. 
              Please use the OTP code below to verify your email:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-bottom: 0;">
              ⚠️ This OTP will expire in 30 seconds for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #94a3b8;">
            <p>If you didn't request this, please ignore this email.</p>
            <p>&copy; 2025 EduPath. All rights reserved.</p>
          </div>
        </div>
      `,
        text: `
        EduPath - Reset Password Request
        
        Hi there! We received a request to reset your password.
        Please use the OTP code below to verify your email:
        
        OTP Code: ${otp}
        
        ⚠️ This OTP will expire in 30 seconds for security reasons.
        
        If you didn't request this, please ignore this email.
        
        © 2025 EduPath. All rights reserved.
      `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendVerificationOtpEmail(email: string, otp: string) {
    try {
      const transporter = await this.createTransporter();

      const mailOptions = {
        from: `EduPath <${process.env.MAIL_USERNAME}>`,
        to: email,
        subject: "Email Verification - OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6CCBFF; margin: 0;">EduPath</h1>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Email Verification</h2>
            <p style="color: #475569; line-height: 1.6;">
              Welcome to EduPath! Please verify your email address to complete your registration.
              Use the OTP code below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #6CCBFF; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-bottom: 0;">
              ⚠️ This OTP will expire in 30 seconds for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #94a3b8;">
            <p>If you didn't create an account, please ignore this email.</p>
            <p>&copy; 2025 EduPath. All rights reserved.</p>
          </div>
        </div>
      `,
        text: `
        EduPath - Email Verification
        
        Welcome to EduPath! Please verify your email address to complete your registration.
        Use the OTP code below:
        
        OTP Code: ${otp}
        
        ⚠️ This OTP will expire in 30 seconds for security reasons.
        
        If you didn't create an account, please ignore this email.
        
        © 2025 EduPath. All rights reserved.
      `,
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}

// Export singleton instance for backwards compatibility
export const emailService = new EmailService();
export const sendOtpEmail = emailService.sendOtpEmail.bind(emailService);
export const sendVerificationOtpEmail =
  emailService.sendVerificationOtpEmail.bind(emailService);
