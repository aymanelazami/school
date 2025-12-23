import { Router } from "express";
import { uploadFile,getFiles,deleteDocument, updateDocument ,getDocument} from "../controllers/documentsController.ts";
import multer from "multer";

const uploadRouter = Router();

// Configurer multer pour lire les fichiers en mémoire
const upload = multer({ storage: multer.memoryStorage() });

// Route : POST /api/upload
uploadRouter.post("/upload", upload.single("file"), uploadFile);

// Route : GET /api/documents/files
uploadRouter.get("/files", getFiles);
uploadRouter.delete("/:documentId", deleteDocument);
uploadRouter.put("/:documentId", upload.single("file"), updateDocument);

// Route : GET /api/documents/files
uploadRouter.get("/files/:documentId", getDocument);


export default uploadRouter;