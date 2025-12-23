import { type Request, type Response } from 'express';
import { roles } from '../database/role.ts'; // ton instance drizzle
import { db } from '../config/database.ts';
import { eq } from 'drizzle-orm';



// Créer un nouveau role
export const createRole = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }
        
        const [newRole] = await db
            .insert(roles)
            .values({ name })
            .returning();
        res.status(201).json(newRole);
    } catch (error: any) {
        console.error('Erreur création role :', error);
        res.status(500).json({ message: 'Erreur lors de la création de role.' });
    }
};



// Mettre à jour un role
export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const [updatedRole] = await db
            .update(roles)
            .set({ name})
            .where(eq(roles.id, Number(id)))
            .returning();

        if (!updatedRole) {
            return res.status(404).json({ message: 'role non trouvé.' });
        }

        res.status(200).json(updatedRole);
    } catch (error: any) {
        console.error('Erreur mise à jour role :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de role.' });
    }
};


// Récupérer un seul role
export const getRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [role] = await db
            .select()
            .from(roles)
            .where(eq(roles.id, Number(id)));

        if (!role) {
            return res.status(404).json({ message: 'Role non trouvé.' });
        }

        res.status(200).json(role);
    } catch (error: any) {
        console.error('Erreur récupération du role :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du role.' });
    }
};

// Récupérer tous les roles
export const getAllRoles = async (_req: Request, res: Response) => {
    try {
        const allRoles = await db.select().from(roles);
        res.status(200).json(allRoles);
    } catch (error: any) {
        console.error('Erreur récupération roles:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des roles.' });
    }
};




// Supprimer un role
export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(roles)
            .where(eq(roles.id, Number(id)))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ message: 'Role non trouvé.' });
        }

        res.status(200).json({ message: 'Role supprimé avec succès.' });
    } catch (error: any) {
        console.error('Erreur suppression du role :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du role.' });
    }
};