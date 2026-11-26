import { injectable } from 'inversify';
import { GoogleGenAI } from '@google/genai';
import {
  IAIService,
  AIChatHistoryItem,
  AIGenerationOptions,
} from '@/application/ports/services/IAIService';
import { ENV } from '@/config/env.config';
import { logger } from '@/infra/logger/logger';

@injectable()
export class GeminiAIService implements IAIService {
  private _ai: GoogleGenAI | null = null;
  private readonly _modelChain = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
  ];

  constructor() {
    if (ENV.GEMINI_API_KEY) {
      try {
        this._ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      } catch (err) {
        logger.error('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  private _getClient(): GoogleGenAI | null {
    if (!this._ai && ENV.GEMINI_API_KEY) {
      try {
        this._ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      } catch (err) {
        logger.error('Failed to initialize GoogleGenAI client on demand:', err);
      }
    }
    return this._ai;
  }

  private _getSystemInstruction(options?: AIGenerationOptions): string {
    if (options?.systemInstruction) {
      return options.systemInstruction;
    }

    const role = (options?.userRole || '').toUpperCase();
    const name = options?.userName || 'User';

    if (role === 'STUDENT') {
      return `You are EduCore AI Tutor, an empathetic, engaging, and highly knowledgeable academic mentor for students at EduCore School.
The student's name is ${name}.
Your guidelines:
1. Explain academic concepts clearly with relatable real-life analogies.
2. Break down complex math, science, and coding problems into step-by-step logic.
3. Use Socratic teaching: encourage the student to think and learn rather than just giving away full exam solutions.
4. Keep answers encouraging, structured with bullet points or numbered steps where helpful.
5. Format mathematical equations cleanly with readable formulas.`;
    }

    if (role === 'TEACHER') {
      return `You are EduCore Teacher Copilot, an expert instructional designer and pedagogical assistant for educators at EduCore School.
The teacher's name is ${name}.
Your guidelines:
1. Assist in creating detailed lesson plans, objectives, and structured lecture outlines.
2. Draft quiz questions, exams, multiple-choice items, and scoring rubrics.
3. Suggest differentiated learning strategies for diverse student needs.
4. Provide structured, professional, and ready-to-use curriculum material.`;
    }

    if (role === 'ADMIN') {
      return `You are EduCore AI Secretary, an administrative assistant for institutional leadership at EduCore School.
The administrator's name is ${name}.
Your guidelines:
1. Draft formal school circulars, executive summaries, parent announcements, and policy updates.
2. Maintain a professional, authoritative, and polite institutional tone.
3. Organize notices with clear dates, action items, and recipient guidelines.`;
    }

    return `You are EduCore AI Assistant, a helpful educational assistant for EduCore School management and learning portal.`;
  }

  async generateChatResponse(
    prompt: string,
    history: AIChatHistoryItem[] = [],
    options?: AIGenerationOptions
  ): Promise<string> {
    const client = this._getClient();

    if (!client || !ENV.GEMINI_API_KEY) {
      return 'The EduCore AI Assistant is currently in standby mode because the GEMINI_API_KEY is not set in the server environment. Please configure GEMINI_API_KEY in your backend .env file to enable live AI responses.';
    }

    const systemInstruction = this._getSystemInstruction(options);
    const contents: any[] = [];

    if (history && history.length > 0) {
      history.forEach((h) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    let lastError: any = null;

    for (const model of this._modelChain) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        logger.warn(`Model ${model} failed, trying fallback:`, err.message);
      }
    }

    logger.error('All Gemini models in fallback chain failed:', lastError);
    return `I encountered an issue processing your request: ${lastError?.message || 'Server busy'}. Please try again shortly.`;
  }

  async summarizeDiscussion(
    messages: Array<{ senderName: string; text: string }>
  ): Promise<string> {
    if (!messages.length) {
      return 'No messages found to summarize.';
    }

    const transcript = messages
      .map((m) => `${m.senderName}: ${m.text}`)
      .join('\n');

    const prompt = `Please summarize the key takeaways, decisions, and homework or action items from this school chat discussion in clear bullet points:\n\n${transcript}`;

    return this.generateChatResponse(prompt, [], {
      systemInstruction:
        'You are an educational summarizer. Summarize chat discussions concisely with bullet points highlighting key concepts, decisions, and homework mentioned.',
    });
  }
}
