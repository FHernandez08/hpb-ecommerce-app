import pg from "pg";

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce',
    password: 'Astros#0213',
    port: 5433,
});

db.connect();

module.exports = db;