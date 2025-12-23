import { Router } from "express";
import {getProfile,updateProfile,deleteProfile} from "../controllers/usersController.ts";
import { requirePermission } from '../middlewares/permissionValidation.ts';


const userRouter = Router();

userRouter.get("/",getProfile);
// userRouter.put("/:id", requirePermission({ section: 'user', action: 'update' }), updateProfile);
userRouter.put("/:id",updateProfile);
userRouter.delete("/:id", deleteProfile);

export default userRouter;