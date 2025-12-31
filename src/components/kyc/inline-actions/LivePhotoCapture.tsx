'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, CheckCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LivePhotoCaptureProps {
  onCapture: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  capturedFile?: File | null;
  instructions?: string;
}

export function LivePhotoCapture({
  onCapture,
  onRemove,
  disabled = false,
  capturedFile = null,
  instructions = 'Position your face in the frame and take a photo',
}: LivePhotoCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || disabled) return;

    const file = e.target.files[0];
    
    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onCapture(file);
    
    // Reset input
    e.target.value = '';
  }, [disabled, onCapture]);

  const handleRetake = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onRemove?.();
    fileInputRef.current?.click();
  }, [previewUrl, onRemove]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onRemove?.();
  }, [previewUrl, onRemove]);

  const openFilePicker = () => {
    if (!disabled && !previewUrl) {
      fileInputRef.current?.click();
    }
  };

  const hasCapture = previewUrl || capturedFile;

  return (
    <div className="flex flex-col items-center p-4">
      {/* Camera Frame - Rectangular for full photo visibility */}
      <motion.div
        className={cn(
          'relative w-64 h-48 rounded-xl overflow-hidden border-4 cursor-pointer transition-all',
          hasCapture
            ? 'border-emerald-500 dark:border-emerald-400'
            : 'border-dashed border-muted-foreground/40 hover:border-primary/60',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={openFilePicker}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={!hasCapture && !disabled ? { scale: 1.02 } : {}}
        whileTap={!hasCapture && !disabled ? { scale: 0.98 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              {isHovering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <RefreshCw className="w-8 h-8 text-white" />
                </motion.div>
              )}
              {/* Success indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center bg-muted/30"
            >
              <div className="relative">
                {/* Face silhouette placeholder */}
                <div className="w-16 h-20 rounded-lg bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
                {/* Camera icon overlay */}
                <motion.div
                  animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning animation when no capture */}
        {!hasCapture && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-3 border-2 border-primary/30 rounded-lg" />
          </motion.div>
        )}
      </motion.div>

      {/* Instructions */}
      <p className="mt-4 text-sm text-muted-foreground text-center max-w-[200px]">
        {hasCapture ? 'Photo captured successfully' : instructions}
      </p>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {hasCapture ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetake}
              disabled={disabled}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </>
        ) : (
          <Button
            onClick={openFilePicker}
            disabled={disabled}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        )}
      </div>
    </div>
  );
}

