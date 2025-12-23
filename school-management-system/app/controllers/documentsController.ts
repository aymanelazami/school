import type { Request, Response } from "express";
import { bucket } from "../config/firebase.ts";
import multer from "multer";
import { drizzle } from "drizzle-orm/node-postgres";
import { documents } from "../database/document.ts";
import path from "path";
import dotenv from 'dotenv';
import { eq } from "drizzle-orm";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

export const validateDocumentType =(documentType: string):Boolean =>{
  const allowedTypes = ["pdf", "docx", "png", "jpg", "jpeg"];
  return allowedTypes.includes(documentType.toLowerCase());
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;  //File uploaded via Multer
    const userId = req.body.userId;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    
    const documentType = path.extname(file.originalname).slice(1).toLowerCase();
    if (!validateDocumentType(documentType)) {
        return res.status(400).json({error: `Invalid file type: ${documentType}`,});
    }

    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `InesFaidi/${timestamp}_${sanitizedFileName}`;

    const blob = bucket.file(fileName);
    //To open a connection to Firebase Storage and prepare it to receive a stream of data.
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      },
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error(" Firebase upload error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Upload failed", details: err.message });
      }
    });

    blobStream.on("finish", async () => {
      try {

        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        console.log(" File uploaded:", publicUrl);

        const parsedUserId =
          userId && !isNaN(Number(userId)) ? Number(userId) : null;

        // Prepare insert data
        const insertData = {
          name: file.originalname,
          documentType,
          filePath: publicUrl,
          size: file.size || 0,
          uploadDate: new Date(), // timestamp
          userId: parsedUserId,
        };

        console.log(" Inserting into DB:", insertData);

        // Insert into Postgres
        await db.insert(documents).values(insertData);

        console.log(" Metadata saved to DB");

        if (!res.headersSent) {
          res.status(200).json({
            message: "File uploaded successfully",
            url: publicUrl,
          });
        }
      } catch (dbError) {
        console.error(" Database error:", dbError);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Failed to save file metadata",
            details:
              dbError instanceof Error ? dbError.message : String(dbError),
          });
        }
      }
    });
    // the end of the data transfer process / Sends the uploaded file data from memory to Firebase.
    blobStream.end(file.buffer);
  } catch (error) {
    console.error(" Server error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const documentsList = await db.select().from(documents);
    res.status(200).json(documentsList);
  } catch (error) {
    console.error(" Get files error:", error);
    res.status(500).json({ 
      error: "Cannot fetch documents",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const result = await db.select().from(documents).where(eq(documents.id, Number(documentId)));
    if (!result.length) {
      return res.status(404).json({ message: "Document not found" })
    };
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching document" });
  }
}; 

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const result = await db.delete(documents).where(eq(documents.id, Number(documentId))).returning();
    if (!result.length) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting document" });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const {  userId } = req.body;
    const file = req.file; 

    // Check if document exists
    const existing = await db
      .select()
      .from(documents)
      .where(eq(documents.id, Number(documentId)));

    if (!existing.length) {
      return res.status(404).json({ message: "Document not found" });
    }

    const existingDoc = existing[0]!;
    let newFilePath = existingDoc.filePath;
    let newName = existingDoc.name;
    let newDocumentType = existingDoc.documentType; 
    let newSize = existingDoc.size;



    //If a new file is uploaded, upload it to Firebase
    if (file) {
      const newDocumentType = path.extname(file.originalname).slice(1).toLowerCase();
        if (!validateDocumentType(newDocumentType)) {
        return res.status(400).json({error: `Invalid file type: ${newDocumentType}`,});
    }
      const timestamp = Date.now();
      const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `InesFaidi/${timestamp}_${sanitizedFileName}`;
      const blob = bucket.file(fileName);

      await new Promise<void>((resolve, reject) => {
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              updatedAt: new Date().toISOString(),
            },
          },
          resumable: false,
        });

        blobStream.on("error", reject);

        blobStream.on("finish", async () => {
          try {
            await blob.makePublic();
            newFilePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            newName = file.originalname; 
            newSize = file.size; 
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        blobStream.end(file.buffer);
      });
    };

    // Prepare the update data
    const updateData = {
      name: newName,
      documentType: newDocumentType,
      userId: userId ? Number(userId) : existingDoc.userId,
      filePath: newFilePath,
      updatedAt: new Date(),
      size: newSize
    };

    //  Update the database
    const result = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, Number(documentId)))
      .returning();

    res.json({
      message: "Document updated successfully",
      document: result[0],
    });
  } catch (error) {
    console.error(" Error updating document:", error);
    res.status(500).json({ error: "Error updating document" });
  }
};
