/**
 * Manual Review Types
 * Types for the compliance manual review dashboard
 */

export interface ManualReviewCase {
  id: string;
  applicantName: string;
  nationality: string;
  documentType: string;
  submittedAt: string;
  flagReason: string;
  flagDetails: string[];
  riskScore: number;
  recommendation: 'proceed' | 'hold' | 'reject';
  confidence: number;
  evidence: Evidence[];
  pastOutcomes: PastOutcomes;
  status: 'pending' | 'approved' | 'rejected' | 'hold';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Evidence {
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PastOutcomes {
  totalCases: number;
  cleared: number;
  rejected: number;
  falsePositiveRate: number;
  context: string;
}

export interface ReviewStatistics {
  last30Days: {
    total: number;
    cleared: number;
    rejected: number;
    pending: number;
    avgProcessingTime: string;
  };
  falsePositiveRate: number;
  accuracyRate: number;
}

export type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'hold';

