import { Router } from "express";
import {createNiveau,getAllNiveaux,updateNiveau,deleteNiveau,getLevelModules} from "../controllers/niveauController.ts";
import { requirePermission } from '../middlewares/permissionValidation.ts';


const niveauRouter = Router();

niveauRouter.post("/", requirePermission({ section: 'niveau', action: 'create' }), createNiveau);
niveauRouter.get("/", requirePermission({ section: 'niveau', action: 'read' }), getAllNiveaux);
niveauRouter.put("/:id", requirePermission({ section: 'niveau', action: 'update' }), updateNiveau);
niveauRouter.delete("/:id", requirePermission({ section: 'niveau', action: 'delete' }), deleteNiveau);
niveauRouter.get("/:id/modules", getLevelModules);

export default niveauRouter;