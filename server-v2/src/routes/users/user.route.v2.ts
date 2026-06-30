import express from "express";
import { verifyCognitoToken } from "../../middleware/auth.middleware";
import { getUserProfile, updateProfilePicture } from "../../controllers/user.controller";
import { multipartParsing } from "../../middleware/mutipart.middleware";

const router = express.Router();

router.get("/me", verifyCognitoToken, getUserProfile);

router.put("/me", verifyCognitoToken, multipartParsing, updateProfilePicture)

export default router;