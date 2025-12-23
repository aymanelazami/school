import type { Request, Response, NextFunction } from "express";
import { hash } from 'bcryptjs';
import { users } from "../database/user.ts";
import { eq } from "drizzle-orm";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createEmailConfig, transporter } from "../utilities/emailVerification.ts";
import { db } from '../config/database.ts';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      firstName,
      lastName,
      email,
      birthDate,
      phoneNumber,
      address,
      zipCode,
      password,
      groupeId,
      cityId
    } = req.body;

    const mailCheck = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (mailCheck.length > 0) {
      return res.status(409).json({ error: "This email is already in use" });
    }

    const hashPassword = await hash(password, 6);

    const newUser = {
      firstName,
      lastName,
      email,
      birthDate: typeof birthDate === 'string' ? birthDate : birthDate.toISOString().split('T')[0],
      phoneNumber,
      address,
      zipCode,
      password: hashPassword,
      groupeId: groupeId ? Number(groupeId) : undefined,
      cityId: cityId ? Number(cityId) : undefined,
      roleId: 1,
    };

    const result = await db.insert(users).values(newUser).returning();
    const user = result[0];

    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const authToken = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    const emailVerificationToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        purpose: 'email_verification'
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    try {
      const emailConfig = createEmailConfig(user.email, emailVerificationToken);
      await transporter.sendMail(emailConfig);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: "User registered successfully. Please check your email for verification.",
      token: `Bearer ${authToken}`,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}