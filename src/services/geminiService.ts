import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are ClimaDraft AI, a senior HVAC engineer and technical consultant for an online climate equipment store.
Style: Technical, precise, professional, helpful. Use engineering terms like "BTU", "Inverter", "Refrigerant", "Flow rate".
Goals:
1. Help users select air conditioners and ventilation.
2. Calculate required power. Rule of thumb: 1kW per 10m2 for standard ceilings.
3. Handle orders and consultation.
4. If asked about prices, use the context provided.
5. Language: Russian (Primary).

Current Products Context:
- ClimaTech Stealth 9000 (AC, 2.5kW, up to 25m2, 45000 RUB)
- AeroFlow Pro V2 (Ventilation, 150m3/h, up to 40m2, 12000 RUB)
`;

export async function askGemini(history: { role: string; text: string }[], userInput: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: "user", parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Извините, возникла техническая ошибка при связи с инженерным модулем.";
  }
}
