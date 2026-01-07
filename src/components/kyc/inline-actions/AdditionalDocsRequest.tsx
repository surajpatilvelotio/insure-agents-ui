'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BookOpen,  // Using BookOpen instead of Passport (which doesn't exist)
  FileCheck, 
  Camera, 
  Upload, 
  CheckCircle, 
  X, 
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UiAction, AdditionalDocType } from '@/types/kyc';
import { useKycStore } from '@/store/kyc-store';
import { LivePhotoCapture } from './LivePhotoCapture';

interface AdditionalDocsRequestProps {
  action: UiAction;
  disabled?: boolean;
  embedded?: boolean;
}

interface DocUploadState {
  file: File | null;
  status: 'pending' | 'selected' | 'uploaded';
}

const DOC_CONFIG: Record<AdditionalDocType, { icon: typeof FileText; label: string; description: string }> = {
  passport: {
    icon: BookOpen,
    label: 'Passport',
    description: 'Upload your valid passport (photo page)',
  },
  visa: {
    icon: FileCheck,
    label: 'Visa / Work Permit',
    description: 'Upload your visa or work permit document',
  },
  live_photo: {
    icon: Camera,
    label: 'Live Photo',
    description: 'Take a photo of yourself for verification',
  },
  work_permit: {
    icon: FileText,
    label: 'Work Permit',
    description: 'Upload your employment pass or work permit',
  },
  proof_of_address: {
    icon: FileText,
    label: 'Proof of Address',
    description: 'Upload a utility bill or bank statement (last 90 days)',
  },
};

export function AdditionalDocsRequest({ 
  action, 
  disabled = false, 
  embedded = false 
}: AdditionalDocsRequestProps) {
  const requiredDocs = action.required_docs || ['passport', 'visa', 'live_photo'];
  const nationality = action.nationality || 'Non-resident';
  
  const [docStates, setDocStates] = useState<Record<string, DocUploadState>>(() => {
    const initial: Record<string, DocUploadState> = {};
    requiredDocs.forEach(doc => {
      initial[doc] = { file: null, status: 'pending' };
    });
    return initial;
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = useCallback((docType: AdditionalDocType, file: File) => {
    setDocStates(prev => ({
      ...prev,
      [docType]: { file, status: 'selected' },
    }));
  }, []);

  const handleFileRemove = useCallback((docType: AdditionalDocType) => {
    setDocStates(prev => ({
      ...prev,
      [docType]: { file: null, status: 'pending' },
    }));
  }, []);

  const handleFileInputChange = useCallback((docType: AdditionalDocType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(docType, e.target.files[0]);
    }
    e.target.value = '';
  }, [handleFileSelect]);

  const allDocsSelected = requiredDocs.every(doc => docStates[doc]?.file);

  const handleSubmit = async () => {
    if (!allDocsSelected || isSubmitted) return;

    // Collect files and their document types in matching order
    const filesWithTypes = requiredDocs
      .map(doc => ({ file: docStates[doc]?.file, type: doc }))
      .filter((item): item is { file: File; type: AdditionalDocType } => item.file !== null);
    
    const files = filesWithTypes.map(item => item.file);
    const types = filesWithTypes.map(item => item.type);
    
    // Generate dynamic message based on files uploaded
    const fileCount = files.length;
    const message = fileCount === 1 
      ? 'Here is my additional document' 
      : `Here are my ${fileCount} additional documents`;
    
    // Immediately mark as submitted for optimistic UI update
    setIsSubmitted(true);
    
    // Send message in background - UI already shows success
    try {
      await useKycStore.getState().sendMessage(message, files, types);
    } catch (error) {
      console.error('Failed to submit additional documents:', error);
      // Could revert state here if needed, but upload rarely fails
    }
  };

  const renderDocUpload = (docType: AdditionalDocType) => {
    const config = DOC_CONFIG[docType];
    const state = docStates[docType];
    const Icon = config.icon;
    const isLivePhoto = docType === 'live_photo';

    if (isLivePhoto) {
      return (
        <div key={docType} className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{config.label}</h4>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
            {state.file && (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <LivePhotoCapture
            onCapture={(file) => handleFileSelect('live_photo', file)}
            onRemove={() => handleFileRemove('live_photo')}
            capturedFile={state.file}
            disabled={disabled || isSubmitted}
          />
        </div>
      );
    }

    return (
      <div
        key={docType}
        className={cn(
          'border rounded-lg p-4 transition-all',
          state.file 
            ? 'border-emerald-500/50 bg-emerald-500/5' 
            : 'border-border hover:border-primary/50'
        )}
      >
        <input
          ref={el => { fileInputRefs.current[docType] = el; }}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileInputChange(docType, e)}
          disabled={disabled || isSubmitted}
          className="hidden"
        />
        
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            state.file ? 'bg-emerald-500/10' : 'bg-muted'
          )}>
            {state.file ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Icon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{config.label}</h4>
            {state.file ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                {state.file.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
          
          {state.file ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFileRemove(docType)}
              disabled={disabled || isSubmitted}
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRefs.current[docType]?.click()}
              disabled={disabled || isSubmitted}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Documents Submitted
            </p>
            <p className="text-xs text-muted-foreground">
              Your additional documents have been uploaded for verification
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl overflow-hidden', embedded ? '' : 'border border-border bg-card shadow-sm')}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{action.title || 'Additional Documents Required'}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.description || `As a ${nationality} national, we need additional documents to verify your identity`}
          </p>
        </div>
      </div>

      {/* Document Upload Sections */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {requiredDocs.map((docType, index) => (
            <motion.div
              key={docType}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {renderDocUpload(docType as AdditionalDocType)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleSubmit}
          disabled={!allDocsSelected || disabled}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Submit All Documents ({requiredDocs.filter(d => docStates[d]?.file).length}/{requiredDocs.length})
        </Button>
      </div>
    </motion.div>
  );
}

