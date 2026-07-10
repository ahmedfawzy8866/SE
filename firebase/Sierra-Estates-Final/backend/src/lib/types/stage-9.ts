/**
 * Stage 9 — Closer Agent Types
 * Deal finalization and signing workflow
 */

export interface Deal {
  id?: string;
  stakeholderId: string;
  assetId: string;
  proposalId?: string;
  stage: 'S9_initiated' | 'S9_finalized' | 'S9_signing' | 'S10_complete';
  negotiatedPrice?: number;
  commissionRate?: number;
  commissionEGP?: number;
  status: 'active' | 'pending_signing' | 'closed_won' | 'closed_lost';
  createdAt: string;
  updatedAt: string;
}

export interface ProposalMetadata {
  proposalId: string;
  dealId: string;
  assetId: string;
  stakeholderId: string;
  version: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sentAt?: string;
  acceptedAt?: string;
}

export interface SigningEnvelope {
  envelopeId: string;
  dealId: string;
  status: 'created' | 'sent' | 'signed' | 'completed';
  signerEmail?: string;
  signerName?: string;
  documentUrl?: string;
  createdAt: string;
  completedAt?: string;
}
