import { create } from 'zustand';
import type { 
  KycMessage, 
  KycStage, 
  ToolApproval, 
  ExtractedData,
  KycProgress,
  UiAction
} from '@/types/kyc';
import { 
  getOrCreateSessionId,
  clearUserSession,
  startVerification, 
  sendChatMessage,
  subscribeToStatus,
  type ChatStreamCallbacks 
} from '@/api/kyc';
import { parseUiAction } from '@/lib/parse-action';

interface KycState {
  // Session
  sessionId: string | null;
  applicationId: string | null;
  userId: string | null;
  
  // Chat
  messages: KycMessage[];
  isStreaming: boolean;
  currentStreamingText: string;
  
  // Status
  stages: KycStage[];
  currentStage: string | null;
  overallStatus: string;
  
  // Human-in-the-loop
  pendingApproval: ToolApproval | null;
  extractedData: ExtractedData | null;
  
  // File upload
  pendingFiles: File[];
  uploadProgress: number;
  
  // Status subscription
  statusUnsubscribe: (() => void) | null;
  
  // Actions
  initSession: (userId: string) => void;
  startKycVerification: () => Promise<void>;
  sendMessage: (message: string, documents?: File[]) => Promise<void>;
  addMessage: (message: Omit<KycMessage, 'id' | 'timestamp'>) => void;
  updateStreamingText: (text: string) => void;
  finalizeStreamingMessage: () => void;
  setStages: (stages: KycStage[]) => void;
  updateStage: (stageName: string, status: KycStage['status']) => void;
  setPendingApproval: (approval: ToolApproval | null) => void;
  setExtractedData: (data: ExtractedData | null) => void;
  addPendingFile: (file: File) => void;
  removePendingFile: (fileName: string) => void;
  clearPendingFiles: () => void;
  approveAndUpload: () => Promise<void>;
  confirmData: () => Promise<void>;
  subscribeToStatusUpdates: (applicationId: string) => void;
  unsubscribeFromStatus: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  applicationId: null,
  userId: null,
  messages: [],
  isStreaming: false,
  currentStreamingText: '',
  stages: [],
  currentStage: null,
  overallStatus: 'idle',
  pendingApproval: null,
  extractedData: null,
  pendingFiles: [],
  uploadProgress: 0,
  statusUnsubscribe: null,
};

