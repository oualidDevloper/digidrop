
const axios = require('axios');

async function debugShop() {
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
    const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";

    try {
        console.log("--- CATEGORIES ---");
        const catRes = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/categories`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        console.log(JSON.stringify(catRes.data.data, null, 2));

        console.log("\n--- TRYING GATEWAYS VARIATIONS ---");
        const endpoints = [
            `https://business-api.antistock.io/v1/dash/shops/${shopId}/gateways`,
            `https://business-api.antistock.io/v1/dash/shops/${shopId}/settings/gateways`,
            `https://business-api.antistock.io/v1/dash/shops/${shopId}/payment-gateways`,
            `https://business-api.antistock.io/v1/dash/gateways`
        ];
        for (const url of endpoints) {
            try {
                const res = await axios.get(url, { headers: { "Authorization": `Bearer ${apiKey}` } });
                console.log(`Endpoint ${url} success:`, res.data.data?.length, "items");
                if (res.data.data?.length > 0) {
                    console.log("Sample:", JSON.stringify(res.data.data[0], null, 2));
                    // If we find gateways, we can extract their IDs
                    const gatewayIds = res.data.data.map(g => g.id);
                    console.log("Gateway IDs found:", gatewayIds);
                }
            } catch (e) {
                console.log(`Endpoint ${url} failed with status:`, e.response?.status);
            }
        }

        console.log("\n--- SHOP CONFIG ---");
        const shopRes = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        console.log(JSON.stringify(shopRes.data.data, null, 2));

    } catch (e) {
        console.error(e.response?.status, JSON.stringify(e.response?.data));
    }
}
debugShop();
