import express from 'express';
import { secretsConfig } from './config/secrets';
import useragent from 'express-useragent';
import { auditLogger } from './middleware/audit.middleware';

const app = express();

app.use(express.json());
app.use(useragent.express());

app.use(auditLogger);

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