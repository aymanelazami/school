import { Router } from "express";
import {calculerBulletin } from "../controllers/bulletinController.ts";

const bulletinRouter = Router();

bulletinRouter.get("/:userId", calculerBulletin);

export default bulletinRouter;
