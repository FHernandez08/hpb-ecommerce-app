// Logs { req.id, method, path, ip, userId? }

function requestStartLogger(req, res, next) {
    const timestamp = Date.now();
    const userId = req.user?.id ?? req.user?.sub ?? null;

    console.log(` ${timestamp} ${req.id} START --> ${req.method} ${req.path} (ip=${req.ip}, userId=${userId})`)

    next();
};

export default requestStartLogger;