import { type Request, type Response} from 'express';
import pool from '../config/db';
import { sharpStreamingToS3 } from '../services/image.service';
import { validatedAWSSchema } from '../config/aws.config';

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID missing" });
        }

        const userProfile = await pool.query(
            "SELECT * FROM USERS where id = $1", [userId]
        )

        if (userProfile.rows.length === 0) {
            return res.status(404).json({ error: "User not found!"})
        }
        

        return res.status(200).json({
            message: "Profile loaded successfully!",
            data: userProfile.rows[0]
        });
        
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const updateProfilePicture = async (req: Request, res: Response) => {
    try {
        const fileBuffer = req.file?.buffer;
        const fileName = req.file?.originalname;
        const userId = req.user?.sub;

        if (!fileBuffer) {
            return res.status(400).json({ error: "Bad Request! Have sent an incomplete or malformed request payload" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID missing" });
        }

        const s3Url = await sharpStreamingToS3(fileBuffer, fileName!, validatedAWSSchema.AWS_S3_BUCKET_NAME, `avatars/${userId}-${Date.now()}.webp`)

        const updatedContent = await pool.query(
            "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *", [s3Url, userId]
        )

        return res.status(200).json({
            message: "Profile image is updated successfully!",
            data: updatedContent.rows[0]
        })
        
    } catch (err) {
        console.error("Not able to update profile picture:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}