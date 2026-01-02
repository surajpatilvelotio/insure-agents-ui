'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UiAction } from '@/types/kyc';
import { useKycStore } from '@/store/kyc-store';

// Declaration Modal Component
function DeclarationModal({ isOpen, onClose, onAccept }: { isOpen: boolean; onClose: () => void; onAccept: () => void }) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToEnd(false);
    }
  }, [isOpen]);
  
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Consider "scrolled to end" when within 20px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 20) {
        setHasScrolledToEnd(true);
      }
    }
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Declaration & Consent</h3>
          <p className="text-xs text-muted-foreground mt-1">Please read the entire declaration to continue</p>
        </div>
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto max-h-[50vh] space-y-4 text-sm text-muted-foreground"
        >
          <p className="font-medium text-foreground">By submitting your documents, you declare and agree that:</p>
          <ol className="list-decimal list-inside space-y-3">
            <li>All information and documents provided are true, accurate, and complete to the best of my knowledge.</li>
            <li>I authorize the collection, use, and disclosure of my personal data for identity verification purposes in accordance with applicable data protection laws.</li>
            <li>I understand that my documents will be processed using automated systems including OCR and AI-based verification.</li>
            <li>I consent to my biometric data (facial image) being captured and used for identity verification and liveness detection.</li>
            <li>I acknowledge that providing false or misleading information may result in rejection of my application and potential legal consequences.</li>
            <li>I agree to the Terms of Service and Privacy Policy of the platform.</li>
            <li>I understand that my data may be shared with relevant regulatory authorities as required by law.</li>
            <li>I confirm that I am the rightful owner of the documents being submitted and have the legal authority to share them.</li>
            <li>I understand that the verification process may take up to 24-48 hours to complete in some cases.</li>
            <li>I agree to notify the platform immediately if any of my submitted information changes.</li>
          </ol>
          <div className="pt-4 border-t border-border mt-6">
            <p className="text-xs text-muted-foreground">
              This consent is valid for the duration of your account and the services provided. You may withdraw consent at any time by contacting our support team at support@insureshield.com.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: January 2025
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          {!hasScrolledToEnd && (
            <p className="text-xs text-amber-500 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Please scroll down to read the entire declaration
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={onAccept} 
              disabled={!hasScrolledToEnd}
              className={cn(
                hasScrolledToEnd
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              I Accept
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface FileUploadActionProps {
  action: UiAction;
  disabled?: boolean;
  embedded?: boolean; // When true, renders without outer card (for embedding in message bubble)
}

export function FileUploadAction({ action, disabled = false, embedded = false }: FileUploadActionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // Track uploaded file names
  const [isCompleted, setIsCompleted] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxFiles = action.maxFiles || 3;
  const accept = action.accept?.join(',') || 'image/*,.pdf';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isCompleted) setIsDragging(true);
  }, [disabled, isCompleted]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isCompleted) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles].slice(0, maxFiles));
  }, [disabled, isCompleted, maxFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled || isCompleted) return;
    
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, maxFiles));
    e.target.value = '';
  }, [disabled, isCompleted, maxFiles]);

  const removeFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0 || isCompleted) return;
    
    // Store file names BEFORE async operation (optimistic update)
    const fileNames = files.map(f => f.name);
    
    // Immediately mark as completed to prevent state loss on remount
    setUploadedFiles(fileNames);
    setIsCompleted(true);
    setFiles([]);
    
    // Send files in background - UI already shows success
    try {
      const messageText = files.length === 1 
        ? 'Here is my document' 
        : `Here are my ${files.length} documents`;
      await useKycStore.getState().sendMessage(messageText, files);
    } catch (error) {
      console.error('Upload failed:', error);
      // Could revert state here if needed, but upload rarely fails
    }
  };

  // Embedded mode - simpler styling for inside message bubble
  if (embedded) {
    // Completed state - show uploaded files with success message
    if (isCompleted && uploadedFiles.length > 0) {
      const uploadLabel = uploadedFiles.length === 1 ? 'Document Uploaded' : 'Documents Uploaded';
      return (
        <div className="p-4">
          <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {uploadLabel}
              </span>
            </div>
            <div className="space-y-1">
              {uploadedFiles.map((fileName) => (
                <div key={fileName} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileImage className="w-3 h-3" />
                  <span className="truncate">{fileName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isCompleted && !isCompleted && fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer text-center',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30',
            (disabled || isCompleted) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            disabled={disabled || isCompleted}
            className="hidden"
          />
          
          <Upload className={cn(
            'w-6 h-6 mx-auto mb-2',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Click or drag to upload'}
          </p>
          {action.description && (
            <p className="text-xs text-primary/80 mt-1">
              {action.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, or PDF (max {maxFiles} files)
          </p>
        </div>

        {/* Selected Files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              {files.map((file) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <FileImage className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    disabled={isCompleted}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Consent Checkbox */}
        {files.length > 0 && !isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => !consentChecked && setShowDeclaration(true)}
              className="flex items-start gap-2 cursor-pointer text-left w-full"
            >
              <div className={cn(
                "mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                consentChecked 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/50 hover:border-primary"
              )}>
                {consentChecked && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground">
                I have read and agree to all the{' '}
                <span className="text-primary hover:underline inline-flex items-center gap-0.5">
                  declaration
                  <ExternalLink className="w-3 h-3" />
                </span>
              </span>
            </button>
            
            {/* Alert message when not checked */}
            {!consentChecked && (
              <div className="flex items-center gap-1.5 text-amber-500">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">You must agree to the declaration to continue</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Upload Button */}
        {files.length > 0 && !isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <Button
              onClick={handleUpload}
              disabled={disabled || !consentChecked}
              size="sm"
              className={cn(
                "w-full",
                consentChecked 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Upload {files.length} {files.length === 1 ? 'Document' : 'Documents'}
            </Button>
          </motion.div>
        )}
        
        {/* Declaration Modal */}
        <DeclarationModal
          isOpen={showDeclaration}
          onClose={() => setShowDeclaration(false)}
          onAccept={() => {
            setConsentChecked(true);
            setShowDeclaration(false);
          }}
        />
      </div>
    );
  }

  // Standalone mode - full card styling
  
  // Completed state for standalone mode
  if (isCompleted && uploadedFiles.length > 0) {
    const standaloneUploadLabel = uploadedFiles.length === 1 ? 'Document Uploaded' : 'Documents Uploaded';
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 max-w-md"
      >
        <div className="bg-card rounded-xl border border-emerald-500/20 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {standaloneUploadLabel}
              </h4>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {uploadedFiles.map((fileName) => (
              <div key={fileName} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <FileImage className="w-4 h-4 text-emerald-500" />
                <span className="text-sm flex-1 truncate">{fileName}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md"
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-4 h-4 text-primary" />
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

        {/* Drop Zone */}
        <div className="p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && !isCompleted && !isCompleted && fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer text-center',
              isDragging && 'border-primary bg-primary/5',
              !isDragging && 'border-border hover:border-primary/50 hover:bg-muted/50',
              (disabled || isCompleted) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={maxFiles > 1}
              onChange={handleFileSelect}
              disabled={disabled || isCompleted}
              className="hidden"
            />
            
            <Upload className={cn(
              'w-8 h-8 mx-auto mb-2',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
            
            <p className="text-sm text-foreground font-medium">
              {isDragging ? 'Drop files here' : 'Click or drag to upload'}
            </p>
            {action.description && (
              <p className="text-xs text-primary/80 mt-1">
                {action.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, or PDF (max {maxFiles} files)
            </p>
          </div>

          {/* Selected Files */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {files.map((file) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                  >
                    <FileImage className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.name);
                      }}
                      disabled={isCompleted}
                      className="p-1 hover:bg-secondary rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Consent Checkbox */}
          {files.length > 0 && !isCompleted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => !consentChecked && setShowDeclaration(true)}
                className="flex items-start gap-2 cursor-pointer text-left w-full"
              >
                <div className={cn(
                  "mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                  consentChecked 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/50 hover:border-primary"
                )}>
                  {consentChecked && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  I have read and agree to all the{' '}
                  <span className="text-primary hover:underline inline-flex items-center gap-0.5">
                    declaration
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </span>
              </button>
              
              {/* Alert message when not checked */}
              {!consentChecked && (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">You must agree to the declaration to continue</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Upload Button */}
          {files.length > 0 && !isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <Button
                onClick={handleUpload}
                disabled={disabled || !consentChecked}
                className={cn(
                  "w-full",
                  consentChecked 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Upload {files.length} {files.length === 1 ? 'Document' : 'Documents'}
              </Button>
            </motion.div>
          )}
          
          {/* Declaration Modal */}
          <DeclarationModal
            isOpen={showDeclaration}
            onClose={() => setShowDeclaration(false)}
            onAccept={() => {
              setConsentChecked(true);
              setShowDeclaration(false);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

