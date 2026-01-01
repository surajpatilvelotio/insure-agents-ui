'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  XCircle,
  FileSearch,
  UserCheck,
  Shield,
  AlertTriangle,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KycStage, KycStageStatus } from '@/types/kyc';

interface StatusPanelProps {
  stages: KycStage[];
  currentStage: string | null;
  overallStatus: string;
}

const stageIcons: Record<string, React.ElementType> = {
  // 1. Identity Journey Initiation
  'journey_initiation': FileSearch,
  'initiated': FileSearch,
  
  // 2. Consent & Privacy Authorization
  'consent_authorization': Shield,
  
  // 3. Smart Document Capture
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
  
  // 2. Consent & Privacy Authorization
  'consent_authorization': 'Consent & Privacy Authorization',
  
  // 3. Smart Document Capture
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

export function StatusPanel({ stages, currentStage, overallStatus }: StatusPanelProps) {
  // Default stages - always show all of these
  const defaultStages: KycStage[] = [
    { stage_name: 'journey_initiation', status: 'pending' },
    { stage_name: 'consent_authorization', status: 'pending' },
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
    'consent_authorization': [
      // This stage auto-completes when document_capture starts (no direct backend mapping)
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

  // Determine the highest stage reached based on currentStage or backend stages
  const stageOrder = [
    'journey_initiation', 'consent_authorization', 'document_capture',
    'presence_confirmation', 'liveness_interaction', 'outcome_notification', 'completion_confirmation'
  ];
  
  // Map backend stages to UI stage index
  // Index 0 = Identity Journey Initiation (auto-complete when docs uploaded)
  // Index 1 = Consent & Privacy Authorization (auto-complete when docs uploaded)
  // Index 2 = Smart Document Capture
  const backendToUIStageIndex: Record<string, number> = {
    'initiated': 0,  // Only first stage in progress
    'document_uploaded': 2, 'documents_uploaded': 2, 'ocr_processing': 2, 
    'ocr_extraction': 2, 'data_extracted': 2, 'pending_ocr': 2, 'ocr_failed': 2, 'ocr_completed': 2,
    'user_review': 3, 'data_review': 3, 'pending_user_review': 3,
    'user_confirmed': 4, 'gov_verification': 4, 'government_verification': 4,
    'gov_verification_pending': 4, 'gov_verification_failed': 4,
    'fraud_detection': 5, 'fraud_check': 5, 'fraud_check_pending': 5, 'fraud_check_failed': 5,
    'decision': 6, 'decision_made': 6, 'pending_decision': 6, 'completed': 6,
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
    if (!currentStage) return false;
    // Check if this stage matches currentStage (from backend)
    if (currentStage === stageName) return true;
    
    // Map backend current_stage values to UI stages
    // Only highlight when the stage is actually being processed
    const stageMapping: Record<string, string[]> = {
      'journey_initiation': [
        'initiated'  // Only first stage in-progress at init
      ],
      'consent_authorization': [
        // No direct mapping - auto-completes with journey_initiation
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
            const effectiveStatus = isProcessing && stage.status === 'pending' ? 'in_progress' : stage.status;
            const StatusIcon = getStatusIcon(effectiveStatus);
            const StageIcon = stageIcons[stage.stage_name] || Circle;
            const isActive = isProcessing;
            
            return (
              <motion.div
                key={stage.stage_name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative flex items-center gap-2 p-2 rounded-lg transition-colors',
                  isActive && 'bg-muted ring-1 ring-blue-500/30',
                  effectiveStatus === 'completed' && 'opacity-70'
                )}
              >
                {/* Connection line */}
                {index < displayStages.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[19px] top-[36px] w-0.5 h-4',
                      effectiveStatus === 'completed' ? 'bg-emerald-500/50' : 'bg-border'
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
                    {stageLabels[stage.stage_name] || stage.stage_name}
                    {effectiveStatus === 'in_progress' && <AnimatedDots />}
                  </p>
                  {stage.message && (
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
            );
          })}
        </div>
      </div>

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

