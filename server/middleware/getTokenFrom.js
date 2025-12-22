// Extracts token from authorization header --> cookie --> query
function getTokenFrom(req, res, next) {
    let token = undefined;

    const cookieName = process.env.ACCESS_TOKEN_COOKIE;
    if (req.cookies && req.cookies[cookieName]) {
        token = req.cookies[cookieName];
    }
    else {
        const authHeader = req.headers['authorization'];

        if (authHeader) {
            const trimmedAuthHeader = authHeader.trim();
            if (trimmedAuthHeader.indexOf("Bearer ") === 0) {
                const authToken = trimmedAuthHeader.split(' ')[1];
                token = authToken;
            }
        }
    }
    req.token = token;
    next();
}

export default getTokenFrom;