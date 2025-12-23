import { Router } from "express";
import { getStudentsByGroup,createAbsences,getAbsenceById,updateAbsence,getAbsenceCountByStudent} from "../controllers/absenceController.ts";
const absenceRouter = Router();

absenceRouter.get("/:groupId/students",getStudentsByGroup);
absenceRouter.post("/group",createAbsences);
absenceRouter.get("/:id",getAbsenceById);
absenceRouter.put("/:absenceId/absence", updateAbsence);
absenceRouter.get("/:studentId/count", getAbsenceCountByStudent);

export default absenceRouter;


