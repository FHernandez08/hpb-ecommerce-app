import express from 'express';
import { secretsConfig } from './config/secrets';

const app = express();

async function startServer() {
    try {
        await secretsConfig.initializeSecrets();
        console.log("Remote secrets downloaded and validated successfully!");

        // const { pool } = await import("./config/db");

        app.listen(3000, () => {
            console.log("Server running on port 3000...");
        });
    }
    catch (error) {
        console.error("Failed to initialize application secrets:", error);
        process.exit(1);
    }
}

startServer();