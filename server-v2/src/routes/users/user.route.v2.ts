import express, { type Request, type Response} from "express";
import { verifyCognitoToken } from "../../middleware/auth.middleware";
import { getUserProfile, updateProfilePicture } from "../../controllers/user.controller";
import { multipartParsing } from "../../middleware/mutipart.middleware";

const router = express.Router();

router.get("/v2/users/me", verifyCognitoToken, getUserProfile);

router.put("v2/users/me", verifyCognitoToken, multipartParsing, updateProfilePicture)

export default router;