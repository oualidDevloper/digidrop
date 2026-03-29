const axios = require('axios');

async function test() {
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
    const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";
    const baseUrl = "http://localhost:3000";

    console.log("1. Testing Categories API...");
    try {
        const catRes = await axios.get(`${baseUrl}/api/categories?apiKey=${apiKey}&shopId=${shopId}`);
        console.log("Categories Status:", catRes.status);
        console.log("Categories Data:", JSON.stringify(catRes.data.data, null, 2));
    } catch (e) {
        console.error("Categories API Failed:", e.message);
    }

    console.log("\n2. Testing Scrape API (Z2U Example)...");
    try {
        const scrapeRes = await axios.post(`${baseUrl}/api/scrape`, {
            url: "https://www.z2u.com/netflix/items-18151480",
            marginMultiplier: 1.5
        });
        console.log("Scrape Status:", scrapeRes.status);
        console.log("Scraped Data:", JSON.stringify(scrapeRes.data.data, null, 2));
    } catch (e) {
        console.error("Scrape API Failed:", e.message);
    }
}

test();
