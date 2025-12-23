import { and, eq, gte, lte, or } from 'drizzle-orm';
import { db } from '../config/database.ts';
import {sessions} from '../database/session.ts';

export const checkAvailabilityRoom = async(roomId: number,startDateTime: Date,endDateTime: Date): Promise<boolean> =>{

    const roomConflicts = await db.select()
                                        .from(sessions)
                                        .where(
                                            and(
                                                eq(sessions.roomId, roomId),
                                                lte(sessions.startDateTime, endDateTime),
                                                gte(sessions.endDateTime, startDateTime)
                                            )

                                        );
    return roomConflicts.length === 0;
    
}