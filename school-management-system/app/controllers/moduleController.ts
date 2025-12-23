import { type Request, type Response } from 'express';
import { db } from '../config/database.ts';
import { eq, ilike, and, sql, gte, lte } from 'drizzle-orm';
import { modules } from '../database/module.ts';
import { grades } from "../database/grade.ts";
import { sessions } from "../database/session.ts"



// Créer un nouvel Module
export const createModule = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const { title, description, credits, creditRequired, niveauId, filiereId } = req.body;

        if (!title || !description || !credits || !creditRequired || !niveauId || !filiereId) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }
        const [newModule] = await db
            .insert(modules)
            .values({ title, description, credits, creditRequired, niveauId, filiereId })
            .returning();
        res.status(201).json(newModule);
    } catch (error: any) {
        console.error('Erreur création module :', error);
        res.status(500).json({ message: 'Erreur lors de la création du module.' });
    }
};


// Mettre à jour un module
export const updateModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, credits, creditRequired, niveauId, filiereId } = req.body;

        const [updatedEvent] = await db
            .update(modules)
            .set({ title, description, credits, creditRequired, niveauId, filiereId })
            .where(eq(modules.id, Number(id)))
            .returning();

        if (!updateModule) {
            return res.status(404).json({ message: 'Module non trouvé.' });
        }

        res.status(200).json(updatedEvent);
    } catch (error: any) {
        console.error('Erreur mise à jour Module:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour d'un module." });
    }
};

// Récupérer un seul Module
export const getModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [module] = await db
            .select()
            .from(modules)
            .where(eq(modules.id, Number(id)));

        if (!module) {
            return res.status(404).json({ message: 'Module non trouvé.' });
        }

        res.status(200).json(module);
    } catch (error: any) {
        console.error('Erreur récupération Module :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du module.' });
    }
};


// Récupérer tous les modules
export const getAllModules = async (_req: Request, res: Response) => {
    try {
        const allModules = await db.select().from(modules);
        res.status(200).json(allModules);
    } catch (error: any) {
        console.error('Erreur récupération modules :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des modules.' });
    }
};


// Supprimer un module
export const deleteModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(modules)
            .where(eq(modules.id, Number(id)))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ message: 'Module non trouvé.' });
        }

        res.status(200).json({ message: 'Module supprimé avec succès.' });
    } catch (error: any) {
        console.error('Erreur suppression Module :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de Module.' });
    }
};

export const getModuleSchedule = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const { startDate, endDate } = req.query;


        if (!moduleId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Paramètres manquants : moduleId, startDate et endDate sont requis.",
            });
        }

        const id = Number(moduleId);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Identifiant du module invalide." });
        }

        if (!moduleId || !startDate || !endDate) {
            return res.status(400).json({
                message: "Paramètres manquants : moduleId, startDate et endDate sont requis.",
            });
        }

        // Parse date strings to proper format
        const start = String(startDate);
        const end = String(endDate);

        const moduleSessions = await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.moduleId, id),
                    gte(sessions.date, start),
                    lte(sessions.date, end)
                )
            )
            .orderBy(sessions.date);

        if (moduleSessions.length === 0) {
            return res.status(404).json({
                message: "Aucune séance trouvée pour ce module durant cette période.",
            });
        }

        return res.status(200).json({
            moduleId: id,
            totalSessions: moduleSessions.length,
            sessions: moduleSessions,
        });
    } catch (error) {
        console.error("Erreur dans getModuleSchedule:", error);
        return res.status(500).json({
            message: "Erreur interne du serveur.",
            error: (error as Error).message,
        });
    }
};

//fonction de filtrage des modules
export const filterModules = async (req: Request, res: Response) => {
    try {
        const { title, credits, creditRequired, niveauId } = req.query;

        // On construit les conditions dynamiquement
        const conditions = [];

        if (title) {
            conditions.push(ilike(modules.title, `%${title}%`));
        }

        if (credits) {
            conditions.push(eq(modules.credits, Number(credits)));
        }

        if (creditRequired) {
            conditions.push(eq(modules.creditRequired, Number(creditRequired)));
        }
        if (niveauId) {
            conditions.push(eq(modules.niveauId, Number(niveauId)));
        }



        // Si aucun filtre → renvoyer tous les modules
        const query = conditions.length > 0
            ? db.select().from(modules).where(and(...conditions))
            : db.select().from(modules);

        const result = await query;

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Erreur de filtrage :", error);
        res.status(500).json({ message: "Erreur lors du filtrage des modules." });
    }
};
