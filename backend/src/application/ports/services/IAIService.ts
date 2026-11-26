export interface AIChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface AIGenerationOptions {
  userRole?: string;
  userName?: string;
  groupName?: string;
  systemInstruction?: string;
}

export interface IAIService {
  generateChatResponse(
    prompt: string,
    history?: AIChatHistoryItem[],
    options?: AIGenerationOptions
  ): Promise<string>;

  summarizeDiscussion(
    messages: Array<{ senderName: string; text: string }>
  ): Promise<string>;
}