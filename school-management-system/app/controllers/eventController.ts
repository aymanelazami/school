import { type Request, type Response } from 'express';
import { events } from '../database/event.ts'; // ton instance drizzle
import { db } from '../config/database.ts';
import { eq, ilike, and, sql } from 'drizzle-orm';




// Créer un nouvel événement
export const createEvent = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const { name, type, date, startTime, endTime, roomId } = req.body;
        console.log("13");

        if (!name || !type || !date || !startTime || !endTime) {
            console.log("16");
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
        }
        console.log("17");
        const [newEvent] = await db
            .insert(events)
            .values({ name, type, date, startTime, endTime, roomId })
            .returning();
        console.log("25")
        res.status(201).json(newEvent);
    } catch (error: any) {
        console.error('Erreur création événement :', error);
        res.status(500).json({ message: 'Erreur lors de la création de l’événement.' });
    }
};

// Mettre à jour un événement
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, type, date, startTime, endTime, roomId } = req.body;

        const [updatedEvent] = await db
            .update(events)
            .set({ name, type, date, startTime, endTime, roomId })
            .where(eq(events.id, Number(id)))
            .returning();

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        res.status(200).json(updatedEvent);
    } catch (error: any) {
        console.error('Erreur mise à jour événement :', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l’événement.' });
    }
};

// Récupérer un seul événement
export const getEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [event] = await db
            .select()
            .from(events)
            .where(eq(events.id, Number(id)));

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        res.status(200).json(event);
    } catch (error: any) {
        console.error('Erreur récupération événement :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l’événement.' });
    }
};

// Récupérer tous les événements
// export const getAllEvents = async (_req: Request, res: Response) => {
//     try {
//         const allEvents = await db.select().from(events);
//         res.status(200).json(allEvents);
//     } catch (error: any) {
//         console.error('Erreur récupération événements :', error);
//         res.status(500).json({ message: 'Erreur lors de la récupération des événements.' });
//     }
// };

// Supprimer un événement
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(events)
            .where(eq(events.id, Number(id)))
            .returning();

        if (deleted.length === 0) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        res.status(200).json({ message: 'Événement supprimé avec succès.' });
    } catch (error: any) {
        console.error('Erreur suppression événement :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l’événement.' });
    }
};




//fonction de filtrage des evenements

export const filterEvents = async (req: Request, res: Response) => {
  try {
    const { name, type, date} = req.query;

    // On construit les conditions dynamiquement
    const conditions = [];

    if (name) {
      conditions.push(ilike(events.name, `%${name}%`));
    }

    if (type) {
      conditions.push(ilike(events.type, `%${type}%`));
    }

    if (date) {
      conditions.push(eq(events.date, date as string));
    }

    // Si aucun filtre → renvoyer tous les événements
    const query = conditions.length > 0
      ? db.select().from(events).where(and(...conditions))
      : db.select().from(events);

    const result = await query;

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erreur de filtrage :", error);
    res.status(500).json({ message: "Erreur lors du filtrage des événements." });
  }
};