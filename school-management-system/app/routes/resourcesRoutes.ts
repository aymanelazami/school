import { Router } from "express";
import {
  uploadResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
} from "../controllers/resourcesController.ts";
import multer from "multer";


const resourcesRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

 

resourcesRouter.post("/upload", upload.single("file"), uploadResource);

resourcesRouter.get("/", getResources); 

resourcesRouter.get("/:resourceId", getResource);

resourcesRouter.put("/:resourceId", upload.single("file"), updateResource);

resourcesRouter.delete("/:resourceId", deleteResource);

export default resourcesRouter;
