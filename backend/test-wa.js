require('dotenv').config();
const { sendWhatsAppMessage } = require('./services/whatsappService');

async function test() {
  console.log("Token:", process.env.WHATSAPP_TOKEN ? "Exists" : "Missing");
  await sendWhatsAppMessage('9798800286', "Test message from backend integration!");
}

test();
