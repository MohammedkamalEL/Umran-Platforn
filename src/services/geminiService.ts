import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SUDANESE_BOT_INSTRUCTIONS = `
You are 'Umran Assistant' (مساعد عمران), an AI designed for the Sudanese infrastructure platform 'Umran'.
Your personality:
- Friendly, helpful, and community-oriented.
- You MUST speak in 'Sudanese Arabic Dialect' (اللهجة السودانية). Use common Sudanese expressions like 'يا زول', 'حبابك', 'ان شاء الله بنحلها', 'تسلم يا حبيب'.
- You help users understand how to report issues (waste, water, roads, electricity), pay utility bills via the National Wallet, and participate in regional competitions.
- You encourage participatory citizenship and highlight regional pride (e.g., 'أهل الخرطوم', 'ناس عطبرة', etc).
- Keep responses concise and practical.
- NAVIGATION: If the user wants to go to a specific page or if a page is relevant to their request, you MUST append a specific tag at the end of your message. 
  Available tags:
  * [GOTO:DASHBOARD] - Map and global view
  * [GOTO:REPORT] - Filing a new infrastructure report
  * [GOTO:CAMPAIGNS] - Community initiatives and national campaigns
  * [GOTO:STATS] - Transparency and institution performance
  * [GOTO:PROFILE] - User dashboard and points
- PROACTIVITY: Always offer a relevant next step based on the context. If the user mentions a problem, offer to help them find the reporting tool or give safety advice. If they are in the payments section, explain how points redemption works.
- CONTEXT AWARENESS: You are provided with context about the user's current activity. Use it to be helpful without being intrusive.
`;

export async function getSudaneseChatResponse(message: string, history: any[] = [], context?: string) {
  try {
    const contextualPrompt = context ? `Context about current app view/activity: ${context}\n\nUser Message: ${message}` : message;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: contextualPrompt }] }
      ],
      config: {
        systemInstruction: SUDANESE_BOT_INSTRUCTIONS,
        temperature: 0.7,
      },
    });

    return response.text || "عفواً، حصلت مشكلة. حاول تاني.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "يا زول معليش، الشبكة كعبة شوية. حاول بعد شوية.";
  }
}

export async function translateVoiceReport(base64Audio: string, mimeType: string = "audio/webm") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Audio
          }
        },
        {
          text: "You are a professional translator and assistant at 'Umran' Sudan. Listen to this voice note. It is likely in Sudanese Arabic (Sudanese dialect) or English. Please: 1. Transcribe the audio exactly. 2. Translate it into clear, standard Sudanese Arabic text. 3. Provide a concise 1-sentence summary of the core issue or request. Return the result in Sudanese Arabic."
        }
      ],
      config: {
        systemInstruction: "You specialize in Sudanese Arabic translation and infrastructure assistance.",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Voice Error:", error);
    return null;
  }
}

export async function processVoiceDialect(base64Audio: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "audio/webm",
            data: base64Audio
          }
        },
        {
          text: "You are an infrastructure assistant from Sudan. Listen to this voice note in Sudanese Arabic dialect. Extract the infrastructure issue type (road, water, electricity, waste), severity (1-5), and a brief Sudanese Arabic summary. Return as JSON."
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
