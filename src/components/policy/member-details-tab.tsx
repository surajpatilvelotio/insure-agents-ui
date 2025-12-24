'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { PolicyMember } from '@/types';
import { RELATIONSHIP_LABELS } from '@/lib/constants';

interface MemberDetailsTabProps {
  members: PolicyMember[];
}

const relationshipColors: Record<string, string> = {
  self: 'bg-primary/10 text-primary border-primary/20',
  spouse: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  child: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  parent: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  other: 'bg-muted text-muted-foreground border-muted',
};

export function MemberDetailsTab({ members }: MemberDetailsTabProps) {
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isPrimaryMember) return -1;
    if (b.isPrimaryMember) return 1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Covered Members</h3>
          <p className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? 'member' : 'members'} covered under this policy
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className={member.isPrimaryMember ? 'border-primary/30 bg-primary/5' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-14 w-14 border-2 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">
                        {member.firstName} {member.lastName}
                      </h4>
                      <Badge variant="outline" className={relationshipColors[member.relationship]}>
                        {member.isPrimaryMember && <Crown className="h-3 w-3 mr-1" />}
                        {RELATIONSHIP_LABELS[member.relationship]}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {/* Age */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="font-medium">{member.age} years</p>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded bg-muted">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{formatDate(member.dateOfBirth)}</p>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded bg-muted">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium truncate">{member.email}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded bg-muted">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{member.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
