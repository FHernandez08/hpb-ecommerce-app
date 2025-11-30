// assigns req.id and adds x-request-id header
import crypto from "crypto";

function requestId(req, res, next) {
    const incomingId = req.headers["x-request-id"];
    const finalId = incomingId || crypto.randomUUID();

    req.id = finalId;

    res.setHeader("X-Request-Id", finalId);

    next();
}

module.exports = requestId;