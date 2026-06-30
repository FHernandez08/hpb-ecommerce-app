import { type Request, type Response} from 'express';
import { addItemToCart, applyCouponToCart, clearCartService, getCartByUserId, removeItemFromCart, updateItemQuantityService } from '../services/cart.service';
import { success } from 'zod';

// controller for the GET route
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;

        let subtotal_cents = 0;
        let discount_cents = 0;
        let finalTotalCents = 0;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID missing" });
        };

        const cartDetails = await getCartByUserId(userId);

        const products = cartDetails.Items?.filter(item => item.SK.startsWith("CART#ITEM#"));
        const coupons = cartDetails.Items?.filter(item => item.SK === "CART#COUPON");

        products?.forEach((product) => {
            const product_total_amount = product.price_cents * product.quantity;
            subtotal_cents += product_total_amount;
        });

        coupons?.forEach((coupon) => {
            if (coupon.type === "FIXED") {
                discount_cents += coupon.amount_cents;
            };

            if (coupon.type === "PERCENT") {
                const coupon_num_value = (subtotal_cents * coupon.amount_cents) / 100;
                discount_cents += coupon_num_value;
            };
        });

        if (discount_cents > subtotal_cents) {
            discount_cents = subtotal_cents;
        };

        finalTotalCents = subtotal_cents - discount_cents;
        return res.status(200).json({
            summary: {
                subtotal_cents,
                discount_cents,
                finalTotalCents
            },
            items: products,
            applied_coupon: coupons?.[0] || null
        });
    } catch (err) {
        console.error("Issue calculating the cart, please try again later...", err);
        throw err;
    }
};

export const addItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        const { itemId, ...itemData } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized access!" });
        }

        const result = await addItemToCart(userId, itemId, itemData);
        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const removeItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        const itemId = req.params.itemId as string;

        if (!userId || !itemId) {
            return res.status(401).json({ error: "Missing required User ID or Item ID" });
        }

        const result = await removeItemFromCart(userId, itemId);
        return res.status(201).json({ success: true, data: result });
    
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const applyCoupon = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        const couponCode = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized access!" });
        };

        if (!couponCode) {
            return res.status(404).json({ error: "Coupon code does not exist. Try again!" });
        }

        const result = await applyCouponToCart(userId, couponCode);
        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized access!" });
        }

        const result = await clearCartService(userId);
        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateItemQuantity = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        const itemId = req.params.itemId as string;
        const targetQuantity = req.body.quantity;

        if (!userId || !itemId) {
            return res.status(400).json({ error: "Missing required User ID or Item ID" });
        }

        const result = await updateItemQuantityService(userId, itemId, targetQuantity);
        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}