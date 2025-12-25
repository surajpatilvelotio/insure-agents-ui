'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, X, CheckCircle2, XCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import type { KycStatus } from '@/types';

// Extended status type to include backend values
type ExtendedKycStatus = KycStatus | 'approved' | 'in_progress';

const kycConfig: Record<string, {
  icon: typeof AlertCircle;
  title: string;
  message: string;
  bgClass: string;
  iconClass: string;
  showAction: boolean;
  isVerified?: boolean;
}> = {
  pending: {
    icon: AlertCircle,
    title: 'Complete Your KYC Verification',
    message: 'Verify your identity to unlock all features and ensure secure transactions.',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    iconClass: 'text-amber-500',
    showAction: true,
  },
  in_progress: {
    icon: AlertCircle,
    title: 'KYC Verification In Progress',
    message: 'Your verification is being processed. Please complete the remaining steps.',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    iconClass: 'text-blue-500',
    showAction: true,
  },
  rejected: {
    icon: XCircle,
    title: 'KYC Verification Failed',
    message: 'Your verification was unsuccessful. Please try again with valid documents.',
    bgClass: 'bg-destructive/10 border-destructive/20',
    iconClass: 'text-destructive',
    showAction: true,
  },
  verified: {
    icon: CheckCircle2,
    title: 'KYC Verified',
    message: 'Your identity has been verified successfully.',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    iconClass: 'text-emerald-500',
    showAction: false,
    isVerified: true,
  },
  approved: {
    icon: CheckCircle2,
    title: 'KYC Verified',
    message: 'Your identity has been verified successfully.',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    iconClass: 'text-emerald-500',
    showAction: false,
    isVerified: true,
  },
};

export function KycBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!user) {
    return null;
  }

  // Get config with fallback to 'pending' for unknown statuses
  const status = user.kycStatus && kycConfig[user.kycStatus] ? user.kycStatus : 'pending';
  const config = kycConfig[status];
  const Icon = config.icon;

  // If verified/approved, show a compact verified badge instead of banner
  if (config.isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-emerald-400">Identity Verified</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-400">Your account is fully verified and secure</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Hide if dismissed (only for non-verified statuses)
  if (dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${config.bgClass} border rounded-lg p-4 mb-6`}
    >
      <div className="flex items-start gap-4">
        <div className={`${config.iconClass} mt-0.5`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{config.message}</p>
        </div>

        <div className="flex items-center gap-2">
          {config.showAction && (
            <Link href="/kyc/chat">
              <Button size="sm" variant="outline" className="whitespace-nowrap">
                Start Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
