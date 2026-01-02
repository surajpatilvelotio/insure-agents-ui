/**
 * Mock Data for Manual Review Dashboard
 * Contains flagged KYC applications requiring compliance officer review
 */

import type { ManualReviewCase, ReviewStatistics } from '@/types/manual-review';

export const mockReviewCases: ManualReviewCase[] = [
  {
    id: 'MR-001',
    applicantName: 'ANAND KUMAR',
    nationality: 'INDIAN',
    documentType: 'Passport + Visa',
    submittedAt: '2025-12-30T10:30:00Z',
    flagReason: 'Possible hit: name overlap + foreign watchlist + low confidence match',
    flagDetails: [
      'Name similarity detected with watchlist entry',
      'Foreign national requiring additional verification',
      'Low confidence match score (below threshold)',
    ],
    riskScore: 65,
    recommendation: 'proceed',
    confidence: 0.93,
    evidence: [
      { type: 'positive', description: 'Name similarity only 78% with watchlist entry "Anand Kumari"' },
      { type: 'positive', description: 'Different DOB from watchlist entry (1985 vs 1972)' },
      { type: 'positive', description: 'Different nationality from flagged entity (India vs Pakistan)' },
      { type: 'positive', description: 'MyInfo verified identity matches government records' },
      { type: 'neutral', description: 'First-time applicant with no prior history' },
    ],
    pastOutcomes: {
      totalCases: 100,
      cleared: 92,
      rejected: 8,
      falsePositiveRate: 0.92,
      context: 'In similar context (foreign national + name overlap + low confidence), 92% were false positives',
    },
    status: 'pending',
  },
  {
    id: 'MR-002',
    applicantName: 'CHEN WEI MING',
    nationality: 'CHINESE',
    documentType: 'Passport + Work Permit',
    submittedAt: '2025-12-30T09:15:00Z',
    flagReason: 'PEP association detected + high-value transaction pattern',
    flagDetails: [
      'Politically Exposed Person (PEP) family member match',
      'Employment at government-linked entity',
      'Recent high-value insurance applications',
    ],
    riskScore: 78,
    recommendation: 'hold',
    confidence: 0.72,
    evidence: [
      { type: 'negative', description: 'Father listed as provincial government official in Guangdong' },
      { type: 'negative', description: 'Multiple high-value policies applied within 30 days' },
      { type: 'neutral', description: 'Works for Singapore subsidiary of Chinese state enterprise' },
      { type: 'positive', description: 'Valid employment pass with 3-year history in Singapore' },
      { type: 'positive', description: 'Clean financial history in Singapore banking system' },
    ],
    pastOutcomes: {
      totalCases: 45,
      cleared: 28,
      rejected: 17,
      falsePositiveRate: 0.62,
      context: 'PEP family association cases have 62% false positive rate historically',
    },
    status: 'pending',
  },
  {
    id: 'MR-003',
    applicantName: 'VIKTOR PETROV',
    nationality: 'RUSSIAN',
    documentType: 'Passport + Visa',
    submittedAt: '2025-12-29T16:45:00Z',
    flagReason: 'Sanctions list partial match + enhanced due diligence required',
    flagDetails: [
      'Partial name match with OFAC sanctions list',
      'Enhanced due diligence jurisdiction',
      'Large premium payment from overseas account',
    ],
    riskScore: 85,
    recommendation: 'reject',
    confidence: 0.45,
    evidence: [
      { type: 'negative', description: 'Name 89% similar to sanctioned individual "Viktor Petrov Ivanov"' },
      { type: 'negative', description: 'Payment source from foreign bank requiring enhanced scrutiny' },
      { type: 'negative', description: 'Unable to verify employment through independent sources' },
      { type: 'neutral', description: 'Valid Singapore tourist visa' },
      { type: 'positive', description: 'Different passport number and DOB from sanctioned individual' },
    ],
    pastOutcomes: {
      totalCases: 23,
      cleared: 8,
      rejected: 15,
      falsePositiveRate: 0.35,
      context: 'Sanctions list matches with >85% similarity have 35% false positive rate',
    },
    status: 'pending',
  },
  {
    id: 'MR-004',
    applicantName: 'SARAH TAN MEI LING',
    nationality: 'SINGAPOREAN',
    documentType: 'NRIC',
    submittedAt: '2025-12-29T14:20:00Z',
    flagReason: 'Document anomaly detected + address verification failed',
    flagDetails: [
      'NRIC photo quality below threshold',
      'Registered address not found in postal database',
      'MyInfo data mismatch on address field',
    ],
    riskScore: 42,
    recommendation: 'proceed',
    confidence: 0.88,
    evidence: [
      { type: 'positive', description: 'MyInfo identity verified successfully' },
      { type: 'positive', description: 'NRIC number format valid and matches government records' },
      { type: 'neutral', description: 'Address is a new development - postal database not yet updated' },
      { type: 'positive', description: 'Bank account verification successful' },
      { type: 'positive', description: 'Employment verified with CPF records' },
    ],
    pastOutcomes: {
      totalCases: 156,
      cleared: 148,
      rejected: 8,
      falsePositiveRate: 0.95,
      context: 'Singapore citizens with address-only issues are 95% false positives',
    },
    status: 'pending',
  },
  {
    id: 'MR-005',
    applicantName: 'JAMES PETER WONG',
    nationality: 'MALAYSIAN',
    documentType: 'Passport',
    submittedAt: '2025-12-28T11:00:00Z',
    flagReason: 'Fraud indicator: multiple applications from same device',
    flagDetails: [
      'Device fingerprint matches 3 other applications',
      'Rapid succession of applications within 24 hours',
      'Different names but same contact details',
    ],
    riskScore: 92,
    recommendation: 'reject',
    confidence: 0.89,
    evidence: [
      { type: 'negative', description: 'Same device used for applications under 3 different names' },
      { type: 'negative', description: 'Email domain is known disposable email provider' },
      { type: 'negative', description: 'Phone number registered less than 7 days ago' },
      { type: 'negative', description: 'IP address from known VPN service' },
      { type: 'neutral', description: 'Passport document appears authentic' },
    ],
    pastOutcomes: {
      totalCases: 34,
      cleared: 2,
      rejected: 32,
      falsePositiveRate: 0.06,
      context: 'Device-linked multi-account fraud patterns have only 6% false positive rate',
    },
    status: 'pending',
  },
  {
    id: 'MR-006',
    applicantName: 'PRIYA SHARMA',
    nationality: 'INDIAN',
    documentType: 'Passport + Employment Pass',
    submittedAt: '2025-12-28T09:30:00Z',
    flagReason: 'Income verification discrepancy',
    flagDetails: [
      'Declared income differs from employment verification',
      'Recent job change not reflected in documents',
    ],
    riskScore: 38,
    recommendation: 'proceed',
    confidence: 0.91,
    evidence: [
      { type: 'positive', description: 'Employment Pass valid and matches declaration' },
      { type: 'positive', description: 'Previous employer confirmed employment dates' },
      { type: 'neutral', description: 'Income difference due to recent promotion (within 60 days)' },
      { type: 'positive', description: 'Bank statements show consistent income deposits' },
      { type: 'positive', description: 'Clean credit history with major Singapore banks' },
    ],
    pastOutcomes: {
      totalCases: 89,
      cleared: 82,
      rejected: 7,
      falsePositiveRate: 0.92,
      context: 'Income discrepancies with valid employment history are 92% false positives',
    },
    status: 'approved',
    reviewedBy: 'Rachel Ng Wei Lin',
    reviewedAt: '2025-12-28T15:45:00Z',
    reviewNotes: 'Income discrepancy explained by recent promotion. All other checks passed.',
  },
  {
    id: 'MR-007',
    applicantName: 'ALEX JOHNSON',
    nationality: 'AMERICAN',
    documentType: 'Passport',
    submittedAt: '2025-12-27T14:00:00Z',
    flagReason: 'FATCA reporting requirement + high-value policy',
    flagDetails: [
      'US person requiring FATCA compliance',
      'High-value life insurance application (>$500k)',
      'Source of funds verification required',
    ],
    riskScore: 55,
    recommendation: 'hold',
    confidence: 0.76,
    evidence: [
      { type: 'neutral', description: 'FATCA documentation incomplete - W-9 form pending' },
      { type: 'positive', description: 'Source of funds: verified sale of property in California' },
      { type: 'positive', description: 'US tax returns provided for last 3 years' },
      { type: 'neutral', description: 'Awaiting IRS verification response' },
      { type: 'positive', description: 'Clean background check from US authorities' },
    ],
    pastOutcomes: {
      totalCases: 67,
      cleared: 58,
      rejected: 9,
      falsePositiveRate: 0.87,
      context: 'US persons with pending FATCA docs are cleared 87% of the time',
    },
    status: 'hold',
    reviewedBy: 'Marcus Tan Keng Huat',
    reviewedAt: '2025-12-27T16:30:00Z',
    reviewNotes: 'Holding pending FATCA W-9 form submission. Applicant notified.',
  },
  {
    id: 'MR-008',
    applicantName: 'LIM BOON HENG',
    nationality: 'SINGAPOREAN',
    documentType: 'NRIC',
    submittedAt: '2025-12-26T10:15:00Z',
    flagReason: 'Adverse media mention detected',
    flagDetails: [
      'Name appears in news article about corporate fraud investigation',
      'Article mentions company where applicant was employed',
    ],
    riskScore: 72,
    recommendation: 'proceed',
    confidence: 0.81,
    evidence: [
      { type: 'positive', description: 'Applicant was not named as subject of investigation' },
      { type: 'positive', description: 'Left company 2 years before investigation started' },
      { type: 'positive', description: 'Current employer provides positive reference' },
      { type: 'positive', description: 'No regulatory action or charges against applicant' },
      { type: 'neutral', description: 'News article mentions company name only, not applicant directly' },
    ],
    pastOutcomes: {
      totalCases: 43,
      cleared: 38,
      rejected: 5,
      falsePositiveRate: 0.88,
      context: 'Adverse media matches on company (not individual) are 88% false positives',
    },
    status: 'approved',
    reviewedBy: 'Rachel Ng Wei Lin',
    reviewedAt: '2025-12-26T14:00:00Z',
    reviewNotes: 'Media mention relates to former employer, not applicant. No direct involvement.',
  },
];

export const mockStatistics: ReviewStatistics = {
  last30Days: {
    total: 100,
    cleared: 92,
    rejected: 8,
    pending: 5,
    avgProcessingTime: '2.4 hours',
  },
  falsePositiveRate: 0.92,
  accuracyRate: 0.96,
};

// Helper function to get pending cases count
export function getPendingCount(): number {
  return mockReviewCases.filter(c => c.status === 'pending').length;
}

// Helper function to filter cases by status
export function getCasesByStatus(status: string): ManualReviewCase[] {
  if (status === 'all') return mockReviewCases;
  return mockReviewCases.filter(c => c.status === status);
}

