import { and, eq, gte, lte } from "drizzle-orm";
import { sessions } from "../database/session.ts";
import { db } from "../config/database.ts";

export const checkTeacherAvailability = async (teacherId: number,startDateTime: Date,endDateTime: Date): Promise<boolean> => {
  const teacherConflicts = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.teacherId, teacherId),
        lte(sessions.startDateTime, endDateTime),
        gte(sessions.endDateTime, startDateTime)
        )
    )
    // If no conflicting sessions exist, teacher is available
  return teacherConflicts.length === 0;
};