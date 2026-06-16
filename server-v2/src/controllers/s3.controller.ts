import { type Request, type Response } from "express";
import { sharpStreamingToS3 } from "../services/image.service";

export const uploadProfilePicture = async (req: Request, res: Response) => {
    try {
        const fileBuffer = req.file?.buffer;
        if (!fileBuffer) {
            return res.status(400).json({ error: "No file uploaded!" });
        }

        // call the helper function and hand it the raw buffer object
        await sharpStreamingToS3(fileBuffer, req.file?.originalname!, "my-bucket", `avatars/${Date.now()}-profile.webp`);

        return res.status(200).json({ message: "Images uploaded successfully!" });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}