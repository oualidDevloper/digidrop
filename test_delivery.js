const axios = require('axios');

async function testApi() {
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
  const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";

  const payload = {
    name: "Test Delivery Type",
    description: JSON.stringify({
        blocks: [{ key: "e", text: "Test", type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }],
        entityMap: {}
    }),
    status: "PUBLIC",
    visibility: "PUBLIC",
    unlisted: false,
    categoryId: 3022951,
    images: [],
    variants: [
      {
        name: "Standard",
        price: { amount: 3.50, currency: "EUR" },
        stockLevel: 99999,
        minQuantity: 1,
        maxQuantity: 0,
        type: "SINGLE",
        chargeType: "ONE_TIME",
        deliveryType: "MANUAL", // Trying MANUAL first
        customerNote: "Thank you!",
        gateways: [] 
      }
    ]
  };

  try {
    console.log("Testing direct POST with deliveryType: MANUAL");
    const res = await axios.post(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products`, payload, {
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
    });
    console.log("SUCCESS!", res.data.data.id);
  } catch (err) {
    console.error("FAILED with MANUAL:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    
    // Fallback test
    payload.variants[0].deliveryType = "PRESET";
    try {
        console.log("\nTesting direct POST with deliveryType: PRESET");
        const res2 = await axios.post(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products`, payload, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
        });
        console.log("SUCCESS with PRESET!", res2.data.data.id);
    } catch (err2) {
        console.error("FAILED with PRESET:", err2.response ? JSON.stringify(err2.response.data, null, 2) : err2.message);
    }
  }
}

testApi();
