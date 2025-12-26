'use client';

import { motion } from 'framer-motion';
import { FileUp, CheckCircle, Edit3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToolApproval, ExtractedData } from '@/types/kyc';
import { FileUploadZone } from './file-upload-zone';

interface ToolApprovalCardProps {
  approval: ToolApproval;
  extractedData?: ExtractedData | null;
  pendingFiles: File[];
  onFilesChange: (files: File[]) => void;
  onApprove: () => void;
  onReject?: () => void;
  disabled?: boolean;
}

export function ToolApprovalCard({
  approval,
  extractedData,
  pendingFiles,
  onFilesChange,
  onApprove,
  onReject,
  disabled = false,
}: ToolApprovalCardProps) {
  if (approval.type === 'file_upload') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 my-2"
      >
        <div className="bg-card rounded-2xl border border-border overflow-hidden backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-blue-500/5">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {approval.title}
              </h4>
              <p className="text-xs text-muted-foreground">{approval.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <FileUploadZone
              files={pendingFiles}
              onFilesChange={onFilesChange}
              onApprove={onApprove}
              disabled={disabled}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (approval.type === 'confirm_data' && extractedData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 my-2"
      >
        <div className="bg-card rounded-2xl border border-border overflow-hidden backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-emerald-500/5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {approval.title}
              </h4>
              <p className="text-xs text-muted-foreground">{approval.description}</p>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="p-4">
            <div className="bg-muted rounded-xl p-4 space-y-3">
              {Object.entries(extractedData).map(([key, value]) => {
                if (!value || key === 'document_type') return null;
                
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              {onReject && (
                <Button
                  variant="outline"
                  onClick={onReject}
                  disabled={disabled}
                  className="flex-1"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Data Incorrect
                </Button>
              )}
              <Button
                onClick={onApprove}
                disabled={disabled}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Continue
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Generic approval card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 my-2"
    >
      <div className="bg-card rounded-2xl border border-border p-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {approval.title}
            </h4>
            <p className="text-xs text-muted-foreground">{approval.description}</p>
          </div>
        </div>

        <Button
          onClick={onApprove}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve & Continue
        </Button>
      </div>
    </motion.div>
  );
}

