

module.exports.handler = async (event) => {
    console.log('Request event: ', event);

    const method = event.requestContext.http.method;
    const rawPath = event.rawPath;

    // /health branch
    if (method === "GET" && rawPath === "/health") {
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain" },
            body: "Successful response, 200 status code!"
        }
    }
}