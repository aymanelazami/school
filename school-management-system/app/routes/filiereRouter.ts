import { Router } from "express";
import {getFiliere,createFiliere,updateFiliere,deleteFiliere,getFiliereModules} from "../controllers/filiereController.ts";
import { requirePermission } from '../middlewares/permissionValidation.ts';

const filiereRouter = Router();

filiereRouter.get("/", requirePermission({ section: 'filiere', action: 'read' }), getFiliere);
filiereRouter.post("/", requirePermission({ section: 'filiere', action: 'create' }), createFiliere);
filiereRouter.put("/:id", requirePermission({ section: 'filiere', action: 'update' }), updateFiliere);
filiereRouter.delete("/:id", requirePermission({ section: 'filiere', action: 'delete' }), deleteFiliere);
filiereRouter.get("/:filiereId/filiere", getFiliereModules);

export default filiereRouter;
