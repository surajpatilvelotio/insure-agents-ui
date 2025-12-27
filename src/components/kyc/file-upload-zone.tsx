'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onApprove: () => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}

export function FileUploadZone({
  files,
  onFilesChange,
  onApprove,
  maxFiles = 2,
  accept = 'image/*,.pdf',
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = [...files, ...droppedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  }, [files, maxFiles, onFilesChange, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return;
    
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  }, [files, maxFiles, onFilesChange, disabled]);

  const removeFile = useCallback((fileName: string) => {
    onFilesChange(files.filter(f => f.name !== fileName));
  }, [files, onFilesChange]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm"
    >
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer',
          isDragging && 'border-blue-500 bg-blue-500/10',
          !isDragging && 'border-slate-600 hover:border-slate-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isDragging ? 'bg-blue-500/20' : 'bg-slate-700/50'
            )}
          >
            <Upload className={cn(
              'w-6 h-6',
              isDragging ? 'text-blue-400' : 'text-slate-400'
            )} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-200">
              {isDragging ? 'Drop your file here' : 'Drag & drop your ID document'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or click to browse (PNG, JPG, PDF)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
              >
                <FileImage className="w-5 h-5 text-blue-400" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 hover:bg-slate-600/50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Button */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <Button
            onClick={onApprove}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve & Upload Document
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

