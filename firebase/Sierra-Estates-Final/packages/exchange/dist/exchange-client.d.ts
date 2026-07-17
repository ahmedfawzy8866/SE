/**
 * SIERRA ESTATES — EXCHANGE SHEET CLIENT
 * Central data contract between Admin UI, Agents, and Workflows
 * Uses Firestore /exchange collection as the shared message bus
 */
import { Timestamp, type Unsubscribe } from 'firebase/firestore';
export declare const db: import("@firebase/firestore").Firestore;
export type ExchangeType = 'agent_task' | 'workflow_run' | 'admin_signal' | 'crm_event' | 'lead_update' | 'property_match' | 'proposal_ready';
export type ExchangeStatus = 'pending' | 'running' | 'done' | 'error' | 'cancelled';
export type ExchangeSource = 'admin' | 'agent' | 'workflow' | 'webhook' | 'system';
export interface ExchangeRecord {
    id: string;
    type: ExchangeType;
    source: ExchangeSource;
    status: ExchangeStatus;
    payload: Record<string, unknown>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    agentId?: string;
    workflowId?: string;
    leadId?: string;
    propertyId?: string;
    userId?: string;
    result?: unknown;
    error?: string;
    progress?: number;
    stepName?: string;
}
export type ExchangeCreateInput = Omit<ExchangeRecord, 'id' | 'createdAt' | 'updatedAt'>;
/**
 * Write a new record to the Exchange Sheet.
 * Used by: Admin UI, Agents, Workflows, Webhooks
 */
export declare function writeExchange(input: ExchangeCreateInput): Promise<string>;
/**
 * Update the status and/or result of an existing exchange record.
 * Used by agents/workflows to report progress or completion.
 */
export declare function updateExchange(id: string, updates: Partial<Pick<ExchangeRecord, 'status' | 'result' | 'error' | 'progress' | 'stepName' | 'agentId' | 'workflowId'>>): Promise<void>;
/**
 * Admin triggers a workflow or agent task from the Admin Hub.
 */
export declare function sendAdminSignal(signal: {
    action: string;
    targetAgentId?: string;
    targetWorkflowId?: string;
    payload?: Record<string, unknown>;
}): Promise<string>;
/**
 * Subscribe to live Exchange Sheet updates.
 * Returns unsubscribe function — call it on component unmount.
 */
export declare function subscribeExchange(options: {
    type?: ExchangeType;
    status?: ExchangeStatus;
    limitTo?: number;
    onData: (records: ExchangeRecord[]) => void;
    onError?: (error: Error) => void;
}): Unsubscribe;
/**
 * Subscribe to ALL exchange records (used by the Exchange Sheet tab in Admin Hub).
 */
export declare function subscribeAllExchange(onData: (records: ExchangeRecord[]) => void): Unsubscribe;
/**
 * Subscribe to active agent tasks only.
 */
export declare function subscribeAgentTasks(onData: (records: ExchangeRecord[]) => void): Unsubscribe;
/**
 * Subscribe to active workflow runs only.
 */
export declare function subscribeWorkflowRuns(onData: (records: ExchangeRecord[]) => void): Unsubscribe;
//# sourceMappingURL=exchange-client.d.ts.map