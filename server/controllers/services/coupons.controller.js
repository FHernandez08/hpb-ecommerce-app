import couponValidationLogic from "../../services/coupons.service.js";

async function couponsController(req, res) {
    try {
        const { code, subtotal_cents } = req.body;

        const result = await couponValidationLogic(code, subtotal_cents);
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(500).json( { message: "500 Internal Server Error" });
    }
}

export default couponsController;