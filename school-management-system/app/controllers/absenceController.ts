import type { Request, Response } from "express";
import { db } from "../config/database.ts";
import { absences, isValidStatus, AbsenceStatus } from "../database/absence.ts";
import { users } from "../database/user.ts";
import { eq } from "drizzle-orm";
import { modules } from "../database/module.ts";

export const getStudentsByGroup = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);
    if (isNaN(groupId)) return res.status(400).json({ message: "ID de groupe invalide" });

    const students = await db
      .select()
      .from(users)
      .where(eq(users.groupeId, groupId));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAbsenceById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // ✅ Jointure explicite et claire
    const result = await db
      .select({
        id: absences.id,
        status: absences.status,
        justification: absences.justification,
        createdAt: absences.created_at,
        updatedAt: absences.updated_at,
        studentId: absences.student_id,
        teacherId: absences.teacher_id,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
      })
      .from(absences)
      .leftJoin(users, eq(users.id, absences.student_id))
      .where(eq(absences.id, id));

    if (result.length === 0) {
      return res.status(404).json({ message: "Absence non trouvée" });
    }

    res.json({
      message: "Absence trouvée",
      data: result[0],
    });
  } catch (err: any) {
    console.error("Erreur getAbsenceById:", err);
    res.status(500).json({ message: err.message || "Erreur serveur" });
  }
};

export const updateAbsence = async (req: Request, res: Response) => {
  try {
    const { absenceId } = req.params;
    const { status, justification } = req.body;

    if (!status && !justification)
      return res.status(400).json({ message: "Rien à mettre à jour" });

    if (status && !isValidStatus(status)) {
      return res.status(400).json({ message: `Status invalide. Statuts valides: ${Object.values(AbsenceStatus).join(", ")}` });
    }

    const id = Number(absenceId);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    await db
      .update(absences)
      .set({
        ...(status && { status }),
        ...(justification && { justification }),
      })
      .where(eq(absences.id, id));

    res.json({ message: "Absence mise à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createAbsences = async (req: Request, res: Response) => {
  try {
    const { groupId, teacherId, sessionId, statuses } = req.body;

    if (!groupId || !teacherId || !sessionId || !Array.isArray(statuses)) {
      return res.status(400).json({ message: "Données manquantes ou incorrectes (groupId, teacherId, sessionId, statuses requis)" });
    }

    // Récupérer les étudiants du groupe
    const students = await db
      .select()
      .from(users)
      .where(eq(users.groupeId, groupId));

    if (students.length === 0) {
      return res.status(400).json({ message: "Aucun étudiant trouvé dans ce groupe." });
    }

    // Préparer les données d'absence
    const absencesData = students.map(student => {
      const statusObj = statuses.find(s => s.studentId === student.id);
      const status = statusObj?.status || AbsenceStatus.PRESENT;

      if (!isValidStatus(status)) {
        throw new Error(
          `Status invalide pour l'étudiant ${student.id} : ${status}. Statuts valides: ${Object.values(AbsenceStatus).join(", ")}`
        );
      }

      return {
        student_id: student.id,
        teacher_id: teacherId,
        session_id: sessionId,
        status,
        justification: statusObj?.justification || null,
      };
    });

    // Vérifier que le tableau n'est pas vide avant insertion
    if (absencesData.length === 0) {
      return res.status(400).json({ message: "Aucune absence à enregistrer." });
    }

    // Insérer les absences
    await db.insert(absences).values(absencesData);

    res.json({ message: "Absences enregistrées avec succès", data: absencesData });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message || "Erreur serveur" });
  }
};

export const getAbsenceCountByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const id = Number(studentId);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    const results = await db
      .select({
        programId: users.programId,
        status: absences.status,
      })
      .from(absences)
      .innerJoin(users, eq(absences.student_id, users.id))
      .where(eq(users.id, id));

    const counts: { [key: number]: { present: number; absent: number; retard: number } } = {};
    results.forEach(r => {
      if (r.programId === null) return; // Skip entries with null programId
      const programId = r.programId;
      if (!(programId in counts)) {
        counts[programId] = { present: 0, absent: 0, retard: 0 };
      }
      const record = counts[programId];
      if (!record) return;
      const statusKey = r.status as keyof typeof record;
      if (statusKey === 'present' || statusKey === 'absent' || statusKey === 'retard') {
        record[statusKey]++;
      }
    });

    res.json({ studentId: id, counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
