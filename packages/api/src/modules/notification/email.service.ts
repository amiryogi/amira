import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import type { SendEmailDTO } from './notification.dto.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export class EmailService {
  async sendEmail(dto: SendEmailDTO): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"Amira Nepal" <${config.smtp.fromEmail}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
      });
      logger.info({ to: dto.to, subject: dto.subject }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, to: dto.to, subject: dto.subject }, 'Failed to send email');
      return false;
    }
  }

  // ─── Email Templates ───

  welcomeEmail(name: string): { subject: string; html: string } {
    return {
      subject: 'Welcome to Amira Nepal!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">Welcome to Amira Nepal, ${name}!</h1>
          <p>Thank you for joining us. Explore our collection of authentic Nepali woolen products.</p>
          <p>Happy shopping!</p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }

  orderConfirmationEmail(orderId: string, totalAmount: number): { subject: string; html: string } {
    return {
      subject: `Order Confirmed — #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">Order Confirmed!</h1>
          <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
          <p><strong>Total:</strong> NPR ${totalAmount.toLocaleString()}</p>
          <p>We'll keep you updated on your order status.</p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }

  orderStatusEmail(orderId: string, status: string): { subject: string; html: string } {
    return {
      subject: `Order Update — #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">Order Status Update</h1>
          <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status}</strong></p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }

  paymentSuccessEmail(orderId: string, amount: number): { subject: string; html: string } {
    return {
      subject: `Payment Successful — Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745;">Payment Successful!</h1>
          <p>Your payment of <strong>NPR ${amount.toLocaleString()}</strong> for order <strong>#${orderId}</strong> has been received.</p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }

  paymentFailedEmail(orderId: string): { subject: string; html: string } {
    return {
      subject: `Payment Failed — Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc3545;">Payment Failed</h1>
          <p>Your payment for order <strong>#${orderId}</strong> could not be processed.</p>
          <p>Please try again or choose a different payment method.</p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }

  passwordResetEmail(resetUrl: string): { subject: string; html: string } {
    return {
      subject: 'Password Reset — Amira Nepal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513;">Password Reset</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          <p style="color: #666; font-size: 12px;">— The Amira Nepal Team</p>
        </div>
      `,
    };
  }
}
