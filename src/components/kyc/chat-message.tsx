'use client';

import { motion } from 'framer-motion';
import { Bot, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KycMessage } from '@/types/kyc';

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
  
  // Determine system message styling variant
  const systemVariant = isSystem ? getSystemMessageVariant(message.content) : null;

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

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3',
          isUser && 'bg-blue-600 text-white',
          !isUser && !isSystem && 'bg-slate-800/80 text-slate-100 border border-slate-700/50',
          isSystem && systemVariant === 'success' && 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20',
          isSystem && systemVariant === 'error' && 'bg-red-500/10 text-red-200 border border-red-500/20',
          isSystem && systemVariant === 'warning' && 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
          )}
        </p>
        
        {/* Timestamp */}
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
      </div>
    </motion.div>
  );
}

interface StreamingMessageProps {
  text: string;
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  if (!text) return null;

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
      <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-slate-800/80 text-slate-100 border border-slate-700/50">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
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
      
      <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50">
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

