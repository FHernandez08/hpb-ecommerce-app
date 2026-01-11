import express from "express";
import couponsController from "../../controllers/services/coupons.controller.js";

const router = express.Router();

router.post("/validate", couponsController);

export default router;