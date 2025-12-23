import type { Request, Response } from "express";
import { filieres } from "../database/filiere.ts";
import { eq } from "drizzle-orm";
import { db } from '../config/database.ts';
import { modules } from "../database/module.ts";


export const getFiliere = async (req: Request, res: Response) => {
  const allFiliere = await db.select().from(filieres);
  res.json(allFiliere);
};

export const createFiliere = async (req: Request, res: Response) => {
  try {
    const {name,description} = req.body;
    const newFiliere = await db.insert(filieres).values({name,description});
    res.status(201).json({ message: "Filiere créé avec succès", data: newFiliere });
  } catch (error) {
    console.error("Erreur création filiere:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du filiere" });
  }
};

export const updateFiliere= async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name,description,isActive} = req.body;
  await db.update(filieres).set({name,description,isActive}).where(eq(filieres.id, Number(id)));
  res.json({ message: "Filiere  a mise à jour" });
};

export const deleteFiliere = async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.delete(filieres).where(eq(filieres.id, Number(id)));
  res.json({ message: "Filiere supprimée" });
};

export const getFiliereModules = async (req: Request, res: Response) => {
  try {
    const { filiereId } = req.params;
    const id = Number(filiereId);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Identifiant de filière invalide." });
    }

    // Vérifier que la filière existe
    const [filiere] = await db.select().from(filieres).where(eq(filieres.id, id));
    if (!filiere) {
      return res.status(404).json({ message: "Filière non trouvée." });
    }

    // Récupérer les modules associés à cette filière
    const filiereModules = await db
      .select()
      .from(modules)
      .where(eq(modules.filiereId, id));

    res.status(200).json({
      message: "Modules de la filière récupérés avec succès",
      data: filiereModules,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des modules de la filière:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des modules." });
  }
};