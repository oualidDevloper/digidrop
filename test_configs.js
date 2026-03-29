const axios = require('axios');

async function testConfigs() {
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
  const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";

  const attemptConfigs = [
    { type: "SERVICE", text: "Download here", limitStock: 0 },
    { type: "SERVICED", serviceText: "Download here", limitStock: 0 },
    { type: "CUSTOM", value: "Download here", limitStock: 0 },
    { type: "TEXT", value: "Download here", limitStock: 0 },
    { type: "LINK", url: "Download here", limitStock: 0 },
    { type: "SERVICE", serviceText: "Download here", limitStock: 0, customName: "Custom" }
  ];

  require('fs').writeFileSync('configs_test.log', '');

  for (const config of attemptConfigs) {
    console.log(`Testing config:`, config);
    const payload = {
      name: `Test Config ${config.type}`,
      description: JSON.stringify({ blocks: [], entityMap: {} }),
      status: "PUBLIC",
      visibility: "PUBLIC",
      categoryId: 3022951,
      variants: [{
        name: "Standard",
        price: { amount: 3.50, currency: "EUR" },
        chargeType: "ONE_TIME",
        deliveryType: "PRESET", 
        deliveryConfigurations: [config]
      }]
    };

    try {
      const res = await axios.post(`https://business-api.antistock.io/v1/dash/shops/${shopId}/products`, payload, {
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
      });
      require('fs').appendFileSync('configs_test.log', `SUCCESS with ${JSON.stringify(config)}! ID: ` + res.data.data.id + '\n');
    } catch (err) {
      require('fs').appendFileSync('configs_test.log', `FAILED with ${JSON.stringify(config)}: ` + (err.response ? JSON.stringify(err.response.data) : err.message) + '\n');
    }
  }
}

testConfigs();
