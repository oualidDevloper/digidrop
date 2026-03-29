const axios = require('axios');

async function listAll() {
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
    const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";

    try {
        const res = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const products = res.data.data;
        console.log(`Found ${products.length} products.`);
        
        for (const p of products) {
            const detail = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products/${p.id}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const v = detail.data.data.variants[0];
            if (p.name.includes("Test PRESET")) {
                console.log(`\nProduct: ${p.name}`);
                console.log("customerNote:", v.customerNote);
                console.log("gateways:", JSON.stringify(v.gateways, null, 2));
            }
        }
    } catch (e) {
        console.error(e.response?.status, JSON.stringify(e.response?.data));
    }
}
listAll();
