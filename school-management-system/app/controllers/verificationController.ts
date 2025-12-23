import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { eq } from "drizzle-orm";
import { users } from "../database/user.ts";
import dotenv from 'dotenv';
import { db } from '../config/database.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.purpose !== 'email_verification') {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const userCheck = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, decoded.id));

    res.status(200).json({
      message: "Email verified successfully!",
      verified: true
    });

  } catch (error) {
    console.error("Email verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: "Verification link has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    return res.status(500).json({ error: "Email verification failed" });
  }
}