import express from "express";
import getPublicAddons from "../../controllers/services/addons.controller.js";
const router = express.Router();

// addons route for the public - GET
router.get("/public", getPublicAddons);

export default router;