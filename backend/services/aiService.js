const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  // If no API key is provided, the SDK will throw, so we mock if missing
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("GEMINI_API_KEY not found. Using mock AI service.");
  }
} catch (e) {
  console.warn("Error initializing GenAI. Using mock AI service.", e);
}

const fallbackModels = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

const generateWithFallback = async (prompt) => {
  let lastError;
  for (const model of fallbackModels) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.warn(`Model ${model} failed:`, error?.message || error);
      lastError = error;
    }
  }
  throw lastError;
};

const generateProductDescription = async (name, category) => {
  if (!ai) {
    return `This is a mock description for ${name} in the ${category} category. Please configure GEMINI_API_KEY to generate real descriptions.`;
  }
  try {
    const prompt = `Write a professional and concise product description for an E-commerce store. 
Product Name: ${name}
Category: ${category}
The description should highlight key benefits and be suitable for customers. Max 3 sentences.`;
    
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "";
  }
};

const generateExecutiveSummary = async (statsJson) => {
  if (!ai) {
    return "Mock AI Summary: Revenue is stable. Ensure top products are well-stocked. Add GEMINI_API_KEY for real insights.";
  }
  try {
    const prompt = `You are an expert E-Commerce Data Analyst. Review the following JSON stats for my store and provide a short, punchy 3-sentence executive summary highlighting the most critical insights (e.g., revenue trends, low stock warnings, top performing categories).
Stats: ${JSON.stringify(statsJson)}`;
    
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Unable to generate summary at this time.";
  }
};

module.exports = {
  generateProductDescription,
  generateExecutiveSummary,
};
