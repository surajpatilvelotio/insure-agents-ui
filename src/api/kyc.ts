import { API_BASE_URL } from './client';
import type { KycProgress } from '@/types/kyc';

// Session ID management
// TODO: To persist sessions across page refreshes, change CLEAR_SESSION_ON_REFRESH to false
const CLEAR_SESSION_ON_REFRESH = true; // Set to false to persist session across refreshes

// NOTE: Even with CLEAR_SESSION_ON_REFRESH = true, the backend may reuse existing
// applications for the same user. To fully reset for testing:
// 1. Delete the backend's sessions/ folder
// 2. Or complete/reject the existing KYC application in the database

// Get or create session ID for a user
export function getOrCreateSessionId(userId: string): string {
  const storageKey = `kyc-session-${userId}`;
  
  // Check if we should use existing session
  if (!CLEAR_SESSION_ON_REFRESH) {
    const existingSession = localStorage.getItem(storageKey);
    if (existingSession) {
      return existingSession;
    }
  }
  
  // Generate new session ID
  const newSessionId = `kyc-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Store in localStorage (will be available if CLEAR_SESSION_ON_REFRESH is set to false later)
  localStorage.setItem(storageKey, newSessionId);
  
  return newSessionId;
}

// Clear session for a user (call this on logout or when user wants to start fresh)
export function clearUserSession(userId: string): void {
  const storageKey = `kyc-session-${userId}`;
  localStorage.removeItem(storageKey);
}

// Legacy function - kept for backwards compatibility
export function generateSessionId(): string {
  return `kyc-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// SSE parser state
interface SseParserState {
  eventType: string;
  data: string;
}

// Parse SSE stream line by line
function createSseParser(onEvent: (event: string, data: unknown) => void) {
  let state: SseParserState = { eventType: '', data: '' };
  let buffer = '';

  return {
    push(chunk: string) {
      buffer += chunk;
      // Normalize line endings
      buffer = buffer.replace(/\r\n/g, '\n');
      
      const lines = buffer.split('\n');
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          state.eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          state.data = line.slice(5).trim();
        } else if (line === '' && state.eventType && state.data) {
          // Empty line means end of event
          try {
            const parsedData = JSON.parse(state.data);
            onEvent(state.eventType, parsedData);
          } catch {
            onEvent(state.eventType, state.data);
          }
          // Reset state
          state = { eventType: '', data: '' };
        }
      }
    },
    flush() {
      // Process any remaining data
      if (state.eventType && state.data) {
        try {
          const parsedData = JSON.parse(state.data);
          onEvent(state.eventType, parsedData);
        } catch {
          onEvent(state.eventType, state.data);
        }
      }
    }
  };
}

