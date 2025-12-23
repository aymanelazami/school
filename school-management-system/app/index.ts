import express from "express";
import type { Application } from 'express';
import passport from './config/passport.ts';
import dotenv from 'dotenv';
import session from 'express-session';
import documentsRoutes from "./routes/documentsRoutes.ts";
import resourcesRoutes from "./routes/resourcesRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import absenceRoutes from "./routes/absenceRoutes.ts";
import bulletinRoutes from "./routes/bulletinRoutes.ts";
import opportuniteRoutes from "./routes/opportuniteRoutes.ts";
import cors from 'cors';
import attendaceListRouter from "./routes/attendanceListRoutes.ts";
import { authRouter } from "./routes/authenticationRouter.ts";
import filiereRouter from "./routes/filiereRouter.ts";
import gradeRouter from "./routes/gradeRoutes.ts";
import groupeRouter from "./routes/groupeRouter.ts";
import ModuleRouter from "./routes/moduleRoutes.ts";
import niveauRouter from "./routes/niveauRouter.ts";
import permissionRouter from "./routes/permissionRouter.ts";
import roleRouter from "./routes/roleRoutes.ts";
import roomRouter from "./routes/roomRoutes.ts";
import eventRouter from "./routes/eventRoutes.ts";
import { authenticate } from './middlewares/authentication.ts';

import { apiRateLimiter } from './utilities/rateLimit.ts';
import sessionsRoutes from "./routes/sessionRoutes.ts";

dotenv.config();
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true, // VERY IMPORTANT (sessions)
  })
);


app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.APP_PORT;

app.use('/api/auth', apiRateLimiter, authRouter);
app.use('/api/filieres', apiRateLimiter, authenticate, filiereRouter);
app.use('/api/grades', apiRateLimiter, authenticate, gradeRouter);
app.use('/api/groupes', apiRateLimiter, authenticate, groupeRouter);
app.use('/api/modules', apiRateLimiter, ModuleRouter);
app.use('/api/niveaux', apiRateLimiter, authenticate, niveauRouter);
app.use('/api/permissions', apiRateLimiter, authenticate, permissionRouter);
app.use('/api/roles', apiRateLimiter, authenticate, roleRouter);
app.use('/api/rooms', apiRateLimiter, authenticate, roomRouter);
app.use('/api/events', apiRateLimiter, authenticate, eventRouter);
app.use('/api/attendance-lists', apiRateLimiter, authenticate, attendaceListRouter);
app.use("/sessions", apiRateLimiter, authenticate, sessionsRoutes);
app.use("/api/users", apiRateLimiter, authenticate, userRoutes);
app.use("/api/absences", apiRateLimiter, authenticate, absenceRoutes);
app.use("/api/bulletins", apiRateLimiter, authenticate, bulletinRoutes);
app.use("/api/opportunites", apiRateLimiter, authenticate, opportuniteRoutes);


app.get('/health', apiRateLimiter, (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use("/api/documents", documentsRoutes);
app.use("/api/resources", resourcesRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});