import express from "express";
import { da } from "zod/v4/locales";

const router = express.Router();

router.get('/health', (req, res) => {
    const data = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }

    res.status(200).send(data);
});

module.exports = router;