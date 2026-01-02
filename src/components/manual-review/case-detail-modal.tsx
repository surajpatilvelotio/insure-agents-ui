'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  Shield,
  TrendingUp,
  User,
  Calendar,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Minus,
  History,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualReviewCase, Evidence } from '@/types/manual-review';

interface CaseDetailModalProps {
  reviewCase: ManualReviewCase;
  onClose: () => void;
  onAction: (caseId: string, action: 'approved' | 'rejected' | 'hold', notes?: string) => void;
}

export function CaseDetailModal({ reviewCase, onClose, onAction }: CaseDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | 'hold' | null>(null);

  const handleAction = (action: 'approved' | 'rejected' | 'hold') => {
    if (reviewCase.status !== 'pending') return;
    setConfirmAction(action);
  };

  const executeAction = () => {
    if (confirmAction) {
      onAction(reviewCase.id, confirmAction, notes);
      setConfirmAction(null);
      setNotes('');
    }
  };

  const getEvidenceIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-emerald-500" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />;
      case 'neutral': return <Minus className="w-4 h-4 text-amber-500" />;
    }
  };

  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case 'proceed':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          color: 'border-emerald-500/30 bg-emerald-500/5',
          text: 'Proceed with Approval',
          description: 'AI analysis indicates this is likely a false positive. Recommend clearing this application.',
        };
      case 'hold':
        return {
          icon: <Clock className="w-6 h-6 text-amber-500" />,
          color: 'border-amber-500/30 bg-amber-500/5',
          text: 'Hold for Review',
          description: 'Additional verification recommended before making a final decision.',
        };
      case 'reject':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          color: 'border-red-500/30 bg-red-500/5',
          text: 'Reject Application',
          description: 'Multiple risk indicators suggest this application should be rejected.',
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-muted-foreground" />,
          color: 'border-border bg-muted/50',
          text: 'Unknown',
          description: '',
        };
    }
  };

  const recommendation = getRecommendationDetails(reviewCase.recommendation);
  const isAlreadyReviewed = reviewCase.status !== 'pending';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Case Review: {reviewCase.id}</h2>
                <p className="text-sm text-muted-foreground">{reviewCase.applicantName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground">{reviewCase.applicantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="text-sm font-medium text-foreground">{reviewCase.nationality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Document</p>
                    <p className="text-sm font-medium text-foreground">{reviewCase.documentType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(reviewCase.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flag Reason */}
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-500">Why Flagged</p>
                    <p className="text-sm text-foreground mt-1">{reviewCase.flagReason}</p>
                    <ul className="mt-2 space-y-1">
                      {reviewCase.flagDetails.map((detail, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className={cn('p-4 border rounded-xl', recommendation.color)}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-card rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">AI Recommendation</p>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {(reviewCase.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {recommendation.icon}
                      <span className="text-lg font-bold text-foreground">{recommendation.text}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evidence Analysis
                </h3>
                <div className="space-y-2">
                  {reviewCase.evidence.map((evidence, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        evidence.type === 'positive' && 'bg-emerald-500/5 border-emerald-500/20',
                        evidence.type === 'negative' && 'bg-red-500/5 border-red-500/20',
                        evidence.type === 'neutral' && 'bg-amber-500/5 border-amber-500/20'
                      )}
                    >
                      {getEvidenceIcon(evidence.type)}
                      <p className="text-sm text-foreground">{evidence.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Historical Context */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <History className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">Comparable Past Outcomes</p>
                    <p className="text-sm text-muted-foreground mb-3">{reviewCase.pastOutcomes.context}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-card rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{reviewCase.pastOutcomes.totalCases}</p>
                        <p className="text-xs text-muted-foreground">Similar Cases</p>
                      </div>
                      <div className="text-center p-3 bg-card rounded-lg">
                        <p className="text-2xl font-bold text-emerald-500">{reviewCase.pastOutcomes.cleared}</p>
                        <p className="text-xs text-muted-foreground">Cleared</p>
                      </div>
                      <div className="text-center p-3 bg-card rounded-lg">
                        <p className="text-2xl font-bold text-red-500">{reviewCase.pastOutcomes.rejected}</p>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">
                        <strong>{(reviewCase.pastOutcomes.falsePositiveRate * 100).toFixed(0)}%</strong> false positive rate in this context
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Already Reviewed Info */}
              {isAlreadyReviewed && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-400">
                    <strong>Reviewed by:</strong> {reviewCase.reviewedBy} on{' '}
                    {reviewCase.reviewedAt ? new Date(reviewCase.reviewedAt).toLocaleString() : 'N/A'}
                  </p>
                  {reviewCase.reviewNotes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {reviewCase.reviewNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Notes Input */}
              {!isAlreadyReviewed && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Review Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for this review decision..."
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {!isAlreadyReviewed && (
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              {confirmAction ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Confirm <strong className="text-foreground">{confirmAction}</strong> action?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeAction}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                        confirmAction === 'approved' && 'bg-emerald-500 text-white hover:bg-emerald-600',
                        confirmAction === 'rejected' && 'bg-red-500 text-white hover:bg-red-600',
                        confirmAction === 'hold' && 'bg-amber-500 text-white hover:bg-amber-600'
                      )}
                    >
                      Confirm
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleAction('rejected')}
                    className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction('hold')}
                    className="px-4 py-2 text-sm font-medium bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Hold for Review
                  </button>
                  <button
                    onClick={() => handleAction('approved')}
                    className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

