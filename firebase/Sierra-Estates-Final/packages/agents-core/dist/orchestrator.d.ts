export interface OrchestratorConfig {
    apiKey?: string;
    defaultModel?: string;
    runCompletion?: (agentName: string, stage: string, systemPrompt: string, userPrompt: string) => Promise<string>;
}
export interface TaskResult {
    agentName: string;
    status: 'success' | 'failed';
    output: string;
    error?: string;
}
export declare class AgentOrchestrator {
    private genAI;
    private defaultModel;
    private runCompletionCustom?;
    constructor(config?: OrchestratorConfig);
    /**
     * Helper to execute completions, using custom callback or direct SDK
     */
    private executeCompletion;
    /**
     * Query all shared knowledge stored in Obedian Memory
     */
    getSharedKnowledge(): Promise<string>;
    /**
     * Add new knowledge to the shared memory pool
     */
    addSharedKnowledge(id: string, value: any, tags?: string[]): Promise<void>;
    /**
     * Executes a single agent task. The system prompt is automatically enriched
     * with the shared knowledge of all other agents from Obedian memory.
     */
    runAgentTask(agentName: string, taskDescription: string, additionalContext?: string): Promise<TaskResult>;
    /**
     * Coordinated pipeline execution. Orchestrates multiple agents in sequence.
     */
    orchestratePipeline(pipelineName: string, steps: Array<{
        agentName: string;
        taskDescription: string;
    }>, initialContext?: string): Promise<TaskResult[]>;
}
//# sourceMappingURL=orchestrator.d.ts.map