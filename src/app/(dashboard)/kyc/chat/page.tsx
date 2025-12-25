'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Paperclip, Sparkles, X, FileImage } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChatMessage, 
  StreamingMessage, 
  TypingIndicator,
  StatusPanel,
  ToolApprovalCard 
} from '@/components/kyc';
import { useKycStore } from '@/store/kyc-store';
import { useAuthStore } from '@/store/auth-store';

export default function KycChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const { user } = useAuthStore();
  
  // Use selectors for state values (will trigger re-render when these change)
  const messages = useKycStore((state) => state.messages);
  const isStreaming = useKycStore((state) => state.isStreaming);
  const currentStreamingText = useKycStore((state) => state.currentStreamingText);
  const stages = useKycStore((state) => state.stages);
  const currentStage = useKycStore((state) => state.currentStage);
  const overallStatus = useKycStore((state) => state.overallStatus);
  const pendingApproval = useKycStore((state) => state.pendingApproval);
  const extractedData = useKycStore((state) => state.extractedData);
  const pendingFiles = useKycStore((state) => state.pendingFiles);
  

  // Initialize session and auto-start verification
  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    console.log('[Chat Page] Initializing session for user:', user.id);
    
    // Get store actions (stable reference)
    const { initSession, startKycVerification, reset } = useKycStore.getState();
    
    // Initialize session with user ID
    initSession(user.id);
    
    // Auto-start verification after a brief delay
    const timer = setTimeout(() => {
      console.log('[Chat Page] Starting KYC verification...');
      startKycVerification();
    }, 500);

    return () => {
      clearTimeout(timer);
      reset();
    };
  }, [user?.id, router]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingText]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files].slice(0, 3)); // Max 3 files
    e.target.value = ''; // Reset input
  }, []);

  // Remove selected file
  const removeFile = useCallback((fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  }, []);

  // Handle manual message send
  const handleSendMessage = useCallback(async () => {
    const input = inputRef.current;
    const message = input?.value.trim() || '';
    
    // Must have either a message or files
    if ((!message && selectedFiles.length === 0) || isStreaming) return;

    if (input) input.value = '';
    
    // Send with files if any
    const filesToSend = selectedFiles.length > 0 ? selectedFiles : undefined;
    setSelectedFiles([]);
    
    const messageText = message || 'Here is my ID document';
    await useKycStore.getState().sendMessage(messageText, filesToSend);
  }, [isStreaming, selectedFiles]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle file change in approval card
  const handleFilesChange = useCallback((files: File[]) => {
    const { removePendingFile, addPendingFile } = useKycStore.getState();
    // Clear existing and add new files
    pendingFiles.forEach(f => removePendingFile(f.name));
    files.forEach(f => addPendingFile(f));
  }, [pendingFiles]);

  return (
    <div className="fixed inset-0 top-16 flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-10">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-100">KYC Verification</h1>
              <p className="text-xs text-slate-400">AI-powered identity verification</p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          {/* Welcome message */}
          {messages.length === 0 && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Starting Verification...
              </h2>
              <p className="text-slate-400 max-w-md">
                Our AI assistant will guide you through the KYC verification process.
                Please have your ID document ready.
              </p>
              <div className="mt-6">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Streaming Message */}
          {currentStreamingText && (
            <StreamingMessage text={currentStreamingText} />
          )}

          {/* Typing Indicator when streaming but no text yet */}
          {isStreaming && !currentStreamingText && messages.length > 0 && (
            <TypingIndicator />
          )}

          {/* Human-in-the-Loop Approval Card */}
          {pendingApproval && (
            <ToolApprovalCard
              approval={pendingApproval}
              extractedData={extractedData}
              pendingFiles={pendingFiles}
              onFilesChange={handleFilesChange}
              onApprove={
                pendingApproval.type === 'file_upload' 
                  ? () => useKycStore.getState().approveAndUpload() 
                  : () => useKycStore.getState().confirmData()
              }
              disabled={isStreaming}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 max-w-4xl mx-auto">
              {selectedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700"
                >
                  <FileImage className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300 max-w-[150px] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 max-w-4xl mx-auto">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={
                  selectedFiles.length > 0
                    ? "Add a message or click send to upload..."
                    : pendingApproval 
                      ? "Complete the action above to continue..." 
                      : "Type a message..."
                }
                className="pr-10 bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
                onKeyDown={handleKeyDown}
                disabled={isStreaming || !!pendingApproval}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 disabled:opacity-50 transition-colors"
                disabled={isStreaming || !!pendingApproval}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isStreaming || !!pendingApproval}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Sidebar */}
      <div className="w-72 hidden lg:block">
        <StatusPanel
          stages={stages}
          currentStage={currentStage}
          overallStatus={overallStatus}
        />
      </div>
    </div>
  );
}

