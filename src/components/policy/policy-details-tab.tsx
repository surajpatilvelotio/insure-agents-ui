'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, Shield, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Policy } from '@/types';
import { POLICY_TYPE_LABELS, PREMIUM_FREQUENCY_LABELS } from '@/lib/constants';

interface PolicyDetailsTabProps {
  policy: Policy;
}

export function PolicyDetailsTab({ policy }: PolicyDetailsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const daysUntilRenewal = () => {
    const today = new Date();
    const renewal = new Date(policy.renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renewalDays = daysUntilRenewal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Renewal Alert */}
      {renewalDays <= 30 && renewalDays > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Renewal Coming Up</p>
                <p className="text-sm text-muted-foreground">
                  Your policy will renew in {renewalDays} days. Review your coverage and make any necessary changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Coverage Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Coverage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Policy Type</span>
              <span className="font-medium">{POLICY_TYPE_LABELS[policy.type]}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Coverage Amount</span>
              <span className="font-semibold text-lg">{formatCurrency(policy.coverageAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Deductible</span>
              <span className="font-medium">{formatCurrency(policy.deductible)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Covered Members</span>
              <span className="font-medium">{policy.members.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Premium Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Premium Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Premium Amount</span>
              <span className="font-semibold text-lg text-primary">
                {formatCurrency(policy.premiumAmount)}
                <span className="text-sm text-muted-foreground font-normal">
                  {PREMIUM_FREQUENCY_LABELS[policy.premiumFrequency]}
                </span>
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment Frequency</span>
              <span className="font-medium capitalize">{policy.premiumFrequency}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Annual Premium</span>
              <span className="font-medium">
                {formatCurrency(
                  policy.premiumFrequency === 'monthly'
                    ? policy.premiumAmount * 12
                    : policy.premiumFrequency === 'quarterly'
                    ? policy.premiumAmount * 4
                    : policy.premiumAmount
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Policy Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{formatDate(policy.startDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{formatDate(policy.endDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Renewal Date</span>
              <span className="font-medium">{formatDate(policy.renewalDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Days Until Renewal</span>
              <span className={`font-medium ${renewalDays <= 30 ? 'text-amber-500' : ''}`}>
                {renewalDays > 0 ? `${renewalDays} days` : 'Due for renewal'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Policy Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Policy Number</span>
              <span className="font-mono font-medium">{policy.policyNumber}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Policy ID</span>
              <span className="font-mono text-sm">{policy.id}</span>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground block mb-2">Description</span>
              <p className="text-sm">{policy.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
