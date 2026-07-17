export interface Deal {
  id?: string;
  stakeholderId: string;
  assetId: string;
  proposalId?: string;
  stage: string;
  status: 'active' | 'pending_signing' | 'closed_won' | 'closed_lost';
  negotiatedPrice?: number;
  commissionRate?: number;
  commissionEGP?: number;
  signingEnvelope?: SigningEnvelope;
  feedbackAnalysis?: Record<string, unknown>;
  initiatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalMetadata {
  proposalId: string;
  dealId: string;
  assetId: string;
  leadId: string;
  version: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sentAt?: string;
  acceptedAt?: string;
}

export interface SigningEnvelope {
  envelopeId: string;
  status: 'created' | 'sent' | 'signed' | 'completed';
  signerEmail?: string;
  signerName?: string;
  createdAt: string;
  completedAt?: string;
}
