'use client';

import { motion } from 'framer-motion';
import { Shield, DollarSign, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PolicySummary } from '@/types';

interface QuickStatsProps {
  policies: PolicySummary[];
}

export function QuickStats({ policies }: QuickStatsProps) {
  const activePolicies = policies.filter((p) => p.status === 'active').length;

  const totalCoverage = policies
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.coverageAmount, 0);

  const monthlyPremium = policies
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => {
      if (p.premiumFrequency === 'monthly') return sum + p.premiumAmount;
      if (p.premiumFrequency === 'quarterly') return sum + p.premiumAmount / 3;
      if (p.premiumFrequency === 'yearly') return sum + p.premiumAmount / 12;
      return sum;
    }, 0);

  const totalMembers = policies
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.memberCount, 0);

  const upcomingRenewal = policies
    .filter((p) => p.status === 'active')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];

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
    });
  };

  const stats = [
    {
      label: 'Active Policies',
      value: activePolicies.toString(),
      icon: Shield,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Coverage',
      value: formatCurrency(totalCoverage),
      icon: Shield,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Monthly Premium',
      value: formatCurrency(monthlyPremium),
      icon: DollarSign,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Covered Members',
      value: totalMembers.toString(),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
