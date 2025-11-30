// special case middleware for paypal webhook with raw body exception

import crypto from "crypto";
import express from "express";

const router = express.Router();

const paypalWebhookSecret = process.env.PAYPAL_WEBHOOK_SECRET;
const webhookId = process.env.PAYPAL_WEBHOOK_ID;

router.post('/paypal', express.raw({ type: '*/*' }), (req, res) => {
    try {
        // 1. Get headers for verification
        const transmissionId = req.headers['paypal-transmission-id'];
        const transmissionTime = req.headers['paypal-transmission-time'];
        const signature = req.headers['paypal-transmission-sig'];
        const certUrl = req.headers['paypal-cert-url'];

        // 2. Used to verify that is a concatenation of data
        const messageString = `${transmissionId}|${transmissionTime}|${webhookId}|${req.body.toString()}`;

        // 3. Fetch the public cert and use the 'crypto' module to verify the signature
        console.log('Webhook received and raw body captured successfully!');
        res.status(200).send('Webhook received.');
    }

    catch (err) {
        console.error('Webhook processing error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
})

module.exports = router;