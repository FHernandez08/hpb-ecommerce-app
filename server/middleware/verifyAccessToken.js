// verifies token and sets req.user or leaves null if invalid
import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const token = req.token;
    req.auth = null;
    req.authError = null;

    if (!token) {
        req.authError = "missing";
        next();
    }
    else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    req.authError = "expired"
                }
                else {
                    req.authError = "invalid"
                }

                req.auth = null;
                next();

            }
            else {
                req.auth = decodedUser;
                req.authError = null;
                next();
            }
        });
    }
}

export default authenticateToken;