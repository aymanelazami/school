import { Router } from "express";
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from "../controllers/sessionsController.ts";

const sessionsRouter = Router();

sessionsRouter.get("/", getSessions);

sessionsRouter.get("/:sessionId", getSession);

sessionsRouter.post("/", createSession);

sessionsRouter.put("/:sessionId", updateSession);

sessionsRouter.delete("/:sessionId", deleteSession);

export default sessionsRouter;
