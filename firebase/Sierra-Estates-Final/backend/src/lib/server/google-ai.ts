import { GoogleGenerativeAI } from '@google/generative-ai';

const PRIMARY_MODEL  = 'gemini-1.5-pro-latest';
const FALLBACK_MODEL = 'gemini-1.5-flash-latest';

export class GoogleAIService {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (this.client) return this.client;
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not set');
    this.client = new GoogleGenerativeAI(apiKey);
    return this.client;
  }

  constructor() {}

  async generateContent(prompt: string, modelName = PRIMARY_MODEL): Promise<string> {
    try {
      const client = this.getClient();
      const model  = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (modelName !== FALLBACK_MODEL) {
        console.warn(`[GoogleAI] ${modelName} failed, falling back to ${FALLBACK_MODEL}:`, err);
        return this.generateContent(prompt, FALLBACK_MODEL);
      }
      throw err;
    }
  }

  async chatCompletions(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    modelName = PRIMARY_MODEL
  ): Promise<string> {
    try {
      const client = this.getClient();
      const model = client.getGenerativeModel({ model: modelName });
      const chat  = model.startChat({
        history: messages.slice(0, -1).map(m => ({
          role:  m.role,
          parts: [{ text: m.content }],
        })),
      });
      const last   = messages[messages.length - 1];
      const result = await chat.sendMessage(last.content);
      return result.response.text();
    } catch (err) {
      if (modelName !== FALLBACK_MODEL) {
        console.warn(`[GoogleAI] Chat ${modelName} failed, falling back:`, err);
        return this.chatCompletions(messages, FALLBACK_MODEL);
      }
      throw err;
    }
  }
}
