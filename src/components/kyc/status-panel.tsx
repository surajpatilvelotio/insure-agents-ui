'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  XCircle,
  FileSearch,
  UserCheck,
  Shield,
  AlertTriangle,
  Award,
  ScanFace,
  Fingerprint,
  Home,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KycStage, KycStageStatus } from '@/types/kyc';

// Verification check configuration for animation
interface VerificationCheck {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

// Verification checks animation component for status panel
// Shows checks one by one, with Document authenticity check last (most likely to fail)
function VerificationChecksAnimation({ 
  overallStatus,
  onComplete 
}: { 
  overallStatus: string;
  onComplete?: () => void;
}) {
  // Check definitions - Document authenticity check is LAST (since gov DB check often fails for demo)
  const checkDefinitions = [
    { id: 'face_match', label: 'Face match confidence ≥ 0.85', icon: ScanFace },
    { id: 'liveness', label: 'Liveness check', icon: Fingerprint },
    { id: 'sanctions', label: 'Sanctions / PEP screening', icon: Shield },
    { id: 'risk_score', label: 'Risk score assessment', icon: AlertTriangle },
    { id: 'document_auth', label: 'Document authenticity check', icon: FileSearch },
  ];

  const [checkStatuses, setCheckStatuses] = useState<Record<string, 'pending' | 'running' | 'passed' | 'failed'>>({
    face_match: 'pending',
    liveness: 'pending',
    sanctions: 'pending',
    risk_score: 'pending',
    document_auth: 'pending',
  });
  const [visibleCount, setVisibleCount] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Check if we have a final result from backend
  const hasFinalResult = ['approved', 'completed', 'rejected', 'failed', 'pending_review', 'manual_review'].includes(overallStatus);
  const isFailed = ['rejected', 'failed'].includes(overallStatus);
  const isSuccess = ['approved', 'completed', 'pending_review', 'manual_review'].includes(overallStatus);

  // Update last check status ONLY when backend responds with final result
  // Keep last check in "running" state until we know the actual outcome
  useEffect(() => {
    if (hasFinalResult && checkStatuses.document_auth === 'running') {
      // Backend responded - update last check based on actual result
      setCheckStatuses(prev => ({ 
        ...prev, 
        document_auth: isFailed ? 'failed' : 'passed' 
      }));
    }
  }, [hasFinalResult, isFailed, checkStatuses.document_auth]);

  // Start animation immediately on mount - NO ref guard to support React Strict Mode
  useEffect(() => {
    // Reset state for fresh animation
    setVisibleCount(0);
    setAnimationComplete(false);
    setCheckStatuses({
      face_match: 'pending',
      liveness: 'pending',
      sanctions: 'pending',
      risk_score: 'pending',
      document_auth: 'pending',
    });

    const timeoutIds: NodeJS.Timeout[] = [];
    
    // Timing for each check - show one by one with delays
    const timings = [
      { delay: 400, duration: 600 },   // Face match
      { delay: 300, duration: 500 },   // Liveness
      { delay: 300, duration: 400 },   // Sanctions
      { delay: 300, duration: 500 },   // Risk score
      { delay: 300, duration: 700 },   // Document authenticity (last, potential fail)
    ];

    let cumulativeDelay = 100; // Slight initial delay

    checkDefinitions.forEach((check, i) => {
      const timing = timings[i];
      cumulativeDelay += timing.delay;

      // Show this check and start running
      timeoutIds.push(setTimeout(() => {
        setVisibleCount(prev => Math.max(prev, i + 1));
        setCheckStatuses(prev => ({ ...prev, [check.id]: 'running' }));
      }, cumulativeDelay));

      cumulativeDelay += timing.duration;

      // Complete the check
      timeoutIds.push(setTimeout(() => {
        const isLastCheck = i === checkDefinitions.length - 1;
        if (isLastCheck) {
          // Last check: Keep in "running" state until backend responds
          // The useEffect watching hasFinalResult will update it to passed/failed
          // Don't change status here - it stays "running"
        } else {
          // Other checks: Mark as passed
          setCheckStatuses(prev => ({ ...prev, [check.id]: 'passed' }));
        }
      }, cumulativeDelay));
    });

    // Mark animation complete
    timeoutIds.push(setTimeout(() => {
      setAnimationComplete(true);
      onCompleteRef.current?.();
    }, cumulativeDelay + 300));

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get visible checks with their current statuses
  const visibleChecks = checkDefinitions.slice(0, visibleCount).map(def => ({
    ...def,
    status: checkStatuses[def.id],
  }));

  // Determine header state based on last check status
  const lastCheckStatus = checkStatuses.document_auth;
  const isLastCheckRunning = lastCheckStatus === 'running';
  const isLastCheckPassed = lastCheckStatus === 'passed';
  const isLastCheckFailed = lastCheckStatus === 'failed';
  
  // Header shows appropriate state
  const showSuccess = isLastCheckPassed;
  const showFailure = isLastCheckFailed;

  return (
    <div className="py-2 px-1">
      <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-border/30">
          {/* Icon based on verification state */}
          {showFailure ? (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          )}
          <span className={cn(
            "text-[11px] font-semibold",
            showFailure && "text-red-600 dark:text-red-400",
            showSuccess && "text-emerald-600 dark:text-emerald-400",
            !showFailure && !showSuccess && "text-blue-600 dark:text-blue-400"
          )}>
            {showFailure 
              ? "Verification Failed"
              : showSuccess 
                ? "All Checks Passed" 
                : isLastCheckRunning && animationComplete
                  ? "Awaiting Verification Result..."
                  : "Running Verification Checks..."}
          </span>
        </div>
        
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {visibleChecks.map((check) => {
              const CheckIcon = check.icon;
              const isCheckRunning = check.status === 'running';
              const isCheckPassed = check.status === 'passed';
              const isCheckFailed = check.status === 'failed';

              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    y: 0,
                    x: isCheckRunning ? [0, 1, 0] : 0 
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.2,
                    x: { duration: 0.15, repeat: isCheckRunning ? Infinity : 0 }
                  }}
                  className={cn(
                    "flex items-center gap-2 py-1 px-1.5 rounded text-[10px] transition-colors",
                    isCheckRunning && "bg-blue-500/10",
                    isCheckPassed && "bg-emerald-500/5",
                    isCheckFailed && "bg-red-500/10"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0",
                    isCheckRunning && "bg-blue-500/20",
                    isCheckPassed && "bg-emerald-500/20",
                    isCheckFailed && "bg-red-500/20"
                  )}>
                    {isCheckRunning && <Loader2 className="w-2 h-2 text-blue-500 animate-spin" />}
                    {isCheckPassed && <CheckCircle2 className="w-2 h-2 text-emerald-500" />}
                    {isCheckFailed && <XCircle className="w-2 h-2 text-red-500" />}
                  </div>
                  <CheckIcon className={cn(
                    "w-2.5 h-2.5 flex-shrink-0",
                    isCheckRunning && "text-blue-500",
                    isCheckPassed && "text-emerald-500",
                    isCheckFailed && "text-red-500"
                  )} />
                  <span className={cn(
                    "flex-1",
                    isCheckRunning && "text-foreground font-medium",
                    isCheckPassed && "text-emerald-600 dark:text-emerald-400",
                    isCheckFailed && "text-red-600 dark:text-red-400"
                  )}>
                    {check.label}
                  </span>
                  {isCheckPassed && <span className="text-emerald-500">✓</span>}
                  {isCheckFailed && <span className="text-red-500">✗</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface StatusPanelProps {
  stages: KycStage[];
  currentStage: string | null;
  overallStatus: string;
}

const stageIcons: Record<string, React.ElementType> = {
  // 1. Identity Journey Initiation
  'journey_initiation': FileSearch,
  'initiated': FileSearch,
  
  // 2. Smart Document Capture
  'document_capture': FileSearch,
  'document_uploaded': FileSearch,
  'document_processing': FileSearch,
  'documents_uploaded': FileSearch,
  'ocr': FileSearch,
  'ocr_extraction': FileSearch,
  'ocr_processing': FileSearch,
  'data_extracted': FileSearch,
  'pending_ocr': FileSearch,
  'processing': FileSearch,
  'ocr_failed': FileSearch,
  'ocr_completed': FileSearch,
  
  // 4. Live Presence Confirmation
  'presence_confirmation': UserCheck,
  'user_review': UserCheck,
  'data_review': UserCheck,
  'pending_user_review': UserCheck,
  
  // 5. AI-Guided Liveness Interaction
  'liveness_interaction': Shield,
  'user_confirmed': Shield,
  'government_verification': Shield,
  'gov_verification': Shield,
  'gov_verification_pending': Shield,
  'gov_verification_failed': Shield,
  
  // 7. Verification Outcome Notification
  'outcome_notification': AlertTriangle,
  'fraud_detection': AlertTriangle,
  'fraud_check': AlertTriangle,
  'fraud_check_pending': AlertTriangle,
  'security_check': AlertTriangle,
  'fraud_check_failed': AlertTriangle,
  
  // 8. eKYC Completion Confirmation
  'completion_confirmation': Award,
  'decision': Award,
  'decision_made': Award,
  'final_decision': Award,
  'pending_decision': Award,
  'completed': Award,
};

const stageLabels: Record<string, string> = {
  // 1. Identity Journey Initiation
  'journey_initiation': 'Identity Journey Initiation',
  'initiated': 'Identity Journey Initiation',
  
  // 2. Smart Document Capture
  'document_capture': 'Smart Document Capture',
  'document_uploaded': 'Smart Document Capture',
  'document_processing': 'Smart Document Capture',
  'documents_uploaded': 'Smart Document Capture',
  'ocr': 'Smart Document Capture',
  'ocr_extraction': 'Smart Document Capture',
  'ocr_processing': 'Smart Document Capture',
  'data_extracted': 'Smart Document Capture',
  'pending_ocr': 'Smart Document Capture',
  'processing': 'Smart Document Capture',
  'ocr_failed': 'Smart Document Capture',
  'ocr_completed': 'Smart Document Capture',
  
  // 4. Live Presence Confirmation
  'presence_confirmation': 'Live Presence Confirmation',
  'user_review': 'Live Presence Confirmation',
  'data_review': 'Live Presence Confirmation',
  'pending_user_review': 'Live Presence Confirmation',
  
  // 5. AI-Guided Liveness Interaction
  'liveness_interaction': 'AI-Guided Liveness Interaction',
  'user_confirmed': 'AI-Guided Liveness Interaction',
  'government_verification': 'AI-Guided Liveness Interaction',
  'gov_verification': 'AI-Guided Liveness Interaction',
  'gov_verification_pending': 'AI-Guided Liveness Interaction',
  'gov_verification_failed': 'AI-Guided Liveness Interaction',
  
  // 7. Verification Outcome Notification
  'outcome_notification': 'Verification Outcome Notification',
  'fraud_detection': 'Verification Outcome Notification',
  'fraud_check': 'Verification Outcome Notification',
  'fraud_check_pending': 'Verification Outcome Notification',
  'security_check': 'Verification Outcome Notification',
  'fraud_check_failed': 'Verification Outcome Notification',
  
  // 8. eKYC Completion Confirmation
  'completion_confirmation': 'eKYC Completion Confirmation',
  'decision': 'eKYC Completion Confirmation',
  'decision_made': 'eKYC Completion Confirmation',
  'final_decision': 'eKYC Completion Confirmation',
  'pending_decision': 'eKYC Completion Confirmation',
  'completed': 'eKYC Completion Confirmation',
};

function getStatusIcon(status: KycStageStatus) {
  switch (status) {
    case 'completed':
      return CheckCircle2;
    case 'in_progress':
      return Loader2;
    case 'failed':
      return XCircle;
    default:
      return Circle;
  }
}

function getStatusColor(status: KycStageStatus) {
  switch (status) {
    case 'completed':
      return 'text-emerald-500 dark:text-emerald-400';
    case 'in_progress':
      return 'text-blue-500 dark:text-blue-400';
    case 'failed':
      return 'text-red-500 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

// Animated dots component for in-progress state
function AnimatedDots() {
  return (
    <span className="inline-flex ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full mx-0.5"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

// Dynamic short description for the outcome notification step (shows under the step name)
function getOutcomeShortDescription(overallStatus: string): string {
  if (['approved', 'completed'].includes(overallStatus)) {
    return 'Identity Verified';
  }
  if (['rejected', 'failed'].includes(overallStatus)) {
    return 'Unable to Verify Identity';
  }
  if (overallStatus === 'pending_review' || overallStatus === 'manual_review') {
    return 'Under Review';
  }
  return '';
}

// Long description for the last step (eKYC Completion Confirmation)
function getCompletionDescription(overallStatus: string): string {
  if (['approved', 'completed'].includes(overallStatus)) {
    return 'Your identity has been successfully verified.';
  }
  if (['rejected', 'failed'].includes(overallStatus)) {
    return "We couldn't verify your identity using the details provided.";
  }
  if (overallStatus === 'pending_review' || overallStatus === 'manual_review') {
    return "We're reviewing your details to complete the verification process. This usually takes a short time.";
  }
  return '';
}

export function StatusPanel({ stages, currentStage, overallStatus }: StatusPanelProps) {
  const router = useRouter();
  
  // Track if we should show verification checks animation
  const [showVerificationChecks, setShowVerificationChecks] = useState(false);
  const [verificationAnimationDone, setVerificationAnimationDone] = useState(false);
  const [readyToHideAnimation, setReadyToHideAnimation] = useState(false);
  const animationTriggered = useRef(false);
  
  // Staged progression for last two steps (after verification animation)
  const [outcomeStepReady, setOutcomeStepReady] = useState(false);
  const [completionStepReady, setCompletionStepReady] = useState(false);
  const [hideOutcomeDesc, setHideOutcomeDesc] = useState(false);
  
  // Auto-redirect countdown after completion
  const [showRedirectBanner, setShowRedirectBanner] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const redirectTriggered = useRef(false);

  // Get dynamic descriptions for steps based on overall status
  const outcomeShortDesc = getOutcomeShortDescription(overallStatus);
  const completionDescription = getCompletionDescription(overallStatus);

  // Determine if we're in verification phase (after user confirmed)
  const isInVerificationPhase = currentStage && [
    'user_confirmed', 'gov_verification', 'government_verification',
    'gov_verification_pending', 'fraud_detection', 'fraud_check', 
    'fraud_check_pending', 'decision', 'decision_made', 'pending_decision'
  ].includes(currentStage);

  const hasFinalResult = ['approved', 'completed', 'rejected', 'failed', 'pending_review', 'manual_review'].includes(overallStatus);

  // Start verification animation when entering verification phase OR when final result arrives
  useEffect(() => {
    // Only trigger once
    if (animationTriggered.current) return;
    
    // Trigger when in verification phase or when final result is available
    if (isInVerificationPhase || hasFinalResult) {
      animationTriggered.current = true;
      setShowVerificationChecks(true);
    }
  }, [isInVerificationPhase, hasFinalResult]);

  // Staged progression: After verification animation hides, show last two steps with delays
  useEffect(() => {
    if (readyToHideAnimation && hasFinalResult) {
      // Step 1: Show "Verification Outcome Notification" as in-progress, then complete after 1s
      const timer1 = setTimeout(() => {
        setOutcomeStepReady(true);
      }, 1000);
      
      // Step 2: Show "eKYC Completion Confirmation" as in-progress, then complete after 2s
      const timer2 = setTimeout(() => {
        setCompletionStepReady(true);
      }, 2000);
      
      // Step 3: Hide the outcome description after 4s to clean up the layout
      const timer3 = setTimeout(() => {
        setHideOutcomeDesc(true);
      }, 4000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [readyToHideAnimation, hasFinalResult]);

  // Delay hiding animation to show the final result for 1.5 seconds
  useEffect(() => {
    if (verificationAnimationDone && hasFinalResult && !readyToHideAnimation) {
      const timer = setTimeout(() => {
        setReadyToHideAnimation(true);
      }, 1500); // Show final result for 1.5 seconds before hiding
      return () => clearTimeout(timer);
    }
  }, [verificationAnimationDone, hasFinalResult, readyToHideAnimation]);

  // Auto-redirect countdown: Start after all animations complete
  useEffect(() => {
    // Start countdown when completion step is ready (all animations done)
    if (completionStepReady && hasFinalResult && !redirectTriggered.current) {
      redirectTriggered.current = true;
      // Wait 1 second before showing the banner
      const showTimer = setTimeout(() => {
        setShowRedirectBanner(true);
      }, 1000);
      return () => clearTimeout(showTimer);
    }
  }, [completionStepReady, hasFinalResult]);

  // Countdown timer and auto-redirect
  useEffect(() => {
    if (!showRedirectBanner || redirectCancelled) return;
    
    if (redirectCountdown <= 0) {
      router.push('/dashboard');
      return;
    }
    
    const timer = setInterval(() => {
      setRedirectCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showRedirectBanner, redirectCountdown, redirectCancelled, router]);

  // Default stages - always show all of these (6 steps)
  const defaultStages: KycStage[] = [
    { stage_name: 'journey_initiation', status: 'pending' },
    { stage_name: 'document_capture', status: 'pending' },
    { stage_name: 'presence_confirmation', status: 'pending' },
    { stage_name: 'liveness_interaction', status: 'pending' },
    { stage_name: 'outcome_notification', status: 'pending' },
    { stage_name: 'completion_confirmation', status: 'pending' },
  ];

  // Map backend stage names to UI stage names (for merging stage status)
  const stageMergeMapping: Record<string, string[]> = {
    'journey_initiation': [
      'initiated'
    ],
    'document_capture': [
      'ocr_processing', 'ocr_extraction', 'document_uploaded', 
      'documents_uploaded', 'data_extracted', 'pending_ocr', 'ocr_failed', 'ocr_completed'
    ],
    'presence_confirmation': [
      'user_review', 'data_review', 'pending_user_review'
    ],
    'liveness_interaction': [
      'user_confirmed', 'gov_verification', 'government_verification', 
      'gov_verification_pending', 'gov_verification_failed', 'gov_verification_passed'
    ],
    'outcome_notification': [
      'fraud_detection', 'fraud_check', 'fraud_check_pending',
      'fraud_check_failed', 'fraud_check_passed'
    ],
    'completion_confirmation': [
      'decision', 'decision_made', 'pending_decision', 'completed'
    ],
  };

  // Map backend stages to UI stage index (6 stages now)
  // Index 0 = Identity Journey Initiation
  // Index 1 = Smart Document Capture
  // Index 2 = Live Presence Confirmation
  // Index 3 = AI-Guided Liveness Interaction
  // Index 4 = Verification Outcome Notification
  // Index 5 = eKYC Completion Confirmation
  const backendToUIStageIndex: Record<string, number> = {
    'initiated': 0,
    'document_uploaded': 1, 'documents_uploaded': 1, 'ocr_processing': 1, 
    'ocr_extraction': 1, 'data_extracted': 1, 'pending_ocr': 1, 'ocr_failed': 1, 'ocr_completed': 1,
    'user_review': 2, 'data_review': 2, 'pending_user_review': 2,
    'user_confirmed': 3, 'gov_verification': 3, 'government_verification': 3,
    'gov_verification_pending': 3, 'gov_verification_failed': 3,
    'fraud_detection': 4, 'fraud_check': 4, 'fraud_check_pending': 4, 'fraud_check_failed': 4,
    'decision': 5, 'decision_made': 5, 'pending_decision': 5, 'completed': 5,
  };
  
  // Find the highest stage reached
  let highestStageIndex = -1;
  if (currentStage && backendToUIStageIndex[currentStage] !== undefined) {
    highestStageIndex = backendToUIStageIndex[currentStage];
  }
  // Also check backend stages
  stages.forEach(s => {
    const idx = backendToUIStageIndex[s.stage_name];
    if (idx !== undefined && idx > highestStageIndex) {
      highestStageIndex = idx;
    }
  });

  // Merge backend stages with defaults - always show all stages
  const displayStages: KycStage[] = defaultStages.map((defaultStage, index) => {
    // Find matching stage from backend
    const validStageNames = stageMergeMapping[defaultStage.stage_name] || [defaultStage.stage_name];
    const backendStage = stages.find((s) => validStageNames.includes(s.stage_name));
    
    // If we have a final result, mark all stages appropriately
    if (hasFinalResult) {
      // Determine final status based on overall result
      const isFailed = ['rejected', 'failed'].includes(overallStatus);
      const isUnderReview = ['pending_review', 'manual_review'].includes(overallStatus);
      
      // Mark all stages as completed when we have final result
      // The last stage (completion_confirmation) should reflect the actual outcome
      if (index === defaultStages.length - 1) {
        // Last stage: completed for approved/under review, failed for rejected
        return { ...defaultStage, status: isFailed ? 'failed' : 'completed' };
      }
      // All other stages should be marked as completed
      return { ...defaultStage, status: 'completed' };
    }
    
    // If we found a backend stage, use its status but keep our display stage_name
    if (backendStage) {
      return { ...defaultStage, status: backendStage.status, message: backendStage.message };
    }
    
    // Auto-complete earlier stages when we've progressed past them
    if (highestStageIndex > index) {
      return { ...defaultStage, status: 'completed' };
    }
    
    return defaultStage;
  });

  // Helper to check if a stage is currently processing based on currentStage from backend
  const isStageInProgress = (stageName: string): boolean => {
    // If we have a final result, nothing should be "in progress" anymore
    if (hasFinalResult) return false;
    
    if (!currentStage) return false;
    // Check if this stage matches currentStage (from backend)
    if (currentStage === stageName) return true;
    
    // Map backend current_stage values to UI stages
    // Only highlight when the stage is actually being processed
    const stageMapping: Record<string, string[]> = {
      'journey_initiation': [
        'initiated'  // Only first stage in-progress at init
      ],
      'document_capture': [
        // Smart Document Capture - when documents are being processed
        'document_uploaded', 'documents_uploaded', 
        'ocr_extraction', 'ocr_processing', 'data_extracted',
        'pending_ocr', 'processing', 'ocr_failed', 'ocr_completed'
      ],
      'presence_confirmation': [
        // Live Presence Confirmation - when waiting for user to review/confirm
        'pending_user_review', 'user_review', 'data_review'
      ],
      'liveness_interaction': [
        // AI-Guided Liveness Interaction - starts after user confirms
        'user_confirmed', 'gov_verification', 'government_verification',
        'gov_verification_pending', 'gov_verification_failed', 'gov_verification_passed'
      ],
      'outcome_notification': [
        // Verification Outcome Notification
        'fraud_check', 'fraud_detection', 'fraud_check_pending',
        'fraud_check_failed', 'fraud_check_passed'
      ],
      'completion_confirmation': [
        // eKYC Completion Confirmation
        'decision_made', 'decision', 'pending_decision', 'completed'
      ],
    };
    
    const matchingStages = stageMapping[stageName] || [];
    return matchingStages.includes(currentStage);
  };

  return (
    <div className="h-full flex flex-col bg-card/50 border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Verification Progress</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {overallStatus === 'idle' && 'Waiting to start...'}
          {['in_progress', 'processing', 'initiated', 'documents_uploaded'].includes(overallStatus) && 'Verification in progress'}
          {['completed', 'approved'].includes(overallStatus) && 'Verification complete!'}
          {['rejected', 'failed'].includes(overallStatus) && '✗ KYC Rejected'}
          {overallStatus === 'pending_review' && 'Under manual review'}
        </p>
      </div>

      {/* Stages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {displayStages.map((stage, index) => {
            // Determine if this stage is currently in progress
            const isProcessing = stage.status === 'in_progress' || isStageInProgress(stage.stage_name);
            let effectiveStatus = isProcessing && stage.status === 'pending' ? 'in_progress' : stage.status;
            
            // Override status for last two steps during verification animation and staged progression
            if (hasFinalResult && (stage.stage_name === 'outcome_notification' || stage.stage_name === 'completion_confirmation')) {
              if (!readyToHideAnimation) {
                // While verification animation is showing, keep last two steps as pending
                effectiveStatus = 'pending';
              } else {
                // Staged progression after animation hides
                if (stage.stage_name === 'outcome_notification') {
                  if (!outcomeStepReady) {
                    effectiveStatus = 'in_progress';
                  } else {
                    effectiveStatus = 'completed';
                  }
                }
                if (stage.stage_name === 'completion_confirmation') {
                  if (!completionStepReady) {
                    effectiveStatus = outcomeStepReady ? 'in_progress' : 'pending';
                  } else {
                    effectiveStatus = ['rejected', 'failed'].includes(overallStatus) ? 'failed' : 'completed';
                  }
                }
              }
            }
            
            const StatusIcon = getStatusIcon(effectiveStatus);
            const StageIcon = stageIcons[stage.stage_name] || Circle;
            const isActive = effectiveStatus === 'in_progress';
            
            // Check if this is the liveness_interaction step (index 4)
            const isLivenessStep = stage.stage_name === 'liveness_interaction';
            // Show verification checks animation after liveness step
            // Hide only after we're ready (animation done + final result + delay)
            const shouldShowVerificationAfterThis = isLivenessStep && showVerificationChecks && !readyToHideAnimation;
            
            return (
              <div key={stage.stage_name}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex items-center gap-2 p-2 rounded-lg transition-colors',
                  isActive && 'bg-muted ring-1 ring-blue-500/30',
                  effectiveStatus === 'completed' && 'opacity-70'
                )}
              >
                {/* Connection line - positioned from bottom of step */}
                {index < displayStages.length - 1 && !shouldShowVerificationAfterThis && (
                  <div
                    className={cn(
                      'absolute left-[19px] w-0.5 -bottom-2 h-4',
                      effectiveStatus === 'completed' ? 'bg-emerald-500/50' : 
                      effectiveStatus === 'failed' ? 'bg-red-500/50' : 'bg-border'
                    )}
                  />
                )}

                {/* Stage icon */}
                <div
                  className={cn(
                    'relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    effectiveStatus === 'completed' && 'bg-emerald-500/20',
                    effectiveStatus === 'in_progress' && 'bg-blue-500/20',
                    effectiveStatus === 'failed' && 'bg-red-500/20',
                    effectiveStatus === 'pending' && 'bg-muted'
                  )}
                >
                  {effectiveStatus === 'in_progress' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-3.5 h-3.5 text-blue-400" />
                    </motion.div>
                  ) : (
                    <StageIcon className={cn('w-3.5 h-3.5', getStatusColor(effectiveStatus))} />
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-xs font-medium leading-tight',
                      effectiveStatus === 'completed' && 'text-emerald-600 dark:text-emerald-300',
                      effectiveStatus === 'in_progress' && 'text-blue-600 dark:text-blue-300',
                      effectiveStatus === 'failed' && 'text-red-600 dark:text-red-300',
                      effectiveStatus === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {/* Always keep the step name as defined in stageLabels */}
                    {stageLabels[stage.stage_name] || stage.stage_name}
                    {effectiveStatus === 'in_progress' && <AnimatedDots />}
                  </p>
                  {/* Show short description for outcome_notification - only after step ready, hide after delay */}
                  {stage.stage_name === 'outcome_notification' && 
                    hasFinalResult && outcomeShortDesc && outcomeStepReady && !hideOutcomeDesc && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "flex items-center gap-1 text-[10px] mt-0.5 leading-snug font-medium",
                        ['approved', 'completed'].includes(overallStatus) && "text-emerald-600 dark:text-emerald-400",
                        ['rejected', 'failed'].includes(overallStatus) && "text-red-600 dark:text-red-400",
                        ['pending_review', 'manual_review'].includes(overallStatus) && "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {['approved', 'completed'].includes(overallStatus) && <CheckCircle2 className="w-3 h-3" />}
                      {['rejected', 'failed'].includes(overallStatus) && <XCircle className="w-3 h-3" />}
                      {['pending_review', 'manual_review'].includes(overallStatus) && <Loader2 className="w-3 h-3" />}
                      <span>{outcomeShortDesc}</span>
                    </motion.div>
                  )}
                  {/* Show long description for completion_confirmation step - only after step ready */}
                  {stage.stage_name === 'completion_confirmation' && 
                    hasFinalResult && completionDescription && completionStepReady && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "text-[10px] mt-0.5 leading-snug",
                        ['approved', 'completed'].includes(overallStatus) && "text-emerald-600/80 dark:text-emerald-400/80",
                        ['rejected', 'failed'].includes(overallStatus) && "text-red-600/80 dark:text-red-400/80",
                        ['pending_review', 'manual_review'].includes(overallStatus) && "text-amber-600/80 dark:text-amber-400/80"
                      )}
                    >
                      {completionDescription}
                    </motion.p>
                  )}
                  {stage.message && stage.stage_name !== 'outcome_notification' && stage.stage_name !== 'completion_confirmation' && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stage.message}
                    </p>
                  )}
                </div>

                {/* Status icon */}
                <StatusIcon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    getStatusColor(effectiveStatus),
                    effectiveStatus === 'in_progress' && 'animate-spin'
                  )}
                />
              </motion.div>
              
              {/* Verification Checks Animation - shown after liveness_interaction step */}
              {shouldShowVerificationAfterThis && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative ml-4 mt-1 mb-2"
                  >
                    {/* Connection line through the animation section */}
                    <div className="absolute left-[3px] top-0 bottom-0 w-0.5 bg-border" />
                    <VerificationChecksAnimation 
                      overallStatus={overallStatus}
                      onComplete={() => setVerificationAnimationDone(true)}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-redirect banner */}
      <AnimatePresence>
        {showRedirectBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pb-2"
          >
            <div className={cn(
              "p-3 rounded-lg",
              "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
              "border border-blue-500/30"
            )}>
              <div className="flex items-center justify-between gap-2">
                <div 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-1"
                >
                  <Home className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Return to Dashboard
                  </span>
                  <ArrowRight className="w-3 h-3 text-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  {!redirectCancelled ? (
                    <>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>in</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[16px] text-center">
                          {redirectCountdown}s
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedirectCancelled(true);
                        }}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded-md transition-colors",
                          "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                          "border border-border"
                        )}
                      >
                        Stay
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Click to exit →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with overall status */}
      <div className="p-4 border-t border-border">
        <div
          className={cn(
            'p-3 rounded-lg text-center text-sm font-medium',
            ['approved', 'completed'].includes(overallStatus) && 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
            ['rejected', 'failed'].includes(overallStatus) && 'bg-red-500/20 text-red-600 dark:text-red-300',
            overallStatus === 'pending_review' && 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
            !['approved', 'completed', 'rejected', 'failed', 'pending_review'].includes(overallStatus) && 
              'bg-muted text-muted-foreground'
          )}
        >
          {['approved', 'completed'].includes(overallStatus) && '🎉 Verification Successful!'}
          {['rejected', 'failed'].includes(overallStatus) && '❌ Verification Failed'}
          {overallStatus === 'pending_review' && '⏳ Manual Review Required'}
          {!['approved', 'completed', 'rejected', 'failed', 'pending_review'].includes(overallStatus) && 
            'Processing...'}
        </div>
      </div>
    </div>
  );
}

