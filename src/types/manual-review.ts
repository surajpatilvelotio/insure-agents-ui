/**
 * Manual Review Types
 * Types for the compliance manual review dashboard
 */

export interface VerificationResults {
  documentAuthenticity: 'Pass' | 'Fail' | 'Pending';
  faceMatchConfidence: number;
  liveness: 'Pass' | 'Fail' | 'Pending';
  identityConfidence: 'High' | 'Medium' | 'Low';
}

export interface ScreeningResults {
  sanctions: 'No Hit' | 'Hit' | 'Possible Hit';
  pep: 'No' | 'Yes' | 'Related';
  watchlist: 'Clear' | 'Hit' | 'Possible Hit';
}

export interface EvidenceDocument {
  type: 'passport' | 'visa' | 'id_card' | 'live_photo' | 'selfie' | 'other';
  label: string;
  fileName: string;
  imageUrl: string;
}

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
  verificationResults: VerificationResults;
  screeningResults: ScreeningResults;
  documents: EvidenceDocument[];
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

