import { Router } from "express";
import {getGroupes,createGroupe,updateGroupe,deleteGroupe,getGroupeMembers} from "../controllers/groupeController.ts";
import { requirePermission } from '../middlewares/permissionValidation.ts';

const groupeRouter = Router();

groupeRouter.get("/", requirePermission({ section: 'groupe', action: 'read' }), getGroupes);
groupeRouter.get("/:id/users", requirePermission({ section: 'groupe', action: 'read' }), getGroupeMembers);
groupeRouter.post("/", requirePermission({ section: 'groupe', action: 'create' }), createGroupe);
groupeRouter.put("/:id", requirePermission({ section: 'groupe', action: 'update' }), updateGroupe);
groupeRouter.delete("/:id", requirePermission({ section: 'groupe', action: 'delete' }), deleteGroupe);

export default groupeRouter;