export const useKycStore = create<KycState>((set, get) => {
  const createCallbacks = (): ChatStreamCallbacks => ({
    onSessionStart: (sessionId) => {
      set({ sessionId });
    },
    onText: (text) => {
      set((state) => ({
        currentStreamingText: state.currentStreamingText + text,
      }));
    },
    onToolCall: (toolName, toolId) => {
      console.log(`Tool called: ${toolName} (${toolId})`);
      // Note: pendingApproval is now set based on parsed UI_ACTION markers
      // from agent messages, not from tool calls
    },
    onToolResult: (toolId, success) => {
      console.log(`Tool result: ${toolId} - ${success ? 'success' : 'failed'}`);
      
      // Clear pending approval if tool completed
      const { pendingApproval } = get();
      if (pendingApproval?.id === toolId) {
        set({ pendingApproval: null });
      }
    },
    onDocumentUploaded: (filename, success, error) => {
      // Success message removed - the upload component already shows "Documents Uploaded"
      // Only show error messages if upload fails
      if (!success) {
        get().addMessage({
          role: 'system',
          content: `Failed to upload "${filename}": ${error || 'Unknown error'}`,
        });
      }
    },
    onKycProgress: (progress) => {
      set({
        applicationId: progress.application_id,
        overallStatus: progress.status,
        currentStage: progress.current_stage,
        stages: progress.stages,
      });
      
      // Subscribe to status updates if we have an application ID
      if (progress.application_id && !get().statusUnsubscribe) {
        get().subscribeToStatusUpdates(progress.application_id);
      }
      
      // Update auth store when KYC status changes (approved/rejected)
      if (['approved', 'completed'].includes(progress.status)) {
        // Import dynamically to avoid circular dependency
        import('@/store/auth-store').then(({ useAuthStore }) => {
          useAuthStore.getState().updateKycStatus('approved');
        });
      } else if (['rejected', 'failed'].includes(progress.status)) {
        import('@/store/auth-store').then(({ useAuthStore }) => {
          useAuthStore.getState().updateKycStatus('rejected');
        });
      }
      // Note: pendingApproval for data confirmation is now set based on
      // parsed UI_ACTION markers from agent messages
    },
    onStop: (reason) => {
      get().finalizeStreamingMessage();
      set({ isStreaming: false });
    },
    onWarning: (message) => {
      console.warn(`KYC Warning: ${message}`);
    },
    onError: (error) => {
      console.error(`KYC Error: ${error}`);
      // Don't show network errors that happen at stream end
      if (!error.toLowerCase().includes('network') && 
          !error.toLowerCase().includes('aborted') &&
          !error.toLowerCase().includes('incomplete')) {
        get().addMessage({
          role: 'system',
          content: `Error: ${error}`,
        });
      }
      // Still finalize any streaming message
      get().finalizeStreamingMessage();
      set({ isStreaming: false });
    },
    onComplete: () => {
      get().finalizeStreamingMessage();
      set({ isStreaming: false });
    },
  });

  return {
    ...initialState,

    initSession: (userId) => {
      // TODO: When CLEAR_SESSION_ON_REFRESH is set to false in api/kyc.ts,
      // this will reuse existing session. You may also want to:
      // 1. Load existing messages from backend/localStorage
      // 2. Fetch current KYC status to restore stages
      // 3. Skip calling startKycVerification if session already exists
      const sessionId = getOrCreateSessionId(userId);
      
      set({
        sessionId,
        userId,
        messages: [],
        stages: [],
        overallStatus: 'idle',
        pendingApproval: null,
        extractedData: null,
      });
    },

    startKycVerification: async () => {
      const { sessionId, userId } = get();
      if (!sessionId || !userId) {
        console.error('Session not initialized');
        return;
      }

      set({ isStreaming: true, currentStreamingText: '' });
      
      // Add user message
      get().addMessage({
        role: 'user',
        content: 'Start my KYC verification',
      });

      await startVerification(userId, sessionId, createCallbacks());
    },

    sendMessage: async (message, documents) => {
      const { sessionId, userId } = get();
      if (!sessionId) {
        console.error('Session not initialized');
        return;
      }

      set({ isStreaming: true, currentStreamingText: '' });
      
      // Add user message
      get().addMessage({
        role: 'user',
        content: message,
      });

      await sendChatMessage({
        message,
        sessionId,
        userId: userId || undefined,
        documents,
        callbacks: createCallbacks(),
      });
    },

    addMessage: (message) => {
      const newMessage: KycMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    },

    updateStreamingText: (text) => {
      set((state) => ({
        currentStreamingText: state.currentStreamingText + text,
      }));
    },

    finalizeStreamingMessage: () => {
      const { currentStreamingText } = get();
      if (currentStreamingText.trim()) {
        // Parse UI action markers from the message
        const { text, action } = parseUiAction(currentStreamingText);
        
        get().addMessage({
          role: 'assistant',
          content: text,
          action: action || undefined,
        });
        
        // Set pending approval based on parsed action
        if (action) {
          if (action.type === 'file_upload') {
            set({
              pendingApproval: {
                id: `action-${Date.now()}`,
                type: 'file_upload',
                title: action.title,
                description: action.description || 'Please upload your document',
                pending: true,
              },
            });
          } else if (action.type === 'confirm_data') {
            set({
              pendingApproval: {
                id: `action-${Date.now()}`,
                type: 'confirm_data',
                title: action.title,
                description: action.description || 'Please confirm the extracted data',
                data: action.data,
                pending: true,
              },
              extractedData: action.data as ExtractedData,
            });
          }
        }
      }
      set({ currentStreamingText: '' });
    },

    setStages: (stages) => {
      set({ stages });
    },

    updateStage: (stageName, status) => {
      set((state) => ({
        stages: state.stages.map((stage) =>
          stage.stage_name === stageName ? { ...stage, status } : stage
        ),
      }));
    },

    setPendingApproval: (approval) => {
      set({ pendingApproval: approval });
    },

    setExtractedData: (data) => {
      set({ extractedData: data });
    },

    addPendingFile: (file) => {
      set((state) => ({
        pendingFiles: [...state.pendingFiles, file],
      }));
    },

    removePendingFile: (fileName) => {
      set((state) => ({
        pendingFiles: state.pendingFiles.filter((f) => f.name !== fileName),
      }));
    },

    clearPendingFiles: () => {
      set({ pendingFiles: [] });
    },

    approveAndUpload: async () => {
      const { pendingFiles, sendMessage } = get();
      if (pendingFiles.length === 0) return;

      set({ pendingApproval: null });
      
      await sendMessage('Here is my documents', pendingFiles);
      
      set({ pendingFiles: [] });
    },

    confirmData: async () => {
      const { sendMessage } = get();
      
      set({ pendingApproval: null });
      
      await sendMessage('Yes the data is correct. Please verify and complete my KYC.');
    },

    subscribeToStatusUpdates: (applicationId) => {
      // Clean up existing subscription
      get().unsubscribeFromStatus();

      const unsubscribe = subscribeToStatus(applicationId, {
        onStatus: (progress) => {
          set({
            overallStatus: progress.status,
            currentStage: progress.current_stage,
            stages: progress.stages,
          });
        },
        onError: (error) => {
          console.error(`Status subscription error: ${error}`);
        },
      });

      set({ statusUnsubscribe: unsubscribe });
    },

    unsubscribeFromStatus: () => {
      const { statusUnsubscribe } = get();
      if (statusUnsubscribe) {
        statusUnsubscribe();
        set({ statusUnsubscribe: null });
      }
    },

    reset: () => {
      // Clear localStorage session when resetting
      // TODO: When persisting sessions, you may want to keep the session
      // and only clear on explicit user action (e.g., "Start New Verification")
      const { userId } = get();
      if (userId) {
        clearUserSession(userId);
      }
      get().unsubscribeFromStatus();
      set(initialState);
    },
  };
});

