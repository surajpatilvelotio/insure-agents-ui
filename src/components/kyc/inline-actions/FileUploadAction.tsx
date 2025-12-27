'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UiAction } from '@/types/kyc';
import { useKycStore } from '@/store/kyc-store';

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
      await useKycStore.getState().sendMessage('Here is my documents', files);
    } catch (error) {
      console.error('Upload failed:', error);
      // Could revert state here if needed, but upload rarely fails
    }
  };

  // Embedded mode - simpler styling for inside message bubble
  if (embedded) {
    // Completed state - show uploaded files with success message
    if (isCompleted && uploadedFiles.length > 0) {
      return (
        <div className="p-4">
          <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Documents Uploaded
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

        {/* Upload Button */}
        {files.length > 0 && !isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <Button
              onClick={handleUpload}
              disabled={disabled}
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Upload {files.length} {files.length === 1 ? 'Document' : 'Documents'}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Standalone mode - full card styling
  
  // Completed state for standalone mode
  if (isCompleted && uploadedFiles.length > 0) {
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
                Documents Uploaded
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

          {/* Upload Button */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <Button
                onClick={handleUpload}
                disabled={disabled}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Upload {files.length} {files.length === 1 ? 'Document' : 'Documents'}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

