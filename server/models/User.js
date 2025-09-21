import { pool } from "../db/db.js"

async function getUserByProvider(provider, providerUserId) {
    // this would get the user via the provider
    if (typeof provider !== "string" || typeof providerUserId !== "string") return null;

    const trimmedProvider = provider.trim();
    const trimmedProviderUserId = providerUserId.trim();

    if (!trimmedProvider || !trimmedProviderUserId) return null;

    const lowerProvider = provider.toLowerCase();

    const { rows } = await pool.query(
        `SELECT u.id, u.role, u.status, u.first_name, u.last_name, u.email, u.created_at, u.updated_at
            FROM oauth_identities oi
            JOIN users u ON u.id = oi.user_id
            WHERE oi.provider = $1 AND oi.provider_user_id = $2
            LIMIT 1`,
        [lowerProvider, trimmedProviderUserId]
    )

    return rows[0] ?? null
}

async function getUserByEmail(email) {
    // get user via email from the users table
    if (typeof email !== "string") return null;

    const trimmed = email.trim();
    if (!trimmed) return null;

    const emailLower = trimmed.toLowerCase();

    const { rows } = await pool.query(
        `SELECT id, role, status, first_name, last_name, email, phone, created_at, updated_at 
        FROM users 
        WHERE lower(email) = $1 
        LIMIT 1`, 
        [emailLower]
    );

    return rows[0] ?? null
}

async function getUserById(id) {
    if (typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!trimmed) return null;

    const { rows } = await pool.query(
        `SELECT id, role, status, first_name, last_name, email, phone, created_at, updated_at
        FROM users
        WHERE id = $1
        LIMIT 1`,
        [trimmed]
    );

    return rows[0] ?? null;

}

export { getUserByProvider, getUserByEmail, getUserById };