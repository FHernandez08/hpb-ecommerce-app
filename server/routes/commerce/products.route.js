// will be able to list our booths along with information about the products
// in index.js --> implement app.use("/api/products", productsRouter)

import express from "express";
const router = express.Router();

// list products offered with filters/sort/pagination
router.get("/", async (req, res) => {
    null
});

// grabs the product's details to be added to other APIs
router.get("/:productId", async (req, res) => {
    null
});

// creates the product and posts inside DB
router.post("/", async (req, res) => {
    null
});

// updates the product, both on the app and in the database
router.put("/:productId", async (req, res) => {
    null
});

// archives/deletes the product, both on app and inside the database
router.delete(":productId", async (req, res) => {
    null
});

export default router;