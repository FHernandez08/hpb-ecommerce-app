// controller for public addons
import { listPublicAddons } from "../../services/addons.service.js";

export default async function getPublicAddons(req, res) {
    const addOnsList = await listPublicAddons();

    res.status(200).json({ addons: addOnsList });
};