export interface ChatStreamCallbacks {
  onSessionStart?: (sessionId: string) => void;
  onText?: (text: string) => void;
  onToolCall?: (toolName: string, toolId: string) => void;
  onToolResult?: (toolId: string, success: boolean) => void;
  onDocumentUploaded?: (filename: string, success: boolean, error?: string) => void;
  onKycProgress?: (progress: KycProgress) => void;
  onStop?: (reason: string) => void;
  onWarning?: (message: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

// Start KYC verification - sends first message
export async function startVerification(
  userId: string,
  sessionId: string,
  callbacks: ChatStreamCallbacks
): Promise<void> {
  return sendChatMessage({
    message: 'Start identity verification',
    sessionId,
    userId,
    callbacks,
  });
}

// Send chat message with optional file attachments
export async function sendChatMessage(options: {
  message: string;
  sessionId: string;
  userId?: string;
  documents?: File[];
  documentTypes?: string[];  // Optional array of document types matching documents order
  callbacks: ChatStreamCallbacks;
}): Promise<void> {
  const { message, sessionId, userId, documents, documentTypes, callbacks } = options;

  const formData = new FormData();
  formData.append('message', message);
  formData.append('session_id', sessionId);

  if (userId) {
    formData.append('user_id', userId);
  }

  if (documents && documents.length > 0) {
    for (const doc of documents) {
      formData.append('documents', doc);
    }
    
    // Pass document types as JSON array if provided
    if (documentTypes && documentTypes.length > 0) {
      formData.append('document_types', JSON.stringify(documentTypes));
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/kyc/chat/stream/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      callbacks.onError?.(errorText || `HTTP ${response.status}`);
      return;
    }

    if (!response.body) {
      callbacks.onError?.('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Create event handler
    const handleEvent = (event: string, data: unknown) => {
      
      switch (event) {
        case 'session':
          callbacks.onSessionStart?.((data as { session_id: string }).session_id);
          break;
        case 'text':
          callbacks.onText?.((data as { text: string }).text);
          break;
        case 'tool_call':
          const toolCall = data as { tool_name: string; tool_id: string };
          callbacks.onToolCall?.(toolCall.tool_name, toolCall.tool_id);
          break;
        case 'tool_result':
          const toolResult = data as { tool_id: string; success: boolean };
          callbacks.onToolResult?.(toolResult.tool_id, toolResult.success);
          break;
        case 'document_uploaded':
          const docEvent = data as { filename: string; success: boolean; error?: string };
          callbacks.onDocumentUploaded?.(docEvent.filename, docEvent.success, docEvent.error);
          break;
        case 'kyc_progress':
          callbacks.onKycProgress?.(data as KycProgress);
          break;
        case 'stop':
          callbacks.onStop?.((data as { reason: string }).reason);
          break;
        case 'warning':
          callbacks.onWarning?.((data as { message: string }).message);
          break;
        case 'error':
          callbacks.onError?.(String(data));
          break;
      }
    };

    const parser = createSseParser(handleEvent);

    while (true) {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          parser.flush();
          callbacks.onComplete?.();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        parser.push(chunk);
      } catch (readError) {
        // ERR_INCOMPLETE_CHUNKED_ENCODING is common when SSE stream ends
        // Treat it as a normal completion
        // Stream read ended (expected at end of SSE)
        parser.flush();
        callbacks.onComplete?.();
        break;
      }
    }
  } catch (error) {
    // Only report actual errors, not stream end errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (!errorMessage.includes('network') && !errorMessage.includes('aborted')) {
      callbacks.onError?.(errorMessage);
    } else {
      // Network errors at stream end are expected
      // Stream ended (expected behavior)
      callbacks.onComplete?.();
    }
  }
}

export interface StatusStreamCallbacks {
  onStatus?: (progress: KycProgress) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

// Subscribe to KYC status updates
export function subscribeToStatus(
  applicationId: string,
  callbacks: StatusStreamCallbacks
): () => void {
  let aborted = false;
  
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/kyc/status/${applicationId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        callbacks.onError?.(errorText || `HTTP ${response.status}`);
        return;
      }

      if (!response.body) {
        callbacks.onError?.('No response body');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const parser = createSseParser((event, data) => {
        // Handle different event types from the status endpoint
        if (event === 'kyc_progress') {
          callbacks.onStatus?.(data as KycProgress);
        } else if (event === 'init') {
          // Initial status - same format as kyc_progress
          callbacks.onStatus?.(data as KycProgress);
        } else if (event === 'stage_update') {
          // Individual stage update - need to request full status
          // For now, just trigger a refresh with partial data
          const stageData = data as { stage: string; status: string; current_stage?: string };
          if (stageData.current_stage) {
            callbacks.onStatus?.({
              application_id: '',
              status: '',
              current_stage: stageData.current_stage,
              stages: [],
            } as KycProgress);
          }
        } else if (event === 'complete') {
          callbacks.onComplete?.();
        }
      });

      while (!aborted) {
        const { done, value } = await reader.read();
        
        if (done) {
          parser.flush();
          callbacks.onComplete?.();
          break;
        }

        parser.push(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      if (!aborted) {
        callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  fetchStatus();

  // Return cleanup function
  return () => {
    aborted = true;
  };
}

// Fetch current KYC status (non-streaming)
export async function getKycStatus(applicationId: string): Promise<KycProgress | null> {
  try {
    // Use a simple GET that might return initial status
    // The backend might need adjustment for non-streaming status
    const response = await fetch(`${API_BASE_URL}/kyc/applications/${applicationId}/status`);
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

