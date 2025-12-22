// takes the token payload and attaches it to the user on the request
import findById from "../db/userFunctions"

async function attachUser(req, res, next) {
    try {
        req.user = null;

        if (!req.auth) return next();
        
        const userId = req.auth.sub;
        if (!userId) return next();

        const user = await findById(userId);
        if(!user) return next();

        const { password_hash, ...safeUser } = user;
        req.user = safeUser;
        return next();
    }
    catch (err) {
        return next(err);
    }
}

export default attachUser;