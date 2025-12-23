import { type Request, type Response } from 'express';
import { attendanceLists } from '../database/attendanceList.ts'; // ton instance drizzle
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, ilike, and, sql } from 'drizzle-orm';
import { db } from '../config/database.ts';






// Créer une nouvelle présence
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { name, eventId } = req.body;

    if (!name || !eventId) {
      return res.status(400).json({
        message: "Le nom et l'ID de l'événement sont obligatoires.",
      });
    }

    const [newAttendance] = await db
      .insert(attendanceLists)
      .values({ name, eventId })
      .returning();

    res.status(201).json(newAttendance);
  } catch (error: any) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({ message: "Erreur lors de la création de la présence." });
  }
};

// Récupérer toutes les présences
// export const getAllAttendances = async (_req: Request, res: Response) => {
//   try {
//     const attendances = await db.select().from(attendanceLists);
//     res.status(200).json(attendances);
//   } catch (error: any) {
//     console.error("Erreur lors de la récupération :", error);
//     res.status(500).json({ message: "Erreur lors de la récupération des présences." });
//   }
// };

// Récupérer une présence par ID
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [attendance] = await db
      .select()
      .from(attendanceLists)
      .where(eq(attendanceLists.id, Number(id)));

    if (!attendance) {
      return res.status(404).json({ message: "Présence non trouvée." });
    }

    res.status(200).json(attendance);
  } catch (error: any) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur lors de la récupération de la présence." });
  }
};

// Mettre à jour une présence
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, eventId } = req.body;

    const [updated] = await db
      .update(attendanceLists)
      .set({ name, eventId })
      .where(eq(attendanceLists.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Présence non trouvée." });
    }

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la présence." });
  }
};

// Supprimer une présence
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(attendanceLists)
      .where(eq(attendanceLists.id, Number(id)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Présence non trouvée." });
    }

    res.status(200).json({ message: "Présence supprimée avec succès." });
  } catch (error: any) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la présence." });
  }
};



//fonction de filtrage des listes

export const filterAttendenceList = async (req: Request, res: Response) => {
  try {
    const { name,eventId} = req.query;

    // On construit les conditions dynamiquement
    const conditions = [];

    if (name) {
      conditions.push(ilike(attendanceLists.name, `%${name}%`));
    }

    if (eventId) {
      conditions.push(eq(attendanceLists.eventId, Number(eventId)));
    }


    // Si aucun filtre → renvoyer tous les listes
    const query = conditions.length > 0
      ? db.select().from(attendanceLists).where(and(...conditions))
      : db.select().from(attendanceLists);

    const result = await query;

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erreur de filtrage :", error);
    res.status(500).json({ message: "Erreur lors du filtrage des listes." });
  }
};