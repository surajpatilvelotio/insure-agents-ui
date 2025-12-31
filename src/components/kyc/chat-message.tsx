'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stripUiAction } from '@/lib/parse-action';
import type { KycMessage } from '@/types/kyc';
import { FileUploadAction, ConfirmDataAction, AdditionalDocsRequest } from './inline-actions';

interface ChatMessageProps {
  message: KycMessage;
  isStreaming?: boolean;
}

// Determine system message variant based on content
function getSystemMessageVariant(content: string): 'success' | 'error' | 'warning' {
  const lowerContent = content.toLowerCase();
  
  // Check for success indicators
  if (lowerContent.includes('successfully') || 
      lowerContent.includes('uploaded successfully') ||
      lowerContent.includes('completed successfully')) {
    return 'success';
  }
  
  // Check for error indicators
  if (lowerContent.includes('failed') || 
      lowerContent.includes('error') ||
      lowerContent.includes('could not')) {
    return 'error';
  }
  
  // Default to warning/info
  return 'warning';
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';
  
  // Determine system message styling variant
  const systemVariant = isSystem ? getSystemMessageVariant(message.content) : null;
  
  // Check if this message has an action component
  const hasAction = isAssistant && message.action;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser && 'bg-gradient-to-br from-blue-500 to-blue-600',
          !isUser && !isSystem && 'bg-gradient-to-br from-emerald-500 to-teal-600',
          isSystem && systemVariant === 'success' && 'bg-emerald-500/20',
          isSystem && systemVariant === 'error' && 'bg-red-500/20',
          isSystem && systemVariant === 'warning' && 'bg-amber-500/20'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isSystem ? (
          systemVariant === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : systemVariant === 'error' ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content Container */}
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', 'max-w-[80%]')}>
        {/* Message Bubble - now contains both text AND action component */}
        <div
          className={cn(
            'rounded-2xl overflow-hidden',
            isUser && 'bg-blue-600 text-white',
            !isUser && !isSystem && 'bg-card text-card-foreground border border-border',
            isSystem && systemVariant === 'success' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20',
            isSystem && systemVariant === 'error' && 'bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20',
            isSystem && systemVariant === 'warning' && 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
          )}
        >
          {/* Text Content */}
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </p>
            
            {/* Timestamp - only show if no action, otherwise show at bottom */}
            {!hasAction && (
              <p
                className={cn(
                  'text-[10px] mt-1 opacity-60',
                  isUser ? 'text-right' : 'text-left'
                )}
              >
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>

          {/* Inline Action Component - inside the message bubble */}
          {hasAction && message.action && (
            <div className="border-t border-border">
              {message.action.type === 'file_upload' && (
                <FileUploadAction action={message.action} embedded />
              )}
              {message.action.type === 'confirm_data' && (
                <ConfirmDataAction action={message.action} embedded />
              )}
              {message.action.type === 'additional_docs_request' && (
                <AdditionalDocsRequest action={message.action} embedded />
              )}
              
              {/* Timestamp at bottom of action */}
              <div className="px-4 pb-2">
                <p className="text-[10px] opacity-60 text-left">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface StreamingMessageProps {
  text: string;
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  // Filter out action markers and system context from streaming text
  const displayText = useMemo(() => stripUiAction(text), [text]);
  
  if (!displayText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* Message Bubble */}
      <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-card text-card-foreground border border-border">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {displayText}
          <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse rounded-sm" />
        </p>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 p-4"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="bg-card rounded-2xl px-4 py-3 border border-border">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

