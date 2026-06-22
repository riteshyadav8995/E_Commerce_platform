const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const sendWhatsAppMessage = async (to, body) => {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log(`[MOCK WHATSAPP] To: ${to} | Message: ${body}`);
    return;
  }
  
  try {
    // Ensure country code for India if exactly 10 digits, strip non-numeric chars
    let formattedPhone = to.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error("WhatsApp API Error:", error?.response?.data || error.message);
  }
};

module.exports = {
  sendWhatsAppMessage,
};
