import { type Request, type Response } from 'express';
import { db } from '../config/database.ts';
import { eq, ilike, and, sql } from 'drizzle-orm';
import {rooms} from '../database/room.ts';


// Créer une nouvelle salle 
export const createRoom = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const { roomNumber, capacity, roomType, facility, isAvailable } = req.body;

        if (!roomNumber || !capacity || !roomType || !facility || !isAvailable) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }
        const [newRoom] = await db
            .insert(rooms)
            .values({ roomNumber, capacity, roomType, facility, isAvailable })
            .returning();
        res.status(201).json(newRoom);
    } catch (error: any) {
        console.error('Erreur création room :', error);
        res.status(500).json({ message: 'Erreur lors de la création du room.' });
    }
};
// Mettre à jour d'une salle 
export const updateRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roomNumber, capacity, roomType, facility, isAvailable } = req.body;

        const [updatedRoom] = await db
            .update(rooms)
            .set({ roomNumber, capacity, roomType, facility, isAvailable })
            .where(eq(rooms.id, Number(id)))
            .returning();

        if (!updateRoom) {
            return res.status(404).json({ message: 'Module non trouvé.' });
        }

        res.status(200).json(updatedRoom);
    } catch (error: any) {
        console.error('Erreur mise à jour Room:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour d'une salle " });
    }
};
// Récupérer une seule salle
export const getRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [room] = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, Number(id)));

        if (!room) {
            return res.status(404).json({ message: 'Salle non trouvé.' });
        }

        res.status(200).json(room);
    } catch (error: any) {
        console.error('Erreur récupération du salle  :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du la salle.' });
    }
};
// Récupérer tous les salles
export const getAllRooms = async (_req: Request, res: Response) => {
    try {
        const allRooms = await db.select().from(rooms);
        res.status(200).json(allRooms);
    } catch (error: any) {
        console.error('Erreur récupération des salles :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des salles.' });
    }
};
// Supprimer une salle
export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(rooms)
            .where(eq(rooms.id, Number(id)))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ message: 'salle non trouvé.' });
        }

        res.status(200).json({ message: 'salle supprimé avec succès.' });
    } catch (error: any) {
        console.error('Erreur suppression du salle :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du salle .' });
    }
};


//fonction de filtrage des salles

export const filterRooms = async (req: Request, res: Response) => {
    try {
        const { roomNumber, capacity, roomType, facility, isAvailable } = req.query;

        // On construit les conditions dynamiquement
        const conditions = [];

        if (roomNumber) {
            conditions.push(ilike(rooms.roomNumber, `%${roomNumber}%`));
        }

        if (capacity) {
            conditions.push(eq(rooms.capacity, Number(capacity)));
        }

        if (roomType) {
            conditions.push(ilike(rooms.roomType, `%${roomType}%`));
        }

        if (facility) {
            conditions.push(ilike(rooms.facility, `%${facility}%`));
        }

        if (isAvailable) {
            conditions.push(ilike(rooms.isAvailable, `%${facility}%`));
        }
        if (isAvailable !== undefined) {
            // On convertit la valeur string ("true"/"false") en booléen réel
            const available = isAvailable === 'true';
            conditions.push(eq(rooms.isAvailable, available));
        }

        // Si aucun filtre → renvoyer tous les salles
        const query = conditions.length > 0
            ? db.select().from(rooms).where(and(...conditions))
            : db.select().from(rooms);

        const result = await query;

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Erreur de filtrage :", error);
        res.status(500).json({ message: "Erreur lors du filtrage des salles." });
    }
};