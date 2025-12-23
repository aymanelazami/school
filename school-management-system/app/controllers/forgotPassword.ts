import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { users } from '../database/user.ts';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.json({
        message: 'If this email exists, a password reset link has been sent'
      });
    }

    const foundUser = user[0];
    if (!foundUser) {
      return res.json({
        message: 'If this email exists, a password reset link has been sent'
      });
    }

    const resetToken = jwt.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
        purpose: 'password_reset'
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Send email logic here...

    res.json({
      resetPasswordToken: resetToken,
      message: 'If this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};