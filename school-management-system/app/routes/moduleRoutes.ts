import { Router } from 'express';
import {getAllModules,createModule,getModule,updateModule,deleteModule, getModuleSchedule, filterModules} from  '../controllers/moduleController.ts';
import { requirePermission } from '../middlewares/permissionValidation.ts';

const ModuleRouter = Router();

ModuleRouter.get('/filter',  filterModules);
ModuleRouter.get('/:id',  getModule);
ModuleRouter.post('/',  createModule);
ModuleRouter.put('/:id', updateModule);
ModuleRouter.delete('/:id', deleteModule);
// Exemple d’appel : /modules/2/schedule?startDate=2025-11-01&endDate=2025-11-15
ModuleRouter.get("/:moduleId/schedule", getModuleSchedule);
// ModuleRouter.get('/:studentId/validate-modules', validateStudentModules);
export default ModuleRouter;