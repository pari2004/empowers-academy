export type AiRole = "system" | "user" | "assistant";

export type AiMessage = { role: AiRole; content: string };

export type AiCompletionParams = {
  system?: string;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Ask the provider to return strictly valid JSON (no prose, no markdown fences). */
  jsonMode?: boolean;
};

export type AiCompletionResult = {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  model: string;
};

export type AiProviderName = "claude" | "openai" | "gemini";

export interface AiProviderAdapter {
  readonly name: AiProviderName;
  readonly model: string;
  complete(params: AiCompletionParams): Promise<AiCompletionResult>;
}

export class AiNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`AI provider "${provider}" is not configured — missing API key`);
    this.name = "AiNotConfiguredError";
  }
}
