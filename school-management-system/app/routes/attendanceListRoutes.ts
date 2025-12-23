import express from "express";
import {createAttendance,getAttendanceById,updateAttendance,deleteAttendance, filterAttendenceList} from "../controllers/attendanceListController.ts";
import { requirePermission } from '../middlewares/permissionValidation.ts';

const attendaceListRouter = express.Router();

attendaceListRouter.post("/", requirePermission({ section: 'attendance', action: 'create' }), createAttendance);
attendaceListRouter.get("/:id", requirePermission({ section: 'attendance', action: 'read' }), getAttendanceById);
attendaceListRouter.put("/:id", requirePermission({ section: 'attendance', action: 'update' }), updateAttendance);
attendaceListRouter.delete("/:id", requirePermission({ section: 'attendance', action: 'delete' }), deleteAttendance);
attendaceListRouter.get("/filter",  requirePermission({ section: 'attendance', action: 'read' }), filterAttendenceList);

export default attendaceListRouter;
