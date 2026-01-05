export type KycStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface KycStage {
  stage_name: string;
  status: KycStageStatus;
  message?: string;
  result?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
}

export interface KycProgress {
  application_id: string;
  status: string;
  current_stage: string | null;
  stages: KycStage[];
  documents_uploaded?: number;
}

// UI Action Types - for interactive components in chat
export type UiActionType = 
  | 'file_upload' 
  | 'confirm_data' 
  | 'info' 
  | 'additional_docs_request'  // For non-resident users needing extra documents
  | 'live_photo'               // For liveness verification selfie capture
  | 'verification_progress';   // For showing animated verification checks

// Per-document extracted data for display
export interface DocumentExtractedData {
  filename: string;
  document_type?: string;
  data: Record<string, unknown>;
}

// Required document types for additional verification
export type AdditionalDocType = 'passport' | 'visa' | 'live_photo' | 'work_permit' | 'proof_of_address';

export interface UiAction {
  type: UiActionType;
  title: string;
  description?: string;
  data?: Record<string, unknown>;  // Merged data for confirmation
  documents?: DocumentExtractedData[];  // Per-document data for display
  accept?: string[];
  maxFiles?: number;
  variant?: 'info' | 'warning' | 'success';
  // For additional_docs_request
  nationality?: string;  // User's detected nationality
  required_docs?: AdditionalDocType[];  // List of required document types
}

export interface KycMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  action?: UiAction; // Parsed action from message for rendering interactive components
}

export type ToolApprovalType = 'file_upload' | 'confirm_data' | 'verification_confirm';

export interface ToolApproval {
  id: string;
  type: ToolApprovalType;
  title: string;
  description: string;
  data?: Record<string, unknown>;
  pending: boolean;
}

export interface ExtractedData {
  document_type: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  document_number?: string;
  expiry_date?: string;
  address?: string;
  [key: string]: unknown;
}

export interface KycChatSession {
  sessionId: string;
  applicationId: string | null;
  userId: string;
  status: 'idle' | 'active' | 'completed' | 'failed';
}

// SSE Event Types
export interface SseSessionEvent {
  session_id: string;
}

export interface SseTextEvent {
  text: string;
}

export interface SseToolCallEvent {
  tool_name: string;
  tool_id: string;
}

export interface SseToolResultEvent {
  tool_id: string;
  success: boolean;
}

export interface SseDocumentUploadedEvent {
  filename: string;
  document_type?: string;
  success: boolean;
  error?: string;
}

export interface SseKycProgressEvent extends KycProgress {}

export interface SseStopEvent {
  reason: string;
}

export interface SseWarningEvent {
  message: string;
}

