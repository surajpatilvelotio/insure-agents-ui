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
  // Document stages
  'initiated': FileSearch,
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
  // Review stages
  'user_review': UserCheck,
  'data_review': UserCheck,
  'pending_user_review': UserCheck,
  // Verification stages (user_confirmed triggers gov verification)
  'user_confirmed': Shield,
  'government_verification': Shield,
  'gov_verification': Shield,
  'gov_verification_pending': Shield,
  'gov_verification_failed': Shield,
  // Fraud stages
  'fraud_detection': AlertTriangle,
  'fraud_check': AlertTriangle,
  'fraud_check_pending': AlertTriangle,
  'security_check': AlertTriangle,
  'fraud_check_failed': AlertTriangle,
  // Decision stages
  'decision': Award,
  'decision_made': Award,
  'final_decision': Award,
  'pending_decision': Award,
};

const stageLabels: Record<string, string> = {
  // Document stages
  'initiated': 'Document Processing',
  'document_uploaded': 'Document Processing',
  'document_processing': 'Document Processing',
  'documents_uploaded': 'Document Processing',
  'ocr': 'Document Analysis',
  'ocr_extraction': 'Text Extraction',
  'ocr_processing': 'Document Processing',
  'data_extracted': 'Data Extraction',
  'pending_ocr': 'Document Processing',
  'processing': 'Document Processing',
  'ocr_failed': 'Document Processing',
  // Review stages
  'user_review': 'Data Review',
  'data_review': 'Data Review',
  'pending_user_review': 'Data Review',
  // Gov verification stages (user_confirmed triggers gov verification)
  'user_confirmed': 'Gov. Verification',
  'government_verification': 'Gov. Verification',
  'gov_verification': 'Gov. Verification',
  'gov_verification_pending': 'Gov. Verification',
  'gov_verification_failed': 'Gov. Verification',
  // Fraud stages
  'fraud_detection': 'Security Check',
  'fraud_check': 'Security Check',
  'fraud_check_pending': 'Security Check',
  'security_check': 'Security Check',
  'fraud_check_failed': 'Security Check',
  // Decision stages
  'decision': 'Final Decision',
  'decision_made': 'Final Decision',
  'final_decision': 'Final Decision',
  'pending_decision': 'Final Decision',
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
    { stage_name: 'ocr_processing', status: 'pending' },
    { stage_name: 'user_review', status: 'pending' },
    { stage_name: 'gov_verification', status: 'pending' },
    { stage_name: 'fraud_detection', status: 'pending' },
    { stage_name: 'decision', status: 'pending' },
  ];

  // Map backend stage names to UI stage names (for merging stage status)
  const stageMergeMapping: Record<string, string[]> = {
    'ocr_processing': [
      'ocr_processing', 'ocr_extraction', 'document_uploaded', 
      'documents_uploaded', 'data_extracted', 'pending_ocr', 'ocr_failed'
    ],
    'user_review': [
      'user_review', 'data_review', 'pending_user_review'
    ],
    'gov_verification': [
      'gov_verification', 'government_verification', 'gov_verification_pending',
      'gov_verification_failed', 'gov_verification_passed'
    ],
    'fraud_detection': [
      'fraud_detection', 'fraud_check', 'fraud_check_pending',
      'fraud_check_failed', 'fraud_check_passed'
    ],
    'decision': [
      'decision', 'decision_made', 'pending_decision'
    ],
  };

  // Merge backend stages with defaults - always show all stages
  const displayStages: KycStage[] = defaultStages.map((defaultStage) => {
    // Find matching stage from backend
    const validStageNames = stageMergeMapping[defaultStage.stage_name] || [defaultStage.stage_name];
    const backendStage = stages.find((s) => validStageNames.includes(s.stage_name));
    
    // If we found a backend stage, use its status but keep our display stage_name
    if (backendStage) {
      return { ...defaultStage, status: backendStage.status, message: backendStage.message };
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
      'ocr_processing': [
        // Document processing - only when documents are actually being processed
        'document_uploaded', 'documents_uploaded', 
        'ocr_extraction', 'ocr_processing', 'data_extracted',
        'pending_ocr', 'processing', 'ocr_failed'
      ],
      'user_review': [
        // Data review - when waiting for user to review/confirm
        'pending_user_review', 'user_review', 'data_review'
      ],
      'gov_verification': [
        // Gov verification - starts after user confirms
        'user_confirmed', 'gov_verification', 'government_verification',
        'gov_verification_pending', 'gov_verification_failed', 'gov_verification_passed'
      ],
      'fraud_detection': [
        // Security check
        'fraud_check', 'fraud_detection', 'fraud_check_pending',
        'fraud_check_failed', 'fraud_check_passed'
      ],
      'decision': [
        // Final decision
        'decision_made', 'decision', 'pending_decision'
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
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive && 'bg-muted ring-1 ring-blue-500/30',
                  effectiveStatus === 'completed' && 'opacity-70'
                )}
              >
                {/* Connection line */}
                {index < displayStages.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[23px] top-[44px] w-0.5 h-6',
                      effectiveStatus === 'completed' ? 'bg-emerald-500/50' : 'bg-border'
                    )}
                  />
                )}

                {/* Stage icon */}
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center',
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
                      <Loader2 className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  ) : (
                    <StageIcon className={cn('w-4 h-4', getStatusColor(effectiveStatus))} />
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium flex items-center',
                      effectiveStatus === 'completed' && 'text-emerald-600 dark:text-emerald-300',
                      effectiveStatus === 'in_progress' && 'text-blue-600 dark:text-blue-300',
                      effectiveStatus === 'failed' && 'text-red-600 dark:text-red-300',
                      effectiveStatus === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    <span className="truncate">
                      {stageLabels[stage.stage_name] || stage.stage_name}
                    </span>
                    {effectiveStatus === 'in_progress' && <AnimatedDots />}
                  </p>
                  {stage.message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
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

