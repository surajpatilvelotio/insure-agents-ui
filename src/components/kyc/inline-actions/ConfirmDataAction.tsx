'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UiAction, ExtractedData, DocumentExtractedData } from '@/types/kyc';
import { useKycStore } from '@/store/kyc-store';

interface ConfirmDataActionProps {
  action: UiAction;
  disabled?: boolean;
  embedded?: boolean;
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  
  const strValue = String(value).trim().toUpperCase();
  if (['UNREADABLE', 'N/A', 'UNKNOWN', ''].includes(strValue)) return null;
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      const validItems = value.filter(v => typeof v === 'string' || typeof v === 'number');
      return validItems.length > 0 ? validItems.join(', ') : null;
    }
    return null;
  }
  
  return String(value);
}

function getDisplayFields(data: Record<string, unknown> | null | undefined): Array<[string, string]> {
  if (!data) return [];
  return Object.entries(data)
    .filter(([key]) => key !== 'document_type' && !key.startsWith('_'))
    .map(([key, value]) => [key, formatValue(value)] as [string, string | null])
    .filter((entry): entry is [string, string] => entry[1] !== null);
}

function DataSection({ 
  title, 
  data, 
  showTitle = false 
}: { 
  title?: string; 
  data: Record<string, unknown> | null | undefined; 
  showTitle?: boolean;
}) {
  const displayFields = getDisplayFields(data);

  if (displayFields.length === 0) return null;

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
      {showTitle && title && (
        <div className="flex items-center gap-2 pb-2 border-b border-border/50 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
      )}
      {displayFields.map(([key, value]) => (
        <div key={key} className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {formatFieldName(key)}
          </span>
          <span className="text-sm font-medium text-right">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDataAction({ action, disabled = false, embedded = false }: ConfirmDataActionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<'confirmed' | 'rejected' | null>(null);
  
  const mergedData = action.data as ExtractedData | undefined;
  const documents = action.documents as DocumentExtractedData[] | undefined;
  const hasMultipleDocuments = documents && documents.length > 1;

  const handleConfirm = async () => {
    if (isProcessing || decision) return;
    
    setIsProcessing(true);
    setDecision('confirmed');
    
    try {
      await useKycStore.getState().sendMessage(
        'Yes the data is correct. Please verify and complete my KYC.'
      );
    } catch (error) {
      console.error('Confirmation failed:', error);
      setDecision(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing || decision) return;
    
    setIsProcessing(true);
    setDecision('rejected');
    
    try {
      await useKycStore.getState().sendMessage(
        'The extracted data is not correct. Please let me upload a different document.'
      );
    } catch (error) {
      console.error('Rejection failed:', error);
      setDecision(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayFields = mergedData ? getDisplayFields(mergedData) : [];

  const hasValidDocumentData = documents && documents.some(doc => {
    const docData = doc.data || (doc as Record<string, unknown>).extracted_data as Record<string, unknown>;
    return docData && Object.keys(docData).length > 0;
  });
  
  const showPerDocumentView = hasMultipleDocuments && hasValidDocumentData;

  if (embedded) {
    return (
      <div className="p-4">
        {showPerDocumentView ? (
          <div className="space-y-3 mb-3">
            {documents!.map((doc, index) => {
              const docData = doc.data || (doc as Record<string, unknown>).extracted_data as Record<string, unknown>;
              return (
                <DataSection
                  key={doc.filename || index}
                  title={doc.filename || `Document ${index + 1}`}
                  data={docData}
                  showTitle={true}
                />
              );
            })}
          </div>
        ) : displayFields.length > 0 ? (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 mb-3">
            {displayFields.map(([key, value]) => (
              <div key={key} className="flex justify-between items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {formatFieldName(key)}
                </span>
                <span className="text-sm font-medium text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2 mb-3">
            No data to display
          </p>
        )}

        {!decision && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={disabled || isProcessing}
              className="flex-1"
            >
              {isProcessing && decision === 'rejected' ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              Incorrect
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={disabled || isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isProcessing && decision === 'confirmed' ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Confirm
            </Button>
          </div>
        )}

        {decision && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-2 rounded-lg text-center text-sm font-medium ${
              decision === 'confirmed'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            {decision === 'confirmed' ? (
              <>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Data Confirmed
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 inline mr-1" />
                Rejected
              </>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md"
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-emerald-500/5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">
              {action.title}
            </h4>
            {action.description && (
              <p className="text-xs text-muted-foreground truncate">
                {action.description}
              </p>
            )}
          </div>
        </div>

        <div className="p-4">
          {showPerDocumentView ? (
            <div className="space-y-3">
              {documents!.map((doc, index) => {
                const docData = doc.data || (doc as Record<string, unknown>).extracted_data as Record<string, unknown>;
                return (
                  <DataSection
                    key={doc.filename || index}
                    title={doc.filename || `Document ${index + 1}`}
                    data={docData}
                    showTitle={true}
                  />
                );
              })}
            </div>
          ) : displayFields.length > 0 ? (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              {displayFields.map(([key, value]) => (
                <div key={key} className="flex justify-between items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {formatFieldName(key)}
                  </span>
                  <span className="text-sm text-foreground font-medium text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data to display
            </p>
          )}

          {!decision && (
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={disabled || isProcessing}
                className="flex-1"
              >
                {isProcessing && decision === 'rejected' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Incorrect
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={disabled || isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isProcessing && decision === 'confirmed' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm
              </Button>
            </div>
          )}

          {decision && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
                decision === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {decision === 'confirmed' ? (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Data Confirmed
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 inline mr-2" />
                  Data Rejected
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

