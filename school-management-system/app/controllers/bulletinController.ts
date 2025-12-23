import type { Request, Response } from "express";
import { db } from '../config/database.ts';
import { modules } from "../database/module.ts";
import { grades } from "../database/grade.ts";
import { eq } from "drizzle-orm";

export const calculerBulletin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const id = Number(userId);
    if (isNaN(id)) {
      return res.status(400).json({ message: "userId invalide" });
    }
    const allNotes = await db.select().from(grades).where(eq(grades.studentID, id));
    if (allNotes.length === 0) {
      return res.status(404).json({ message: "Aucune note trouvée pour cet étudiant." });
    }
    const modulesIds = [...new Set(allNotes.map((n) => n.moduleId))];
    let totalMoyenneModules = 0;
    let nombreModules = 0;
    const resultatsModules: any[] = [];

    for (const moduleId of modulesIds) {
      const moduleNotes = allNotes.filter((n) => n.moduleId === moduleId);
      const moduleInfo = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
      const moduleData = moduleInfo[0];
      if (!moduleData) continue;

      const sommeNotes = moduleNotes.reduce((acc, n) => acc + Number(n.grade), 0);
      const moyenne = sommeNotes / moduleNotes.length;
      const resultat = 20 / moduleData.credits;
      const MoyenneModule = moyenne / resultat;
      const etat = MoyenneModule >= moduleData.creditRequired ? "Validé" : "Rattrapage";

      resultatsModules.push({
        module: moduleData.title,
        moyenne,
        MoyenneModule,
        etat,
      });

      totalMoyenneModules += MoyenneModule;
      nombreModules++;
    }

    const MoyenneGenerale = totalMoyenneModules / nombreModules;
    const decision = MoyenneGenerale > 30 ? "Admis" : "Redoublement";

    return res.json({
      etudiant: id,
      resultatsModules,
      MoyenneGenerale,
      decision,
    });

  } catch (error) {
    console.error("Erreur lors du calcul du bulletin:", error);
    res.status(500).json({ error: "Erreur lors du calcul du bulletin" });
  }
};
