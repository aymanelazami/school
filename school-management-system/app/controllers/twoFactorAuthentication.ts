import type { Request, Response, NextFunction } from "express";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { eq } from "drizzle-orm";
import { users } from "../database/user.ts";
import { roles } from '../database/role.ts';
import jwt from 'jsonwebtoken';
import { transporter, create2FAEmailConfig } from "../utilities/emailVerification.ts";
import { db } from '../config/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export async function disable2FA(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;

    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: "2FA has been disabled"
    });

  } catch (error) {
    console.error("2FA disable error:", error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
}

export async function verify2FALogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // @ts-ignore
    if (req.session.twoFactorVerified) {
      return res.status(400).json({ error: "2FA already verified" });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, (req.user as any).id));

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ error: "User data not found" });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }

    let isValidToken = false;

    isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!isValidToken && user.twoFactorBackupCodes) {
      try {
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        const tokenIndex = backupCodes.indexOf(token.toUpperCase());

        if (tokenIndex !== -1) {
          backupCodes.splice(tokenIndex, 1);
          await db
            .update(users)
            .set({
              twoFactorBackupCodes: JSON.stringify(backupCodes)
            })
            .where(eq(users.id, user.id));

          isValidToken = true;
        }
      } catch (parseError) {
        console.error('Error parsing backup codes:', parseError);
      }
    }

    if (!isValidToken) {
      return res.status(400).json({ error: "Invalid 2FA token" });
    }

    // @ts-ignore
    req.session.twoFactorVerified = true;

    const tokenPayload = {
      id: (req.user as any).id,
      email: (req.user as any).email,
      roleId: (req.user as any).roleId,
      role: (req.user as any).role,
      permissions: (req.user as any).permissions
    };

    const finalToken = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      message: "2FA verification successful",
      token: `Bearer ${finalToken}`,
      user: req.user
    });

  } catch (error) {
    console.error("2FA login verification error:", error);
    res.status(500).json({ error: "Failed to verify 2FA token" });
  }
}

export async function check2FAStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;

    const userResult = await db
      .select({
        twoFactorEnabled: users.twoFactorEnabled
      })
      .from(users)
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userResult[0];
    if (!userData) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json({
      twoFactorEnabled: userData.twoFactorEnabled
    });

  } catch (error) {
    console.error("2FA status check error:", error);
    res.status(500).json({ error: "Failed to check 2FA status" });
  }
}

export async function generate2FASecret(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userName = (req as any).user.firstName;

    const userWithRole = await db
      .select({
        firstName: users.firstName,
        roleName: roles.name
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    const userRole = userWithRole[0]?.roleName || 'User';

    const secret = speakeasy.generateSecret({
      name: `School Management System (${userEmail})`,
      issuer: "School Management System"
    });

    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 12).toUpperCase()
    );

    await db
      .update(users)
      .set({
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: JSON.stringify(backupCodes)
      })
      .where(eq(users.id, userId));

    let qrCodeDataUrl = '';
    try {
      if (secret.otpauth_url) {
        qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
      } else {
        console.error('❌ No otpauth_url generated by speakeasy');
      }
    } catch (qrError) {
      console.error('❌ Failed to generate QR code:', qrError);
    }

    try {
      const emailConfig = create2FAEmailConfig(
        userEmail,
        secret.base32,
        backupCodes,
        userName,
        qrCodeDataUrl
      );
      await transporter.sendMail(emailConfig);
    } catch (emailError) {
      console.error('❌ Failed to send 2FA setup email:', emailError);
      return res.status(500).json({ error: "Failed to send 2FA setup email" });
    }

    res.json({
      success: true,
      message: "2FA setup instructions have been sent to your email. Please check your inbox and follow the instructions to complete the setup.",
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      hasQRCode: !!qrCodeDataUrl
    });

  } catch (error) {
    console.error("❌ 2FA secret generation error:", error);
    res.status(500).json({ error: "Failed to generate 2FA secret" });
  }
}

export async function verify2FASetup(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const userId = (req as any).user.id;

    const userResult = await db
      .select({
        twoFactorSecret: users.twoFactorSecret
      })
      .from(users)
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ error: "User data not found" });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not set up for this user" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid 2FA token" });
    }

    await db
      .update(users)
      .set({
        twoFactorEnabled: true
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: "2FA has been successfully enabled"
    });

  } catch (error) {
    console.error("2FA verification error:", error);
    res.status(500).json({ error: "Failed to verify 2FA setup" });
  }
}