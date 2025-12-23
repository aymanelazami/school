import type { Request, Response } from "express";
import { bucket } from "../config/firebase.ts";
import multer from "multer";
import { drizzle } from "drizzle-orm/node-postgres";
import { resources } from "../database/resource.ts";
import path from "path";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

export const validateResourceType = (resourceType: string): boolean => {
  const allowedTypes = [
    "pdf", "docx", "png", "jpg", "jpeg", "xlsx", "pptx"
  ];
  return allowedTypes.includes(resourceType.toLowerCase());
};

export const uploadResource = async (req: Request, res: Response) => {
  try {
    const file = req.file;  //File uploaded via Multer
    const userId = req.body.userId;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const resourceType = path.extname(file.originalname).slice(1).toLowerCase();
    if (!validateResourceType(resourceType)) {
      return res.status(400).json({ error: `Invalid file type: ${resourceType}` });
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

    // Prepare insert data for resources
    const insertData = {
      name: file.originalname,
      resourceType,              
      filePath: publicUrl,
      size: file.size || 0,
      uploadDate: new Date(),   
      userId: parsedUserId,
    };

    console.log(" Inserting into DB:", insertData);

    // Insert into Postgres (resources table)
    await db.insert(resources).values(insertData);

    console.log(" Metadata saved to DB");

    if (!res.headersSent) {
      res.status(200).json({
        message: "Resource uploaded successfully",
        url: publicUrl,
      });
    }
  } catch (dbError) {
    console.error(" Database error:", dbError);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to save resource metadata",
        details: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }
  }
});


    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Server error:", error);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
};

export const getResources = async (_req: Request, res: Response) => {
  try {
    const allResources = await db.select().from(resources);
    res.status(200).json(allResources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Cannot fetch resources" });
  }
};

export const getResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const result = await db.select().from(resources).where(eq(resources.id, Number(resourceId)));
    if (!result.length) return res.status(404).json({ message: "Resource not found" });
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Error fetching resource" });
  }
};
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { userId } = req.body;
    const file = req.file;

    // Check if resource exists
    const existing = await db.select().from(resources).where(eq(resources.id, Number(resourceId)));

    if (!existing.length) {
      return res.status(404).json({ message: "Resource not found" });
    }


    const existingRes = existing[0]!;
    let newFilePath = existingRes.filePath;
    let newName = existingRes.name;
    let newResourceType = existingRes.resourceType;
    let newSize = existingRes.size;

    // If a new file is uploaded, upload it to Firebase
    if (file) {
      const resourceType = path.extname(file.originalname).slice(1).toLowerCase();
      if (!validateResourceType(resourceType)) {
        return res.status(400).json({ error: `Invalid file type: ${resourceType}` });
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
            newResourceType = resourceType;
            newSize = file.size;
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        blobStream.end(file.buffer);
      });
    }

    // Prepare the update data
    const updateData = {
      name: newName,
      resourceType: newResourceType,
      userId: userId ? Number(userId) : existingRes.userId,
      filePath: newFilePath,
      uploadDate: new Date(),
      size: newSize,
    };

    // Update the database
    const result = await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, Number(resourceId)))
      .returning();

    res.json({
      message: "Resource updated successfully",
      resource: result[0],
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Error updating resource" });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const result = await db.delete(resources).where(eq(resources.id, Number(resourceId))).returning();
    if (!result.length) return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Error deleting resource" });
  }
};
