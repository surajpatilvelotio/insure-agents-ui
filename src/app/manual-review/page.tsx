'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockReviewCases, mockStatistics } from '@/api/mock/data/manual-review';
import type { ManualReviewCase, FilterStatus } from '@/types/manual-review';
import { CaseDetailModal } from '@/components/manual-review/case-detail-modal';

export default function ManualReviewPage() {
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [selectedCase, setSelectedCase] = useState<ManualReviewCase | null>(null);
  const [cases, setCases] = useState<ManualReviewCase[]>(mockReviewCases);

  const filteredCases = filter === 'all' 
    ? cases 
    : cases.filter(c => c.status === filter);

  // Calculate how many cases changed from their initial state
  const initialCases = mockReviewCases;
  
  // Count changes from initial pending state
  let newlyCleared = 0;
  let newlyRejected = 0;
  let pendingReduced = 0;
  
  cases.forEach((currentCase, index) => {
    const initialCase = initialCases.find(ic => ic.id === currentCase.id);
    if (initialCase && initialCase.status === 'pending' && currentCase.status !== 'pending') {
      pendingReduced++;
      if (currentCase.status === 'approved') newlyCleared++;
      if (currentCase.status === 'rejected') newlyRejected++;
    }
  });
  
  // Start with mock statistics and adjust based on actions
  // Under Review count should reflect actual pending cases from the data
  const actualPendingCount = cases.filter(c => c.status === 'pending').length;
  
  const stats = {
    total: mockStatistics.last30Days.total,
    cleared: mockStatistics.last30Days.cleared + newlyCleared,
    rejected: mockStatistics.last30Days.rejected + newlyRejected,
    pending: actualPendingCount,
  };
  
  // Calculate false positive rate based on updated numbers
  const processedCases = stats.cleared + stats.rejected;
  const falsePositiveRate = processedCases > 0 ? stats.cleared / processedCases : mockStatistics.falsePositiveRate;

  const handleCaseAction = (caseId: string, action: 'approved' | 'rejected' | 'hold', notes?: string) => {
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { 
            ...c, 
            status: action, 
            reviewedBy: 'Current User',
            reviewedAt: new Date().toISOString(),
            reviewNotes: notes,
          }
        : c
    ));
    setSelectedCase(null);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'proceed': return 'text-emerald-500 bg-emerald-500/10';
      case 'hold': return 'text-amber-500 bg-amber-500/10';
      case 'reject': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'bg-amber-500/20 text-amber-400', label: 'Under Review' };
      case 'approved': return { color: 'bg-emerald-500/20 text-emerald-400', label: 'Cleared' };
      case 'rejected': return { color: 'bg-red-500/20 text-red-400', label: 'Rejected' };
      case 'hold': return { color: 'bg-blue-500/20 text-blue-400', label: 'On Hold' };
      default: return { color: 'bg-muted text-muted-foreground', label: status };
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manual Review Dashboard</h1>
              <p className="text-sm text-muted-foreground">Compliance officer review for flagged applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Flagged (30d)</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{stats.cleared}</p>
                <p className="text-xs text-muted-foreground">Cleared</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{(falsePositiveRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">False Positive Rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'pending', 'approved', 'rejected', 'hold'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {status === 'all' ? 'All Cases' : status === 'pending' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                  {cases.filter(c => c.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cases Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Flag Reason
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    AI Recommendation
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((reviewCase, index) => {
                  const statusBadge = getStatusBadge(reviewCase.status);
                  return (
                    <motion.tr
                      key={reviewCase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-primary">{reviewCase.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{reviewCase.applicantName}</p>
                          <p className="text-xs text-muted-foreground">
                            {reviewCase.nationality} • {reviewCase.documentType}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-foreground">
                            {new Date(reviewCase.submittedAt).toLocaleDateString('en-US')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reviewCase.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-foreground max-w-xs truncate" title={reviewCase.flagReason}>
                          {reviewCase.flagReason}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn('font-bold', getRiskColor(reviewCase.riskScore))}>
                          {reviewCase.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          getRecommendationColor(reviewCase.recommendation)
                        )}>
                          {reviewCase.recommendation}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full rounded-full',
                                reviewCase.confidence >= 0.8 ? 'bg-emerald-500' :
                                reviewCase.confidence >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${reviewCase.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(reviewCase.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          statusBadge.color
                        )}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setSelectedCase(reviewCase)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No cases found matching the filter.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          reviewCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onAction={handleCaseAction}
        />
      )}
    </div>
  );
}

