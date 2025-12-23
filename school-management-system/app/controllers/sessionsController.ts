import type { Request, Response } from "express";
import { drizzle } from "drizzle-orm/node-postgres";
import { sessions } from "../database/session.ts";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { checkAvailabilityRoom } from "../utilities/roomAvailabilityUtility.ts";
import { checkTeacherAvailability } from "../utilities/checkTeacherAvailability.ts";
import { users } from "../database/user.ts";

dotenv.config();
const db = drizzle(process.env.DATABASE_URL!);

export const getSessions = async (_req: Request, res: Response) => {
  try {
    const allSessions = await db.select().from(sessions);
    res.status(200).json(allSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Cannot fetch sessions" });
  }
};
export const getSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, Number(sessionId)));
    if (!result.length) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Error fetching session" });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const {
      date,
      classId,
      teacherId,
      roomId,
      moduleId,
      startDateTime,
      endDateTime,
      sessionType,
    } = req.body;



    if (!date || !classId || !teacherId || !roomId || !moduleId || !startDateTime || !endDateTime || !sessionType) {
      return res.status(400).json({
        message: "All fields are required: date, classId, teacherId, roomId, moduleId, startDateTime, endDateTime, sessionType"
      });
    }

    // Ensure sessionType is valid
    if (!["normal", "exam"].includes(sessionType)) {
      return res.status(400).json({ message: `Invalid sessionType. Must be "normal" or "exam".` });
    }


    // Check room availability using your utility function
    const roomAvailability = await checkAvailabilityRoom(
      Number(roomId),
      new Date(startDateTime),
      new Date(endDateTime)
    );

    if (!roomAvailability) {
      return res.status(409).json({
        message: "Room is not available for the selected time range.",
      });
    }


    // Check teacher availability using your utility function
    const teacherAvailability = await checkTeacherAvailability(
      Number(roomId),
      new Date(startDateTime),
      new Date(endDateTime)
    );

    if (!teacherAvailability) {
      return res.status(409).json({
        message: "Teacher is not available during the selected time range.",
      });
    }


    // Prepare insert data with correct types
    const insertData = {
      date: new Date(date).toISOString().split('T')[0]!,
      groupeId: Number(classId),
      teacherId: Number(teacherId),
      roomId: Number(roomId),
      moduleId: Number(moduleId),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      sessionType: sessionType as "normal" | "exam",
    };

    // Insert into DB
    const [newSession] = await db
      .insert(sessions)
      .values(insertData)
      .returning();

    res.status(201).json({
      message: "Session created successfully",
      session: newSession,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Error creating session", error: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await db
      .delete(sessions)
      .where(eq(sessions.id, Number(sessionId)))
      .returning();

    if (!result.length) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Error deleting session" });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const {
      date,
      classId,
      teacherId,
      roomId,
      moduleId,
      startDateTime,
      endDateTime,
      sessionType,
    } = req.body;    //user wants to update

    // Check if session exists
    const existing = await db.select().from(sessions).where(eq(sessions.id, Number(sessionId)));

    if (!existing.length) {
      return res.status(404).json({ message: "Session not found." });
    }

    const existingSession = existing[0]!;

    // Final values to check  (new values sent by user or existing values stored in DB)
    const finalRoomId =
      roomId !== undefined && roomId !== null
        ? Number(roomId)
        : existingSession.roomId;

    const finalTeacherId =
      teacherId !== undefined && teacherId !== null
        ? Number(teacherId)
        : existingSession.teacherId;

    const finalStart = startDateTime
      ? new Date(startDateTime)
      : existingSession.startDateTime;

    const finalEnd = endDateTime
      ? new Date(endDateTime)
      : existingSession.endDateTime;

    // ROOM availability check
    if (roomId || startDateTime || endDateTime) {
      if (finalRoomId !== null) {
        const isRoomAvailable = await checkAvailabilityRoom(
          finalRoomId,
          finalStart,
          finalEnd
        );

        if (!isRoomAvailable) {
          return res.status(409).json({
            message: "Room is not available for the selected time range.",
          });
        }
      }
    }

    // TEACHER availability check
    if (teacherId || startDateTime || endDateTime) {
      if (finalTeacherId !== null) {
        const isTeacherAvailable = await checkTeacherAvailability(
          finalTeacherId,
          finalStart,
          finalEnd
        );

        if (!isTeacherAvailable) {
          return res.status(409).json({
            message: "Teacher is not available during the selected time range.",
          });
        }
      }
    }
    // Update session directly
    const [updatedSession] = await db
      .update(sessions)
      .set({
        date: date || existingSession.date,
        groupeId: classId ? Number(classId) : existingSession.groupeId,
        teacherId: finalTeacherId,
        roomId: finalRoomId,
        moduleId: moduleId ? Number(moduleId) : existingSession.moduleId,
        startDateTime: finalStart,
        endDateTime: finalEnd,
        sessionType: sessionType || existingSession.sessionType,
      })
      .where(eq(sessions.id, Number(sessionId)))
      .returning();

    res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      message: "Error updating session.",
      error: (error as Error).message,
    });
  }
};

export const getAttendanceSheet = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    //Check if the session exists
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, Number(sessionId)));

    if (!session.length) {
      return res.status(404).json({ message: "Session not found." });
    }

    const currentSession = session[0];

    // RoleId 3 is typically the student role - adjust based on your roles table
    const STUDENT_ROLE_ID = 3;
    const students = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.roleId, STUDENT_ROLE_ID));

    res.status(200).json({ session: currentSession, students });


  } catch (error) {
    console.error("Error generating attendance sheet:", error);
    res.status(500).json({ error: "Error generating attendance sheet" });
  }
}
