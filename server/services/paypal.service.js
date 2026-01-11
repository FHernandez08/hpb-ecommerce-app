async function getPaypalAccessToken() {
    const baseUrl = process.env.PAYPAL_BASE_URL;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!baseUrl || !clientId || !clientSecret) {
        throw new Error("Missing PayPal env vars (BASE_URL, CLIENT_ID, CLIENT_SECRET");
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const resp = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await resp.json();

    if (!resp.ok || !data?.access_token) {
        throw new Error(`PayPal token error: ${JSON.stringify(data)}`);
    }

    return data.access_token;
}

export { getPaypalAccessToken };