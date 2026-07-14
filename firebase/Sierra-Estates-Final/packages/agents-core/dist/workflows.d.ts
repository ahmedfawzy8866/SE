import { AgentOrchestrator, TaskResult } from './orchestrator';
export declare class AgentWorkflows {
    private orchestrator;
    constructor(orchestrator: AgentOrchestrator);
    /**
     * API Design & Implementation Workflow
     */
    runApiWorkflow(taskDescription: string): Promise<TaskResult[]>;
    /**
     * Debugging and Bugfixing Workflow
     */
    runDebugWorkflow(taskDescription: string): Promise<TaskResult[]>;
    /**
     * Plan & Architecture Workflow
     */
    runPlanWorkflow(taskDescription: string): Promise<TaskResult[]>;
    /**
     * Security Audit Workflow
     */
    runSecurityWorkflow(taskDescription: string): Promise<TaskResult[]>;
    /**
     * Quality Audit & Compliance Check
     */
    runAuditWorkflow(taskDescription: string): Promise<TaskResult[]>;
    /**
     * UI/UX Enhancement Workflow
     */
    runUiUxWorkflow(taskDescription: string): Promise<TaskResult[]>;
}
//# sourceMappingURL=workflows.d.ts.map