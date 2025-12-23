import type { Request, Response } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from '../config/database.ts';
import { niveaux } from "../database/niveau.ts";
import { groupes } from "../database/groupe.ts";
import { modules } from "../database/module.ts";

/**
 * 📌 Ajouter un nouveau niveau
 */
export const createNiveau = async (req: Request, res: Response) => {
  try {
    const { name, programId, academicYear, creditsRequired } = req.body;
    const newNiveau = await db.insert(niveaux).values({ name, programId, academicYear, creditsRequired });
    res.status(201).json({ message: "Niveau créé avec succès", data: newNiveau });
  } catch (error) {
    console.error("Erreur création niveau:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du niveau" });
  }
};


/**
 * 📌 Récupérer tous les niveaux
 */
export const getAllNiveaux = async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(niveaux);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur récupération niveaux:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des niveaux" });
  }
};

/**
 * 📌 Mettre à jour un niveau
 */
export const updateNiveau = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, programId, academicYear, creditsRequired } = req.body;

    const [existingNiveau] = await db.select().from(niveaux).where(eq(niveaux.id, Number(id)));

    if (!existingNiveau) {
      return res.status(404).json({ message: "Niveau non trouvé" });
    }

    const [updated] = await db
      .update(niveaux)
      .set({ name, programId, academicYear, creditsRequired })
      .where(eq(niveaux.id, Number(id)))
      .returning();

    res.status(200).json({ message: "Niveau mis à jour avec succès", data: updated });
  } catch (error) {
    console.error("Erreur mise à jour niveau:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du niveau" });
  }
};

/**
 * 📌 Supprimer un niveau
 */
export const deleteNiveau = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existingNiveau] = await db.select().from(niveaux).where(eq(niveaux.id, Number(id)));

    if (!existingNiveau) {
      return res.status(404).json({ message: "Niveau non trouvé" });
    }

    await db.delete(niveaux).where(eq(niveaux.id, Number(id)));
    res.status(200).json({ message: "Niveau supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression niveau:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du niveau" });
  }
};

// export const getLevelSchedule = async (req: Request, res: Response) => {
//   try {
//     const { levelId } = req.params;
//     const { startDate, endDate } = req.query;

//     const id = Number(levelId);
//     if (isNaN(id)) {
//       return res.status(400).json({ message: "Identifiant de niveau invalide" });
//     }

//     // Vérifier si le niveau existe
//     const [niveau] = await db.select().from(niveaux).where(eq(niveaux.id, id));
//     if (!niveau) {
//       return res.status(404).json({ message: "Niveau non trouvé" });
//     }

//     // Trouver toutes les classes associées à ce niveau
//     const relatedGroupes = await db
//       .select({ id: groupes.id })
//       .from(groupes)
//       .where(eq(groupes.level_id, id));

//     const GroupeIds = relatedGroupes.map((c) => c.id);
//     if (GroupeIds.length === 0) {
//       return res.status(200).json({ message: "Aucune séance trouvée pour ce niveau", data: [] });
//     }

//     // Récupérer les séances liées à ces classes dans la période donnée
//     const sessions = await db
//       .select()
//       .from(seances)
//       .where(
//         and(
//           inArray(seances.class_id, GroupeIds),
//           gte(seances.date, new Date(startDate as string)),
//           lte(seances.date, new Date(endDate as string))
//         )
//       );

//     res.status(200).json({ message: "Séances récupérées avec succès", data: sessions });
//   } catch (error) {
//     console.error("Erreur récupération des séances du niveau:", error);
//     res.status(500).json({ message: "Erreur serveur lors de la récupération du planning du niveau" });
//   }
// };

export const getLevelModules = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const levelId = Number(id);

    if (isNaN(levelId)) {
      return res.status(400).json({ message: "Identifiant de niveau invalide." });
    }

    // Vérifier si le niveau existe
    const [niveau] = await db.select().from(niveaux).where(eq(niveaux.id, levelId));
    if (!niveau) {
      return res.status(404).json({ message: "Niveau non trouvé." });
    }

    // Récupérer les modules liés à ce niveau
    const result = await db.select().from(modules).where(eq(modules.niveauId, levelId));

    res.status(200).json({
      message: "Modules du niveau récupérés avec succès.",
      data: result,
    });
  } catch (error) {
    console.error("Erreur récupération modules du niveau:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des modules du niveau.",
    });
  }
};