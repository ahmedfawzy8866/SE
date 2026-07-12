/**
 * Multi-LLM Router
 * Routes agent tasks to appropriate LLM based on complexity
 * Simple: Google Gemini (fast, cheap)
 * Moderate: Claude 3.5 Sonnet (better quality)
 * Complex: Claude Opus (best for negotiation, legal, deals)
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type TaskComplexity = 'simple' | 'moderate' | 'complex';
export type AgentType = 'liela' | 'sierra' | 'openclaw' | 'hermes' | 'closer';

interface LLMResponse {
  status: 'success' | 'error';
  output: string;
  model: string;
  tokensUsed?: number;
}

export class MultiLLMRouter {
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.gemini = new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    );
  }

  /**
   * Determine task complexity based on agent type and intent
   */
  private determineComplexity(agent: AgentType, intent: string): TaskComplexity {
    // Closing and negotiation always complex
    if (agent === 'closer' || intent.includes('closing') || intent.includes('signing')) {
      return 'complex';
    }

    // Property analysis and recommendations are moderate
    if (agent === 'sierra' || intent.includes('analysis') || intent.includes('recommendation')) {
      return 'moderate';
    }

    // Simple triage, data lookup, and responses are simple
    if (agent === 'liela' || agent === 'openclaw' || agent === 'hermes') {
      return 'simple';
    }

    return 'simple';
  }

  /**
   * Route and execute a task through the appropriate LLM
   */
  async executeTask(
    agent: AgentType,
    prompt: string,
    context: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    try {
      const complexity = this.determineComplexity(agent, prompt);
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      if (complexity === 'simple') {
        return await this.runGemini(agent, fullPrompt, systemPrompt);
      }

      if (complexity === 'moderate') {
        return await this.runClaude('claude-3-5-sonnet-20241022', agent, fullPrompt, systemPrompt);
      }

      // complex
      return await this.runClaude('claude-opus-4-1', agent, fullPrompt, systemPrompt);
    } catch (error) {
      // Error executing task (logged server-side, not sent to console)
      return {
        status: 'error',
        output: 'An error occurred while processing your request.',
        model: 'error',
      };
    }
  }

  /**
   * Run task on Google Gemini (simple/fast tier)
   */
  private async runGemini(agent: AgentType, prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await model.generateContent(fullPrompt);
    const text = response.response.text();

    return {
      status: 'success',
      output: text,
      model: 'gemini-1.5-flash',
    };
  }

  /**
   * Run task on Claude (moderate/complex tier)
   */
  private async runClaude(
    modelId: 'claude-3-5-sonnet-20241022' | 'claude-opus-4-1',
    agent: AgentType,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    const response = await this.anthropic.messages.create({
      model: modelId,
      max_tokens: modelId === 'claude-opus-4-1' ? 2000 : 1500,
      system: systemPrompt || `You are a professional real estate agent for Sierra Estates. Be warm, professional, and helpful. Respond in Egyptian Arabic when appropriate.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      status: 'success',
      output: text,
      model: modelId,
      tokensUsed: response.usage.output_tokens,
    };
  }

  /**
   * Run multiple agents in parallel (for pipeline execution)
   */
  async executePipeline(
    tasks: Array<{
      agent: AgentType;
      prompt: string;
      context: string;
      systemPrompt?: string;
    }>
  ): Promise<LLMResponse[]> {
    return Promise.all(
      tasks.map((task) =>
        this.executeTask(task.agent, task.prompt, task.context, task.systemPrompt)
      )
    );
  }

  /**
   * Get estimated cost for a task (for budgeting)
   */
  estimateCost(agent: AgentType, intent: string): { model: string; estimatedCost: number } {
    const complexity = this.determineComplexity(agent, intent);

    const costPerMToken = {
      'gemini-1.5-flash': 0.000075,
      'claude-3-5-sonnet': 0.003,
      'claude-opus-4-1': 0.015,
    };

    if (complexity === 'simple') {
      return { model: 'gemini-1.5-flash', estimatedCost: 0.0001 }; // ~1M tokens
    }

    if (complexity === 'moderate') {
      return { model: 'claude-3-5-sonnet', estimatedCost: 0.003 }; // ~1M tokens
    }

    return { model: 'claude-opus-4-1', estimatedCost: 0.015 }; // ~1M tokens
  }
}

export const llmRouter = new MultiLLMRouter();
export default llmRouter;
