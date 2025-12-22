// Logs { req.id, method, path, ip, userId? }

function requestStartLogger(req, res, next) {
    const timestamp = new Date('2025-12-25T10:00:00Z');
    const specifiedTimestamp = timestamp.getTime();
    console.log(` ${specifiedTimestamp} ${req.id} START --> ${req.method} ${req.path} (ip=${req.ip}, userId=${req.user?.id})`)

    next();
};

export default requestStartLogger;