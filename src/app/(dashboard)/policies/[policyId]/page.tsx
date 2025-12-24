'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Car, Home, Umbrella, Download, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PolicyDetailsTab } from '@/components/policy/policy-details-tab';
import { MemberDetailsTab } from '@/components/policy/member-details-tab';
import { usePolicy } from '@/hooks/use-policies';
import { POLICY_TYPE_LABELS, POLICY_STATUS_LABELS } from '@/lib/constants';
import type { PolicyType, PolicyStatus } from '@/types';

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

function PolicyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

interface PolicyDetailPageProps {
  params: Promise<{ policyId: string }>;
}

export default function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  const resolvedParams = use(params);
  const { policy, isLoading, error } = usePolicy(resolvedParams.policyId);

  if (isLoading) {
    return <PolicyDetailSkeleton />;
  }

  if (error || !policy) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          {error || 'Policy not found'}
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = policyIcons[policy.type];
  const colors = policyColors[policy.type];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Policy Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl ${colors.bg} ${colors.icon}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{policy.name}</h1>
              <Badge variant="outline" className={statusColors[policy.status]}>
                {POLICY_STATUS_LABELS[policy.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {policy.policyNumber} • {POLICY_TYPE_LABELS[policy.type]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Policy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>File a Claim</DropdownMenuItem>
              <DropdownMenuItem>Renew Policy</DropdownMenuItem>
              <DropdownMenuItem>Contact Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="details">Policy Details</TabsTrigger>
            <TabsTrigger value="members">
              Members ({policy.members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <PolicyDetailsTab policy={policy} />
          </TabsContent>

          <TabsContent value="members">
            <MemberDetailsTab members={policy.members} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
