import nodemailer from "nodemailer";
import { createLogger } from "../utils/logger";

const logger = createLogger("EmailService");

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    logger.info(`Initialized SMTP email transporter for host: ${host}`);
  } else {
    logger.warn("No SMTP credentials found in environment. Initializing local fallback transporter.");
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal_test@example.com",
        pass: "ethereal_password",
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }: EmailOptions): Promise<boolean> => {
  const from = process.env.EMAIL_FROM || '"EduMind AI" <support@edumind.ai>';
  try {
    const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    if (!isConfigured && process.env.NODE_ENV !== "production") {
      logger.info(`[DEV EMAIL NOTIFICATION] To: ${to} | Subject: ${subject}`);
      return true;
    }

    const transport = await getTransporter();
    const info = await transport.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });

    logger.info(`Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to deliver email to ${to}: ${error.message}`, error);
    return false;
  }
};

// Base HTML Wrapper for Branded SAAS Emails
const emailLayout = (title: string, content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08111F; color: #E2E8F0; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; color: #CBD5E1; line-height: 1.6; font-size: 15px; }
    .button-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.3); }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #1E293B; background: #0B1120; }
    .code-box { background: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; color: #38BDF8; word-break: break-all; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧠 EduMind AI</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated security notification from EduMind AI. Please do not reply directly to this email.</p>
      <p>© ${new Date().getFullYear()} EduMind AI Platform. Developed with precision by Devender & Harsh Roy.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (
  to: string,
  name: string,
  verificationUrl: string
): Promise<boolean> => {
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Verify Your Email Address</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Welcome to <strong>EduMind AI</strong>! Please confirm your email address by clicking the verification button below to activate all AI study superpowers and secure your account.</p>
    
    <div class="button-container">
      <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
    </div>

    <p>Or paste this verification link into your browser:</p>
    <div class="code-box">${verificationUrl}</div>

    <p style="font-size: 13px; color: #94A3B8;">This verification link will expire in <strong>24 hours</strong>. If you did not create an account on EduMind AI, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject: "Verify your email address - EduMind AI",
    html: emailLayout("Verify Your Email - EduMind AI", content),
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<boolean> => {
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Reset Your Password</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your EduMind AI account. Click the button below to establish a new strong password:</p>
    
    <div class="button-container">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>

    <p>Or copy this link to your browser:</p>
    <div class="code-box">${resetUrl}</div>

    <p style="font-size: 13px; color: #EF4444; font-weight: 600;">⚠️ This link expires in 15 minutes for your security.</p>
    <p style="font-size: 13px; color: #94A3B8;">If you did not request a password reset, please change your credentials immediately or contact security support.</p>
  `;

  return sendEmail({
    to,
    subject: "Password Reset Request - EduMind AI",
    html: emailLayout("Reset Password - EduMind AI", content),
  });
};

export const sendPasswordChangedConfirmation = async (
  to: string,
  name: string
): Promise<boolean> => {
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Password Successfully Updated</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>The password for your EduMind AI account was successfully updated on <strong>${new Date().toUTCString()}</strong>.</p>
    <p>If you made this change, no further action is required.</p>
    <p style="font-size: 13px; color: #EF4444; font-weight: 600;">If you did NOT make this change, please immediately reset your password and terminate all active sessions.</p>
  `;

  return sendEmail({
    to,
    subject: "Security Alert: Password Changed - EduMind AI",
    html: emailLayout("Password Updated - EduMind AI", content),
  });
};

export const sendSecurityAlertEmail = async (
  to: string,
  name: string,
  details: { ip: string; browser: string; os: string; device: string; time: string }
): Promise<boolean> => {
  const content = `
    <h2 style="color: #FFFFFF; margin-top: 0;">New Device Login Detected</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your EduMind AI account was just accessed from a new device or IP address:</p>
    
    <div class="code-box">
      <strong>Time:</strong> ${details.time}<br>
      <strong>Device:</strong> ${details.device} (${details.browser} on ${details.os})<br>
      <strong>IP Address:</strong> ${details.ip}
    </div>

    <p style="font-size: 13px; color: #94A3B8;">If this was you, you can ignore this email. If this wasn't you, revoke all active sessions immediately from your account security settings.</p>
  `;

  return sendEmail({
    to,
    subject: "New Login Detected - EduMind AI",
    html: emailLayout("New Login Detected - EduMind AI", content),
  });
};
