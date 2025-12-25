// add event gallery to the web app including galleries, photos and more
// in index.js --> implement app.use("/api/events", eventGalleryRouter)

import express from "express";
const router = express.Router();

// creates the event showcase
router.post("/", async (req, res) => {
    null
});

// upload images to the event, it needs consent
router.post("/:eventId/photos", async (req, res) => {
    null
});

// list all events respective to the user
router.get("/", async (req, res) => {
    null
});

// only the visible/consented events
router.get("/public", async(req, res) => {
    null
});

// get a detailed view of the respective event, owner/admin will be able to seem them all
router.get("/:eventId", async (req, res) => {
    null
});

// toggle public visibility
router.patch("/:eventId/visibility", async (req, res) => {
    null
});

// hide the event gallery from the profile view
router.patch("/:eventId/hide", async (req, res) => {
    null
});

// delete certain photos from the event gallery for respective event
router.delete("/:eventId/photos/:photoId", async (req, res) => {
    null
});

export default router;