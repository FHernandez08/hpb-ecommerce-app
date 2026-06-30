import express from 'express';
import { secretsConfig } from './config/secrets';
import useragent from 'express-useragent';
import { auditLogger } from './middleware/audit.middleware';
import helmet from 'helmet';
import { globalLimiter } from './config/rateLimit.config';
import 'dotenv/config';

// Main Routes imports
import userRoutes from "./routes/users/user.route.v2";
import cartRoutes from "./routes/cart/cart.route.v2";

// Admin Routes imports


///////////////////////////////////////////////////////////////////////////////////////
const app = express();

app.use(express.json());
app.use(useragent.express());
app.use(helmet());
app.use(globalLimiter)

app.use(auditLogger);

// routes
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/cart", cartRoutes);


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