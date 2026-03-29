const axios = require('axios');

async function testCategories() {
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o";
  const shopId = "0fe55f4b-ab58-465a-a7a0-df8d5c452037";
  
  try {
    console.log("Fetching http://localhost:3000/api/categories...");
    const res = await axios.get(`http://localhost:3000/api/categories?apiKey=${apiKey}&shopId=${shopId}`);
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testCategories();
