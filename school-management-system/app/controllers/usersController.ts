import type { Request, Response } from "express";
import { users } from "../database/user.ts";
import { eq, and, ne } from "drizzle-orm";
import { db } from '../config/database.ts';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { transporter, createEmailConfig } from "../utilities/emailVerification.ts";


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export const getProfile = async (req: Request, res: Response) => {
  const allInfo = await db.select().from(users);
  res.json(allInfo);
};


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      birthDate,
      email,
      phoneNumber,
      address,
      zipCode,
      cityId,
    } = req.body;

    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Identifiant invalide." });
    }

    // Changement d'email
    if (email && email !== users.email) {
      // Vérifier si l'email existe déjà
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, userId)));

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ message: "Cet email est déjà utilisé par un autre compte." });
      }

      //Générer un token de vérification (valide 10 min)
      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "10m" });

      //Envoyer le mail de vérification
      const mailOptions = createEmailConfig(email, token);
      await transporter.sendMail(mailOptions);
      return res.json({
        message:
          "Un e-mail de vérification a été envoyé à la nouvelle adresse. Veuillez la confirmer avant de l’activer.",
      });
    }

    //Continuation de la mise à jour 
    await db
      .update(users)
      .set({
        firstName,
        lastName,
        birthDate,
        phoneNumber,
        address,
        zipCode,
        cityId,
      })
      .where(eq(users.id, userId));

    res.json({ message: "Informations du profil mises à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Identifiant invalide." });
    }
    // Check if user exists and get their status
    const existingUser = await db.select().from(users).where(eq(users.id, userId));

    if (existingUser.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    //  Vérifier si l'utilisateur est déjà inactif
    if (existingUser[0]?.isActive === false) {
      return res.status(400).json({ message: "L'utilisateur est déjà désactivé." });
    }

    // Désactiver le compte 
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return res.json({ message: "Utilisateur désactivé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la désactivation du user:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};