// findByIdIid) - fetch a user by UUID
import { pool } from "./db"

async function findById(id) {
    const resultRow = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);

    if (resultRow.rows.length === 0) {
        return null;
    }
    else {
        return resultRow.rows[0];
    }
}


// findByEmail(email) - find a user by email
async function findByEmail(email) {
    const trimmedEmail = email.trim();
    
    const resultRow = await pool.query('Select * FROM users WHERE email = $1 LIMIT 1', [trimmedEmail]);

    if (resultRow.rows.length === 0) {
        return null;
    }
    else {
        return resultRow.rows[0];
    }
}


// createUser(data) - insert a new user for local auth or OAuth
async function createUser(data) {
    const email = data.email.trim();
    const password_hash = data.password_hash;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const avatar_url = data.avatar_url;

    const user = await pool.query('INSERT INTO users (email, password_hash, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *', [email, password_hash, firstName, lastName, avatar_url]);

    return user.rows[0];
}


// updateUser(id, fields) - update a user safely
async function updateUser(id, fields) {
    const allowed_fields = ["first_name", "last_name", "avatar_url", "last_login", "password_hash", "provider", "provider_id"];

    const safeFields = {};

    const setParts = [];
    const values = [];
    let counter = 1;

    for (const key in fields) {
        if (allowed_fields.includes(key)) {
            safeFields[key] = fields[key]
        }
        else {
            continue;
        }
    }

    if (Object.keys(safeFields).length === 0) {
        throw new Error("No valid fields to update!")
    }

    for (const key in safeFields) {
        setParts.push(`${key} = $${counter}`);
        values.push(safeFields[key]);
        counter += 1;
    }

    setParts.push("updated_at = now()");

    values.push(id);

    const sql = `UPDATE users SET ${setParts.join(", ")} WHERE id = $${counter} RETURNING *`;

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
        return null;
    }
    else {
        return result.rows[0];
    }
}

module.exports = { findById, findByEmail, createUser, updateUser };