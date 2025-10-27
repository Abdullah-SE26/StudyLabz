import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async (file) => {
    try {
      console.log("Upload completed:", file);

      // Optional: save file info to DB
      // await prisma.question.update({ ... });

    } catch (err) {
      console.error("Error in UploadThing callback:", err);
  
    }
  }),
};
