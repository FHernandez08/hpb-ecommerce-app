// addons service - that will be sent to the controller
import { pool } from "../db/db.js"

export async function listPublicAddons() {
    const { rows } = await pool.query("SELECT id, code, name, description, price_cents FROM add_ons WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC");

    return rows;
};