import type { Request, Response } from "express";
import { groupes } from "../database/groupe.ts";
import { eq } from "drizzle-orm";
import { db } from '../config/database.ts';
import { users } from "../database/user.ts";


export const getGroupes = async (req: Request, res: Response) => {
  const allGroupes = await db.select().from(groupes);
  res.json(allGroupes);
};

export const createGroupe = async (req: Request, res: Response) => {
  try {
    const { groupeName, level_id } = req.body;
    const newGroupe = await db.insert(groupes).values({ groupeName, level_id });
    res.status(201).json({ message: "Groupe créé avec succès", data: newGroupe });
  } catch (error) {
    console.error("Erreur création groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du groupe" });
  }
};

export const updateGroupe = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { groupeName, level_id } = req.body;
  await db.update(groupes).set({ groupeName, level_id }).where(eq(groupes.id, Number(id)));
  res.json({ message: "Groupe a mise à jour" });
};

export const deleteGroupe = async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.delete(groupes).where(eq(groupes.id, Number(id)));
  res.json({ message: "Groupe supprimée" });
};

export const getGroupeMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupeId = Number(id);
    if (isNaN(groupeId)) {
      res.status(400).json({ message: "Identifiant de groupe invalide" });
      return;
    }
    // Vérifier si le groupe existe
    const [groupe] = await db.select().from(groupes).where(eq(groupes.id, groupeId));
    if (!groupe) {
      res.status(404).json({ message: "Groupe non trouvé" });
      return;
    }
    // Récupérer les utilisateurs liés à ce groupe
    const members = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        groupeId: users.groupeId, // ✅ colonne correcte
      })
      .from(users)
      .where(eq(users.groupeId, groupeId));
    res.json({
      groupe,
      membres: members,
      count: members.length,
    });
  } catch (error) {
    console.error("Erreur récupération membres groupe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des membres" });
  }
};

// export const getClassSchedule = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { classId } = req.params;
//     const { startDate, endDate } = req.query;

//     // ✅ Validation de l'identifiant
//     const groupeId = Number(classId);
//     if (isNaN(groupeId)) {
//       res.status(400).json({ message: "Identifiant de groupe invalide." });
//       return;
//     }

//     // ✅ Vérifie si le groupe existe
//     const [groupe] = await db.select().from(groupes).where(eq(groupes.id, groupeId));
//     if (!groupe) {
//       res.status(404).json({ message: "Groupe non trouvé." });
//       return;
//     }

//     // ✅ Récupère les séances entre les deux dates
//     const schedule = await db
//       .select({
//         id: sessions.id,
//         subject: sessions.subject,
//         startTime: sessions.startTime,
//         endTime: sessions.endTime,
//         room: sessions.room,
//       })
//       .from(sessions)
//       .where(
//         and(
//           eq(sessions.groupeId, groupeId),
//           gte(sessions.startTime, start),
//           lte(sessions.endTime, end)
//         )
//       );

//     // ✅ Réponse propre et détaillée
//     res.json({
//       groupe,
//       periode: { startDate: start.toISOString(), endDate: end.toISOString() },
//       totalSessions: schedule.length,
//       sessions: schedule,
//     });
//   } catch (error) {
//     console.error("Erreur récupération l'emploi du groupe:", error);
//     res.status(500).json({ "Erreur serveur lors de la récupération de l'emploi du temps." });
//   }
// };