'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, X, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import type { KycStatus } from '@/types';

const kycConfig: Record<KycStatus, {
  icon: typeof AlertCircle;
  title: string;
  message: string;
  bgClass: string;
  iconClass: string;
  showAction: boolean;
}> = {
  pending: {
    icon: AlertCircle,
    title: 'Complete Your KYC Verification',
    message: 'Verify your identity to unlock all features and ensure secure transactions.',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    iconClass: 'text-amber-500',
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
    bgClass: 'bg-accent/10 border-accent/20',
    iconClass: 'text-accent',
    showAction: false,
  },
};

export function KycBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.kycStatus === 'verified' || dismissed) {
    return null;
  }

  const config = kycConfig[user.kycStatus];
  const Icon = config.icon;

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
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              Start Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
