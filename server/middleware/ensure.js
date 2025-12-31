// ensureAuth / ensureAdmin / guardOwnership
// protects routes; enforces ownership or admin access

function ensureAuth(req, res, next) {

    if (req.user === null) {
        const reason = req.authError;

        if (reason === "missing") {
            return res.status(401).json({ message: "Authentication Required!" })
        }
        else if (reason === "expired") {
            return res.status(401).json({ message: "Session Expired!" })
        }
        else if (reason === "invalid") {
            return res.status(401).json({ message: "Invalid Session!" })
        }
        else {
            return res.status(401).json({ message: "Authentication Required!" })
        }
    }
    else {
        next();
    }
}

function ensureAdmin(req, res, next) {
    if (req.user) {
        const role = req.user.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Invalid permissions!" });
        }
        else {
            next();
        }
    }
    else {
        return res.status(401).json({ message: "Invalid login credentials!" })
    }
}

export { ensureAuth, ensureAdmin };