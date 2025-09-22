import { pool } from "../db/db.js"
import { randomUUID } from "crypto"; 

async function getUserByProvider(provider, providerUserId) {
    // this would get the user via the provider
    if (typeof provider !== "string" || typeof providerUserId !== "string") return null;

    const trimmedProvider = provider.trim();
    const trimmedProviderUserId = providerUserId.trim();

    if (!trimmedProvider || !trimmedProviderUserId) return null;

    const lowerProvider = trimmedProvider.toLowerCase();

    const { rows } = await pool.query(
        `SELECT u.id, u.role, u.status, u.first_name, u.last_name, u.email, u.phone, u.created_at, u.updated_at
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

async function createUser({ email, firstName, lastName, phone } = {}) {
  const id = randomUUID();

  const emailLower =
    typeof email === "string" && email.trim()
      ? email.trim().toLowerCase()
      : null;

  const first =
    typeof firstName === "string" && firstName.trim() ? firstName.trim() : null;

  const last =
    typeof lastName === "string" && lastName.trim() ? lastName.trim() : null;

  const phoneNorm =
    typeof phone === "string" && phone.trim() ? phone.trim() : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO users
         (id, role, status, first_name, last_name, email, phone, password_hash, created_at, updated_at)
       VALUES
         ($1, 'user', 'active', $2, $3, $4, $5, NULL, NOW(), NOW())
       RETURNING id, role, status, first_name, last_name, email, phone, created_at, updated_at`,
      [id, first, last, emailLower, phoneNorm]
    );
    return rows[0];
  } catch (err) {
    // Unique violation on email (race): fetch and return existing user
    if (err.code === "23505" && emailLower) {
      const { rows } = await pool.query(
        `SELECT id, role, status, first_name, last_name, email, phone, created_at, updated_at
           FROM users
          WHERE lower(email) = $1
          LIMIT 1`,
        [emailLower]
      );
      if (rows[0]) return rows[0];
    }
    throw err;
  }
}

async function linkOAuthIdentity(
  userId,
  { provider, providerUserId, email } = {}
) {
  if (typeof userId !== "string" || !userId.trim())
    throw new Error("userId is required");

  if (typeof provider !== "string" || typeof providerUserId !== "string")
    throw new Error("provider and providerUserId are required");

  const prov = provider.trim().toLowerCase();
  if (!["google", "microsoft", "facebook"].includes(prov)) {
    throw new Error(`Unsupported provider: ${prov}`);
  }

  const provId = providerUserId.trim();
  if (!provId) throw new Error("providerUserId is required");

  const emailLower =
    typeof email === "string" && email.trim()
      ? email.trim().toLowerCase()
      : null;

  const id = randomUUID();

  try {
    const { rows } = await pool.query(
      `INSERT INTO oauth_identities
         (id, user_id, provider, provider_user_id, email, linked_at)
       VALUES
         ($1, $2, $3, $4, $5, NOW())
       RETURNING id, user_id, provider, provider_user_id, email, linked_at`,
      [id, userId.trim(), prov, provId, emailLower]
    );
    return rows[0];
  } catch (err) {
    if (err.code !== "23505") throw err; // not a unique violation → bubble up

    // Fetch existing identity by (provider, provider_user_id)
    const { rows } = await pool.query(
      `SELECT id, user_id, provider, provider_user_id, email, linked_at
         FROM oauth_identities
        WHERE provider = $1 AND provider_user_id = $2
        LIMIT 1`,
      [prov, provId]
    );
    const existing = rows[0];

    if (!existing) throw err; // shouldn't happen, but bubble if it does

    if (existing.user_id !== userId.trim()) {
      const conflict = new Error("identity-linked-to-different-user");
      conflict.code = "IDENTITY_CONFLICT";
      conflict.details = {
        provider: prov,
        providerUserId: provId,
        existingUserId: existing.user_id,
        attemptedUserId: userId.trim(),
      };
      throw conflict;
    }

    // Idempotent success: optionally refresh stored email
    if (emailLower && (!existing.email || existing.email !== emailLower)) {
      await pool.query(`UPDATE oauth_identities SET email = $1 WHERE id = $2`, [
        emailLower,
        existing.id,
      ]);
      existing.email = emailLower;
    }

    return existing;
  }
}

export { getUserByProvider, getUserByEmail, getUserById, createUser, linkOAuthIdentity };