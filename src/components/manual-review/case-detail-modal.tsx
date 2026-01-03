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
  ThumbsUp,
  ThumbsDown,
  Minus,
  History,
  Sparkles,
  Image as ImageIcon,
  User,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualReviewCase, Evidence, EvidenceDocument } from '@/types/manual-review';

interface CaseDetailModalProps {
  reviewCase: ManualReviewCase;
  onClose: () => void;
  onAction: (caseId: string, action: 'approved' | 'rejected' | 'hold', notes?: string) => void;
}

// Image Preview Popup Component
function ImagePreviewPopup({ 
  isOpen, 
  onClose, 
  imageUrl, 
  fileName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string; 
  fileName: string;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      key="preview-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        key="preview-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card border border-border rounded-xl max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{fileName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <img 
            src={imageUrl} 
            alt={fileName} 
            className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CaseDetailModal({ reviewCase, onClose, onAction }: CaseDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | 'hold' | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">Under Review</span>;
      case 'approved':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/30">Rejected</span>;
      case 'hold':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">On Hold</span>;
      default:
        return null;
    }
  };

  const getVerificationResultColor = (result: string) => {
    if (result === 'Pass' || result === 'High') return 'text-emerald-500';
    if (result === 'Fail' || result === 'Low') return 'text-red-500';
    return 'text-amber-500';
  };

  const getScreeningResultColor = (result: string) => {
    if (result === 'No Hit' || result === 'Clear' || result === 'No') return 'text-emerald-500';
    if (result === 'Hit' || result === 'Yes') return 'text-red-500';
    return 'text-amber-500';
  };

  const getAIRecommendationText = () => {
    const { recommendation, verificationResults } = reviewCase;
    if (recommendation === 'proceed') {
      return 'PROCEED – All verification checks passed with acceptable confidence levels';
    } else if (recommendation === 'hold') {
      if (verificationResults.faceMatchConfidence < 0.75) {
        return `HOLD – Face match confidence (${(verificationResults.faceMatchConfidence * 100).toFixed(0)}%) below auto-approval threshold`;
      }
      return 'HOLD – Additional verification required before final decision';
    } else {
      return 'REJECT – Multiple risk indicators detected requiring rejection';
    }
  };

  const isAlreadyReviewed = reviewCase.status !== 'pending';

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
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
          {/* ===== SECTION 1: Case Header ===== */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Case ID: {reviewCase.id}</h2>
                  {getStatusBadge(reviewCase.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(reviewCase.submittedAt).toLocaleString('en-US')}
                </p>
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
              
              {/* ===== SECTION 2: Evidence Panel (Documents) ===== */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Evidence Panel
                </h3>
                <div className={cn(
                  "grid gap-3",
                  reviewCase.documents.length === 1 && "grid-cols-1",
                  reviewCase.documents.length === 2 && "grid-cols-1 md:grid-cols-2",
                  reviewCase.documents.length >= 3 && "grid-cols-1 md:grid-cols-3"
                )}>
                  {reviewCase.documents.map((doc, index) => {
                    const getDocIcon = (type: EvidenceDocument['type']) => {
                      switch (type) {
                        case 'passport': return <FileText className="w-6 h-6 text-blue-500" />;
                        case 'visa': return <FileText className="w-6 h-6 text-purple-500" />;
                        case 'id_card': return <FileText className="w-6 h-6 text-primary" />;
                        case 'live_photo':
                        case 'selfie': return <Camera className="w-6 h-6 text-emerald-500" />;
                        default: return <FileText className="w-6 h-6 text-muted-foreground" />;
                      }
                    };

                    const getDocBgColor = (type: EvidenceDocument['type']) => {
                      switch (type) {
                        case 'passport': return 'bg-blue-500/10 group-hover:bg-blue-500/20';
                        case 'visa': return 'bg-purple-500/10 group-hover:bg-purple-500/20';
                        case 'id_card': return 'bg-primary/10 group-hover:bg-primary/20';
                        case 'live_photo':
                        case 'selfie': return 'bg-emerald-500/10 group-hover:bg-emerald-500/20';
                        default: return 'bg-muted group-hover:bg-muted/80';
                      }
                    };

                    return (
                      <button
                        key={index}
                        onClick={() => setPreviewImage({
                          url: doc.imageUrl,
                          fileName: doc.fileName
                        })}
                        className="bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-colors", getDocBgColor(doc.type))}>
                            {getDocIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{doc.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                          </div>
                          <ImageIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ===== SECTION 3: Verification Results Table ===== */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verification Results
                </h3>
                <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Check</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="px-4 py-3 text-sm text-foreground">Document authenticity</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getVerificationResultColor(reviewCase.verificationResults.documentAuthenticity))}>
                          {reviewCase.verificationResults.documentAuthenticity}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="px-4 py-3 text-sm text-foreground">Face match confidence</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", reviewCase.verificationResults.faceMatchConfidence >= 0.75 ? 'text-emerald-500' : 'text-amber-500')}>
                          {reviewCase.verificationResults.faceMatchConfidence.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="px-4 py-3 text-sm text-foreground">Liveness</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getVerificationResultColor(reviewCase.verificationResults.liveness))}>
                          {reviewCase.verificationResults.liveness}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Identity confidence</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getVerificationResultColor(reviewCase.verificationResults.identityConfidence))}>
                          {reviewCase.verificationResults.identityConfidence}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ===== SECTION 4: Screening Results Table ===== */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Screening Results
                </h3>
                <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Screening Type</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="px-4 py-3 text-sm text-foreground">Sanctions</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getScreeningResultColor(reviewCase.screeningResults.sanctions))}>
                          {reviewCase.screeningResults.sanctions}
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="px-4 py-3 text-sm text-foreground">PEP</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getScreeningResultColor(reviewCase.screeningResults.pep))}>
                          {reviewCase.screeningResults.pep}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Watchlist</td>
                        <td className={cn("px-4 py-3 text-sm font-medium", getScreeningResultColor(reviewCase.screeningResults.watchlist))}>
                          {reviewCase.screeningResults.watchlist}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evidence Analysis (existing - kept as requested) */}
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

              {/* ===== SECTION 5: AI Recommendation (Highlighted Box) ===== */}
              <div className={cn(
                'p-4 border-2 rounded-xl',
                reviewCase.recommendation === 'proceed' && 'border-emerald-500/50 bg-emerald-500/10',
                reviewCase.recommendation === 'hold' && 'border-amber-500/50 bg-amber-500/10',
                reviewCase.recommendation === 'reject' && 'border-red-500/50 bg-red-500/10'
              )}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-card rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">System Recommendation:</p>
                    <p className={cn(
                      "text-lg font-bold",
                      reviewCase.recommendation === 'proceed' && 'text-emerald-500',
                      reviewCase.recommendation === 'hold' && 'text-amber-500',
                      reviewCase.recommendation === 'reject' && 'text-red-500'
                    )}>
                      {getAIRecommendationText()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Already Reviewed Info */}
              {isAlreadyReviewed && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-400">
                    <strong>Reviewed by:</strong> {reviewCase.reviewedBy} on{' '}
                    {reviewCase.reviewedAt ? new Date(reviewCase.reviewedAt).toLocaleString('en-US') : 'N/A'}
                  </p>
                  {reviewCase.reviewNotes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {reviewCase.reviewNotes}
                    </p>
                  )}
                </div>
              )}

              {/* ===== SECTION 6: Human Decision Controls ===== */}
              {!isAlreadyReviewed && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reviewer Notes (Optional)
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

          {/* Footer Actions - Section 6 continued */}
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
                    Hold
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

      {/* Image Preview Popup */}
      {previewImage && (
        <ImagePreviewPopup
          key="image-preview"
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          fileName={previewImage.fileName}
        />
      )}
    </AnimatePresence>
  );
}
