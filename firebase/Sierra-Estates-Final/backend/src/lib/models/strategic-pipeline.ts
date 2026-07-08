export interface StrategicPipelineEntry {
  id?: string;
  leadId: string;
  assetId: string;
  stage: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCloseDate?: string;
  estimatedCommission?: number;
  assignedAgent?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicProposalMetadata {
  proposalId: string;
  pipelineEntryId: string;
  version: number;
  aiGeneratedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}
