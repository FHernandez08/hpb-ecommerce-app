// final middleware for uniform JSON errors

function errorHandler(err, req, res, next) {
    const requestId = req.id || "unknown";

    let statusCode = 500;

    if (
        typeof err.statusCode === "number" &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
    ) {
        statusCode = err.statusCode;
    }
    else if (
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status <= 599
    ) {
        statusCode = err.status;
    }

    let type = err.type;

    if (!type) {
        if (statusCode === 400) {
            type = "bad_request";
        } 
        else if (statusCode === 401) {
            type = "auth_error";
        } 
        else if (statusCode === 403) {
            type = "forbidden";
        } 
        else if (statusCode === 404) {
            type = "not_found";
        } 
        else if (statusCode >= 400 && statusCode < 500) {
            type = "client_error";
        } 
        else {
            type = "server_error";
        }
    }

    const isServerError = statusCode >= 500;
    const message = isServerError 
    ? "Internal Server Error" 
    : err.message || "Request failed";

    const details = Array.isArray(err.details) ? err.details : undefined;

    console.error(
        `[${requestId}] ${req.method} ${req.path} --> ${statusCode} (${type})`
    );

    if (err.message) {
        console.error("Error message:", err.message);
    };

    if (err.stack) {
        console.error(err.stack);
    };

    const payload = {
        requestId,
        statusCode,
        type,
        message,
    };

    if (details) {
        payload.details = details;
    };

    res.status(statusCode).json(payload);
}

export default errorHandler;