import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../database/user.ts";
import dotenv from "dotenv";
import { db } from '../config/database.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, decoded.id));

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    res.status(500).json({ error: "Password reset failed" });
  }
};