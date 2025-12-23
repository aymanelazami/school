import { Router } from 'express';
import {createGrade,updateGrade,getGrade, getAllGrades, deleteGrade, getStudentGrades,getStudentAverage,getModuleGrades} from '../controllers/gradesController.ts';
import { requirePermission } from '../middlewares/permissionValidation.ts';


const gradeRouter = Router();

gradeRouter.post('/', requirePermission({ section: 'grade', action: 'create' }), createGrade);
gradeRouter.put('/:id', requirePermission({ section: 'grade', action: 'update' }), updateGrade);
gradeRouter.get('/:id', requirePermission({ section: 'grade', action: 'read' }), getGrade);
gradeRouter.get('/', requirePermission({ section: 'grade', action: 'read' }), getAllGrades);
gradeRouter.delete('/:id', requirePermission({ section: 'grade', action: 'delete' }), deleteGrade);
gradeRouter.get("/:studentID/student", getStudentGrades);
gradeRouter.get("/:studentID/average", getStudentAverage);
gradeRouter.get("/:moduleId/module",getModuleGrades);

export default gradeRouter;