
const axios = require('axios');

async function listProducts() {
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
    const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";

    try {
        console.log("--- PRODUCTS ---");
        const res = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const products = res.data.data;
        console.log(`${products.length} products found.`);
        
        if (products.length > 0) {
            console.log("\n--- FIRST PRODUCT DETAIL ---");
            const detail = await axios.get(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products/${products[0].id}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            console.log(JSON.stringify(detail.data.data, null, 2));
        }

    } catch (e) {
        console.error(e.response?.status, JSON.stringify(e.response?.data));
    }
}
listProducts();
