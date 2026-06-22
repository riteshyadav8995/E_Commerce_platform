const { GoogleGenAI } = require('@google/genai');
const prisma = require('../utils/prisma');

const fallbackModels = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

const chatWithAgent = async (req, res) => {
  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ message: 'Invalid chat history' });
    }

    // Initialize Gen AI SDK
    let ai;
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
      console.warn("GEMINI_API_KEY not found. Using mock AI service.");
      return res.json({ reply: "This is a mock response because GEMINI_API_KEY is not set. Please configure the API key to chat with the real LuxeStore Agent!" });
    }

    // Fetch dynamic context (active products)
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      select: {
        name: true,
        description: true,
        price: true,
        category: { select: { name: true } },
      }
    });

    let catalogContext = 'Current Catalog:\\n';
    products.forEach(p => {
      catalogContext += `- ${p.name} (${p.category?.name}): ₹${p.price}. ${p.description ? p.description.substring(0, 50) : ''}...\\n`;
    });

    const systemInstruction = `You are "LuxeStore Agent", a helpful, friendly, and professional AI customer support assistant exclusively for LuxeStore, an e-commerce platform.
Your primary role is to help users with shopping, product recommendations, troubleshooting, order inquiries, and general store guidance.

Here is our current product catalog data for you to use in your recommendations:
${catalogContext}

STRICT GUARDRAILS:
1. You MUST ONLY answer questions related to LuxeStore, e-commerce, our products, shopping, order issues, returns, or troubleshooting.
2. If the user asks about ANYTHING outside of this domain (e.g. coding, politics, general knowledge, math, other companies), you MUST immediately reply exactly with: "Sorry, I am trained to give answers only to relevant questions."
3. Never break character. Always be the LuxeStore Agent.`;

    const formattedContents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    let response;
    let lastError;
    for (const model of fallbackModels) {
      try {
        console.log(`Trying model: ${model}...`);
        response = await ai.models.generateContent({
          model: model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        break; // Success! Break out of the loop
      } catch (error) {
        console.warn(`Model ${model} failed:`, error?.message || error);
        lastError = error;
      }
    }

    if (!response) {
      throw lastError;
    }

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: 'Failed to communicate with AI agent', error: error.message, stack: error.stack });
  }
};

module.exports = { chatWithAgent };
