// will have multiple routes to handle actions for cart on app
// in index.js --> implement app.use("/api/cart", cartRouter);

import express from "express";
const router = express.Router();


// get current user cart
router.get("/", async (req, res) => {
    null
});

// add item to cart
router.post("/items", async (req, res) => {
    null
})

// update item quantity, uses route parameter (:userId)
router.patch("/items/:itemId", async (req, res) => {
    null
})

// removes item from the cart, uses route parameter (:userId)
router.delete("/items/:itemId", async (req, res) => {
    null
});

export default router;