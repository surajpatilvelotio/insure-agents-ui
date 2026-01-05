'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Shield, 
  ScanFace, 
  Fingerprint, 
  FileSearch, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import type { UiAction } from '@/types/kyc';

interface VerificationCheck {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'pending' | 'running' | 'passed' | 'failed';
  delay: number; // delay in ms before starting this check
  duration: number; // how long the check takes
}

type VerificationOutcome = 'approved' | 'rejected' | 'manual_review' | 'in_progress';

interface VerificationProgressProps {
  action: UiAction;
  embedded?: boolean;
}

// Outcome configurations
const outcomeConfig = {
  approved: {
    title: '✅ Identity Verified',
    description: 'Your identity has been successfully verified.',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  rejected: {
    title: '❌ Unable to Verify Identity',
    description: "We couldn't verify your identity using the details provided.",
    bgClass: 'bg-red-500/10 border-red-500/30',
    textClass: 'text-red-600 dark:text-red-400',
    icon: XCircle,
  },
  manual_review: {
    title: '⏳ Verification in Progress (Under Review)',
    description: "We're reviewing your details to complete the verification process. This usually takes a short time.",
    bgClass: 'bg-amber-500/10 border-amber-500/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    icon: Clock,
  },
  in_progress: {
    title: 'Verifying Your Identity',
    description: 'Please wait while we verify your documents...',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-600 dark:text-blue-400',
    icon: Loader2,
  },
};

export function VerificationProgress({ action, embedded = false }: VerificationProgressProps) {
  // Parse outcome from action data
  const outcome: VerificationOutcome = useMemo(() => {
    const data = action.data as Record<string, unknown> | undefined;
    if (data?.outcome) {
      const o = String(data.outcome).toLowerCase();
      if (o === 'approved' || o === 'verified' || o === 'completed') return 'approved';
      if (o === 'rejected' || o === 'failed' || o === 'declined') return 'rejected';
      if (o === 'manual_review' || o === 'review' || o === 'hold') return 'manual_review';
    }
    return 'in_progress';
  }, [action.data]);

  // Parse failure reason if any
  const failureReason = useMemo(() => {
    const data = action.data as Record<string, unknown> | undefined;
    return data?.failure_reason as string | undefined;
  }, [action.data]);

  // Define the verification checks based on outcome
  const initialChecks: VerificationCheck[] = useMemo(() => {
    const isSuccess = outcome === 'approved';
    const isManualReview = outcome === 'manual_review';
    
    // Default to all passed for success, determine failures for rejected
    const determineCheckStatus = (checkId: string): 'passed' | 'failed' => {
      if (isSuccess || isManualReview) return 'passed';
      
      // For rejected, determine which check failed based on failure reason
      if (failureReason) {
        const lowerReason = failureReason.toLowerCase();
        if (checkId === 'document_auth' && lowerReason.includes('document')) return 'failed';
        if (checkId === 'face_match' && (lowerReason.includes('face') || lowerReason.includes('match'))) return 'failed';
        if (checkId === 'liveness' && lowerReason.includes('liveness')) return 'failed';
        if (checkId === 'sanctions' && (lowerReason.includes('sanction') || lowerReason.includes('pep'))) return 'failed';
        if (checkId === 'risk_score' && (lowerReason.includes('risk') || lowerReason.includes('fraud'))) return 'failed';
      }
      
      // For rejected without specific reason, fail the last check
      return 'passed';
    };

    // If there's a specific failure, identify which check should fail
    let failedCheck: string | null = null;
    if (outcome === 'rejected' && failureReason) {
      const lowerReason = failureReason.toLowerCase();
      if (lowerReason.includes('document')) failedCheck = 'document_auth';
      else if (lowerReason.includes('face') || lowerReason.includes('match')) failedCheck = 'face_match';
      else if (lowerReason.includes('liveness')) failedCheck = 'liveness';
      else if (lowerReason.includes('sanction') || lowerReason.includes('pep')) failedCheck = 'sanctions';
      else if (lowerReason.includes('risk') || lowerReason.includes('fraud')) failedCheck = 'risk_score';
      else failedCheck = 'risk_score'; // Default to last check
    }

    return [
      {
        id: 'document_auth',
        label: 'Document authenticity check',
        icon: FileSearch,
        status: 'pending',
        delay: 400,
        duration: 800,
      },
      {
        id: 'face_match',
        label: 'Face match confidence ≥ 0.85',
        icon: ScanFace,
        status: 'pending',
        delay: 300,
        duration: 1000,
      },
      {
        id: 'liveness',
        label: 'Liveness check',
        icon: Fingerprint,
        status: 'pending',
        delay: 300,
        duration: 700,
      },
      {
        id: 'sanctions',
        label: 'Sanctions / PEP screening',
        icon: Shield,
        status: 'pending',
        delay: 300,
        duration: 900,
      },
      {
        id: 'risk_score',
        label: 'Risk score assessment',
        icon: AlertTriangle,
        status: 'pending',
        delay: 300,
        duration: 600,
      },
    ].map(check => ({
      ...check,
      // Override final status based on outcome
      _finalStatus: failedCheck === check.id ? 'failed' : determineCheckStatus(check.id),
    })) as (VerificationCheck & { _finalStatus: 'passed' | 'failed' })[];
  }, [outcome, failureReason]);

  const [checks, setChecks] = useState<VerificationCheck[]>(
    initialChecks.map(c => ({ ...c, status: 'pending' }))
  );
  const [animationComplete, setAnimationComplete] = useState(false);

  // Run the animation sequence
  useEffect(() => {
    let mounted = true;
    let timeoutIds: NodeJS.Timeout[] = [];

    const runAnimation = async () => {
      let cumulativeDelay = 0;

      for (let i = 0; i < initialChecks.length; i++) {
        const check = initialChecks[i] as VerificationCheck & { _finalStatus: 'passed' | 'failed' };
        cumulativeDelay += check.delay;

        // Start running
        const startTimeout = setTimeout(() => {
          if (mounted) {
            setChecks(prev => prev.map((c, idx) => 
              idx === i ? { ...c, status: 'running' } : c
            ));
          }
        }, cumulativeDelay);
        timeoutIds.push(startTimeout);

        cumulativeDelay += check.duration;

        // Complete with final status
        const completeTimeout = setTimeout(() => {
          if (mounted) {
            setChecks(prev => prev.map((c, idx) => 
              idx === i ? { ...c, status: check._finalStatus } : c
            ));
          }
        }, cumulativeDelay);
        timeoutIds.push(completeTimeout);

        // If this check fails, stop the animation here
        if (check._finalStatus === 'failed') {
          break;
        }
      }

      // Mark animation complete after all checks
      const finalTimeout = setTimeout(() => {
        if (mounted) {
          setAnimationComplete(true);
        }
      }, cumulativeDelay + 500);
      timeoutIds.push(finalTimeout);
    };

    runAnimation();

    return () => {
      mounted = false;
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [initialChecks]);

  const config = outcomeConfig[outcome];
  const OutcomeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={embedded ? 'p-4' : 'mt-3 max-w-md'}
    >
      <div className={`bg-card rounded-xl border border-border overflow-hidden shadow-sm ${embedded ? '' : ''}`}>
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b border-border ${animationComplete ? config.bgClass : 'bg-blue-500/5'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${animationComplete ? config.bgClass : 'bg-blue-500/10'}`}>
            {animationComplete ? (
              <OutcomeIcon className={`w-4 h-4 ${config.textClass}`} />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${animationComplete ? config.textClass : 'text-foreground'}`}>
              {animationComplete ? config.title : 'Verifying Your Identity'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {animationComplete ? '' : 'Running verification checks...'}
            </p>
          </div>
        </div>

        {/* Verification Checks */}
        <div className="p-4 space-y-3">
          <AnimatePresence mode="sync">
            {checks.map((check, index) => {
              const CheckIcon = check.icon;
              const isPending = check.status === 'pending';
              const isRunning = check.status === 'running';
              const isPassed = check.status === 'passed';
              const isFailed = check.status === 'failed';

              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: isPending ? 0.5 : 1,
                    x: isRunning ? [0, 2, 0] : 0 
                  }}
                  transition={{ 
                    duration: isRunning ? 0.3 : 0.2,
                    repeat: isRunning ? Infinity : 0
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isRunning ? 'bg-blue-500/5' : 
                    isPassed ? 'bg-emerald-500/5' : 
                    isFailed ? 'bg-red-500/5' : 
                    'bg-muted/30'
                  }`}
                >
                  {/* Status Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPending ? 'bg-muted' :
                    isRunning ? 'bg-blue-500/20' :
                    isPassed ? 'bg-emerald-500/20' :
                    'bg-red-500/20'
                  }`}>
                    {isPending && <div className="w-2 h-2 bg-muted-foreground/40 rounded-full" />}
                    {isRunning && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {isFailed && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                  </div>

                  {/* Check Icon */}
                  <CheckIcon className={`w-4 h-4 flex-shrink-0 ${
                    isPending ? 'text-muted-foreground/40' :
                    isRunning ? 'text-blue-500' :
                    isPassed ? 'text-emerald-500' :
                    'text-red-500'
                  }`} />

                  {/* Label */}
                  <span className={`text-sm flex-1 ${
                    isPending ? 'text-muted-foreground/60' :
                    isRunning ? 'text-foreground font-medium' :
                    isPassed ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {check.label}
                    {isPassed && <span className="ml-2 text-xs text-emerald-500">Passed</span>}
                    {isFailed && <span className="ml-2 text-xs text-red-500">Failed</span>}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Outcome Message */}
        <AnimatePresence>
          {animationComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border"
            >
              <div className={`p-4 ${config.bgClass}`}>
                <p className={`text-sm ${config.textClass}`}>
                  {config.description}
                </p>
                {failureReason && outcome === 'rejected' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reason: {failureReason}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

