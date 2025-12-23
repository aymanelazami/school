import type { Request, Response } from 'express';
import { db } from '../config/database.ts';
import { opportunities } from '../database/opportunite.ts';
import { eq,desc} from 'drizzle-orm';

// 📌 Lister toutes les opportunités
export const listOpportunities = async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(opportunities).orderBy(desc(opportunities.created_at));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📌 Récupérer une opportunité par ID
export const getOpportunity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const row = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    if (!row || row.length === 0)
      return res.status(404).json({ message: 'Opportunité introuvable' });
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📌 Créer une nouvelle opportunité
export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Vérification manuelle du type (stage ou offre d'emploi)
    if (payload.type !== 'stage' && payload.type !== "offre d'emploi") {
      return res.status(400).json({
        message: "Le type doit être soit 'stage' soit 'offre d'emploi'.",
      });
    }

    const insert = await db
      .insert(opportunities)
      .values({
        title: payload.title,
        type: payload.type,
        description: payload.description ?? null,
        company: payload.company ?? null,
        location: payload.location ?? null,
        profile: payload.profile ?? null,
      })
      .returning();

    res.status(201).json(insert[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur création opportunité' });
  }
};

// 📌 Mettre à jour une opportunité
export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;

    // Vérification manuelle du type
    if (payload.type !== 'stage' && payload.type !== "offre d'emploi") {
      return res.status(400).json({
        message: "Le type doit être soit 'stage' soit 'offre d'emploi'.",
      });
    }

    const result = await db
      .update(opportunities)
      .set({
        title: payload.title,
        type: payload.type,
        description: payload.description ?? null,
        company: payload.company ?? null,
        location: payload.location ?? null,
        profile: payload.profile ?? null,
      })
      .where(eq(opportunities.id, id))
      .returning();

    if (!result || result.length === 0)
      return res.status(404).json({ message: 'Opportunité introuvable' });

    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour' });
  }
};

// 📌 Supprimer une opportunité
export const deleteOpportunity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await db.delete(opportunities).where(eq(opportunities.id, id)).returning();
    if (!result || result.length === 0)
      return res.status(404).json({ message: 'Opportunité introuvable' });
    res.json({ message: 'Supprimé avec succès', item: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur suppression' });
  }
};
