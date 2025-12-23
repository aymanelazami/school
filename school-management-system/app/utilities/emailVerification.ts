import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.APP_PORT || 3400;
const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_UER,
        pass: process.env.MAIL_PASS
    }
});
    
export const createEmailConfig = (email: string, token: string) => ({
    from: 'no-replay@gmail.com',
    to: email,
    subject: 'Email Verification',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hi there!</p>
            <p>You have recently visited our website and entered your email.</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="http://localhost:${port}/auth/verify/${token}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
            </a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <br>
            <p>Thanks,<br>Your App Team</p>
        </div>
    `
});

export const create2FAEmailConfig = (
  email: string, 
  secret: string, 
  backupCodes: string[],
  userName: string = 'User',
  qrCodeDataUrl: string = '' 
) => ({
  from: 'no-reply@gmail.com',
  to: email,
  subject: 'Two-Factor Authentication (2FA) Setup Instructions',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 10px;">Enable Two-Factor Authentication</h2>
        <p style="color: #666;">Secure your account with an extra layer of protection</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-bottom: 15px;">Hello ${userName},</h3>
        <p style="color: #555; line-height: 1.6;">
          You've requested to enable Two-Factor Authentication (2FA) for your account. 
          This adds an extra layer of security to protect your account.
        </p>
      </div>

      ${qrCodeDataUrl ? `
      <div style="text-align: center; margin-bottom: 25px;">
        <h4 style="color: #333; margin-bottom: 15px;">📱 Scan QR Code (Recommended)</h4>
        <p style="color: #555; margin-bottom: 15px;">
          Open your authenticator app and scan this QR code:
        </p>
        <img src="${qrCodeDataUrl}" 
             alt="QR Code for 2FA Setup" 
             style="max-width: 200px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; background: white;" />
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          Can't scan? Use the manual setup method below.
        </p>
      </div>
      ` : `
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #856404; margin: 0;">
          <strong>Note:</strong> QR code could not be generated. Please use the manual setup method below.
        </p>
      </div>
      `}

      <div style="margin-bottom: 25px;">
        <h4 style="color: #333; margin-bottom: 15px;">🔑 Manual Setup</h4>
        <p style="color: #555; margin-bottom: 10px;">
          Enter this secret key manually in your authenticator app:
        </p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
          <strong style="font-size: 18px; color: #856404; font-family: monospace; letter-spacing: 1px; word-break: break-all;">${secret}</strong>
        </div>
        
        <p style="color: #666; font-size: 14px; font-style: italic;">
          🔒 Keep this secret key secure and don't share it with anyone.
        </p>
      </div>

      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: #2d5016; margin-bottom: 10px;">✅ Next Steps:</h4>
        <p style="color: #2d5016; margin: 5px 0;">
          1. Scan the QR code or enter the secret key in your authenticator app<br>
          2. You'll see a 6-digit code that changes every 30 seconds<br>
          3. Return to the app/website and enter the current 6-digit code to verify
        </p>
      </div>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          If you didn't request to enable 2FA, please contact support immediately.<br>
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </div>
  `
});

// Email for when 2FA is successfully enabled
export const create2FAEnabledEmailConfig = (email: string, userName: string = 'User') => ({
  from: 'no-reply@gmail.com',
  to: email,
  subject: 'Two-Factor Authentication Enabled Successfully',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #27ae60; text-align: center;">2FA Enabled Successfully! 🎉</h2>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #2d5016; margin: 0;">
          Hello ${userName},<br><br>
          Two-Factor Authentication has been successfully enabled for your account. 
          Your account is now more secure!
        </p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px;">
        <p style="color: #856404; margin: 0;">
          <strong>Remember:</strong> You'll need to enter a code from your authenticator app every time you log in.
        </p>
      </div>
    </div>
  `
});