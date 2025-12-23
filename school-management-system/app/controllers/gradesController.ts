import { type Request, type Response } from 'express';
import { grades} from '../database/grade.ts'; // ton instance drizzle
import { db } from '../config/database.ts';
import { eq,and } from 'drizzle-orm';


// Créer une nouvelle note 
export const createGrade = async (req: Request, res: Response) => {
    
    try {
        const {grade, teacherID, seanceID,moduleId,studentID} = req.body;
      
        if (!grade || !teacherID || !moduleId || !seanceID || !studentID) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }
    
        const [newGrade] = await db
            .insert(grades)
            .values({ grade, teacherID, seanceID, moduleId,studentID})
            .returning();
        res.status(201).json(newGrade);
    } catch (error: any) {
        console.error('Erreur création de la note :', error);
        res.status(500).json({ message: 'Erreur lors de la création de la note.' });
    }
};


// Mettre à jour une note
export const updateGrade = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { grade, teacherID,moduleId,seanceID, studentID } = req.body;

        const [updatedGrade] = await db
            .update(grades)
            .set({ grade, teacherID,moduleId, seanceID, studentID })
            .where(eq(grades.id, Number(id)))
            .returning();

        if (!updatedGrade) {
            return res.status(404).json({ message: 'note non trouvé.' });
        }

        res.status(200).json(updatedGrade);
    } catch (error: any) {
        console.error('Erreur mise à jour du note :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la note.' });
    }
};


// Récupérer une seule note 
export const getGrade = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [grade] = await db
            .select()
            .from(grades)
            .where(eq(grades.id, Number(id)));

        if (!grade) {
            return res.status(404).json({ message: 'Note non trouvé.' });
        }

        res.status(200).json(grade);
    } catch (error: any) {
        console.error('Erreur récupération note :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la note.' });
    }
};




// Récupérer tous les notes 
export const getAllGrades = async (_req: Request, res: Response) => {
    try {
        const allGrades = await db.select().from(grades);
        res.status(200).json(allGrades);
    } catch (error: any) {
        console.error("Erreur récupération notes :", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notes.' });
    }
};


// Supprimer une note 
export const deleteGrade = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(grades)
            .where(eq(grades.id, Number(id)))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ message: 'Note non trouvé.' });
        }

        res.status(200).json({ message: 'Note supprimée avec succès.' });
    } catch (error: any) {
        console.error('Erreur suppression note :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la note.' });
    }
};

export const getStudentGrades = async (req: Request, res: Response) => {
  const { studentID } = req.params;
  const result = await db.select().from(grades).where(eq(grades.studentID, Number(studentID)));
  res.json(result);
};

export const getStudentAverage = async (req: Request, res: Response) => {
  try {
    const { studentID } = req.params;

    const notes = await db
      .select({ grade: grades.grade })
      .from(grades)
      .where(eq(grades.studentID, Number(studentID)));

    if (notes.length === 0) {
      return res.json({ moyenne: 0, message: "Aucune note disponible pour cet étudiant" });
    }

    const moyenne =
      notes.reduce((sum, row) => sum + parseFloat(row.grade), 0) / notes.length;

    res.json({
      studentID,
      moyenne: moyenne.toFixed(2),
    });
  } catch (error) {
    console.error("Erreur lors du calcul de la moyenne:", error);
    res.status(500).json({ error: "Erreur serveur lors du calcul de la moyenne" });
  }
};

export const getModuleGrades = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    
    if (!moduleId || isNaN(Number(moduleId))) {
      return res.status(400).json({
        error: "Le paramètre 'moduleId' est invalide ou manquant",
      });
    }

    const result = await db
      .select()
      .from(grades)
      .where(eq(grades.moduleId, Number(moduleId)));

    if (result.length === 0) {
      return res.status(404).json({
        message: `Aucune note trouvée pour le module ${moduleId}`,
      });
    }

    res.json({
      moduleId,
      total: result.length,
      notes: result,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notes du module:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des notes du module",
    });
  }
};