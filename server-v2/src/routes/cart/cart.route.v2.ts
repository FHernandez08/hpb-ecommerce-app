import express from 'express';
import { addItem, applyCoupon, clearCart, getCart, removeItem, updateItemQuantity } from '../../controllers/cart.controller';
import { verifyCognitoToken } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(verifyCognitoToken);

// GET route - view current cart + calculate totals
router.get("/", getCart);

// POST route - add item to cart
router.post("/items", addItem);

// POST route - add coupon to existing cart
router.post("/coupon", applyCoupon);

// PATCH route - updates the item quantity
router.patch("/items/:itemId", updateItemQuantity);

// DELETE route - remove a single specific item completely
router.delete("/items/:itemId", removeItem);

// DELETE route - clears/resets the entire cart
router.delete("/", clearCart);

export default router;