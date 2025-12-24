'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Car, Home, Umbrella, ArrowRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PolicySummary, PolicyType, PolicyStatus } from '@/types';
import { POLICY_TYPE_LABELS, POLICY_STATUS_LABELS, PREMIUM_FREQUENCY_LABELS } from '@/lib/constants';

const policyIcons: Record<PolicyType, typeof Heart> = {
  health: Heart,
  life: Umbrella,
  auto: Car,
  home: Home,
};

const policyColors: Record<PolicyType, { icon: string; bg: string }> = {
  health: { icon: 'text-red-500', bg: 'bg-red-500/10' },
  life: { icon: 'text-blue-500', bg: 'bg-blue-500/10' },
  auto: { icon: 'text-amber-500', bg: 'bg-amber-500/10' },
  home: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

const statusColors: Record<PolicyStatus, string> = {
  active: 'bg-accent/10 text-accent border-accent/20',
  expired: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface PolicyCardProps {
  policy: PolicySummary;
  index?: number;
}

export function PolicyCard({ policy, index = 0 }: PolicyCardProps) {
  const Icon = policyIcons[policy.type];
  const colors = policyColors[policy.type];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{policy.name}</h3>
                <p className="text-sm text-muted-foreground">{policy.policyNumber}</p>
              </div>
            </div>
            <Badge variant="outline" className={statusColors[policy.status]}>
              {POLICY_STATUS_LABELS[policy.status]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Coverage Amount</p>
              <p className="font-semibold">{formatCurrency(policy.coverageAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Premium</p>
              <p className="font-semibold text-primary">
                {formatCurrency(policy.premiumAmount)}
                <span className="text-xs text-muted-foreground font-normal">
                  {PREMIUM_FREQUENCY_LABELS[policy.premiumFrequency]}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {policy.memberCount} {policy.memberCount === 1 ? 'member' : 'members'}
              </span>
              <span>Expires {formatDate(policy.endDate)}</span>
            </div>

            <Link href={`/policies/${policy.id}`}>
              <Button variant="ghost" size="sm" className="group-hover:text-primary">
                View Details
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
