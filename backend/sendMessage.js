require('dotenv').config();
const axios = require('axios');

async function sendWhatsApp() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "919798800286",
        type: "text",
        text: {
          body: "Hello from Inventory POS System 🚀"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

sendWhatsApp();
