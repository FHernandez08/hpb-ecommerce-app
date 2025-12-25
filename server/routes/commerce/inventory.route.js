// will keep track of our inventory such as photobooth teams
// in index.js --> implement app.use("/api/inventory", inventoryRouter)

import express from "express";
const router = express.Router();

// read stock/availability, using dates to ensure what's available with the booths currently used
router.get("/:productId", async (req, res) => {
    null
});

// adjust stock/availability
router.patch("/:productId", async (req, res) => {
    null
});

export default router;