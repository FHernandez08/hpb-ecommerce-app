// will submit the user's inquiry into the database and then get a reply with an email about being contacted soon
// in index.js --> implement app.use("/api/contact", contactRouter)

import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
    null
});

export default router;