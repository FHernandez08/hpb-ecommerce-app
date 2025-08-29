import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

const authRouter = require("./routes/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRouter);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(morgan('dev')); // logs HTTP requests

app.get("/" , (req, res) => {
    res.send("Server is running!");
});



// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});