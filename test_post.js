const axios = require('axios');

async function testPost() {
  const payload = {
    title: "Spotify Premium 1 Month",
    description: "Enjoy 1 month of Spotify Premium. Ad-free music listening, offline playback, and more.",
    price: 3.50,
    image: "https://example.com/spotify.png",
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3Mzc2MzY5IiwiY3VzdG9tZXIiOiJGYWxzZSIsImp0aSI6IjNiN2M1OGVlLWVmZTQtNDNlMi1hNWQwLTUxMTVkODY2OWMzNCIsImV4cCI6MjA5MDM5Nzk4Nn0.Cztd92KE5hTe3WQipZ2f2QAo4OSX4mEf3XQF8xZjl2o",
    shopId: "0fe55f4b-ab58-465a-a7a0-df8d5c452037",
    categoryId: "3022951" // fallback category manually selected
  };

  try {
    console.log("Testing POST to http://localhost:3000/api/post...");
    const res = await axios.post('http://localhost:3000/api/post', payload);
    console.log("Success!", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

testPost();
