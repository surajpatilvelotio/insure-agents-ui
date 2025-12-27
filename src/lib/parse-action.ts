/**
 * Parse UI action markers from agent messages.
 * 
 * The agent can embed action markers at the end of messages to trigger
 * interactive UI components (file upload, data confirmation, etc.)
 * 
 * Format: [UI_ACTION:{"type":"file_upload","title":"...","description":"..."}]
 */

import type { UiAction } from '@/types/kyc';

// Regex to match and remove internal system context that shouldn't be shown to users
const SYSTEM_CONTEXT_REGEX = /\[SYSTEM CONTEXT:[\s\S]*?\]\s*/gi;
const SYSTEM_MESSAGE_REGEX = /\[SYSTEM:[\s\S]*?\]\s*/gi;

/**
 * Extract UI_ACTION JSON from content by finding balanced braces.
 * This handles nested objects and arrays in the JSON properly.
 */
function extractUiActionJson(content: string): { json: string; startIndex: number; endIndex: number } | null {
  // Find the start of UI_ACTION marker (either [UI_ACTION: or <UI_ACTION:)
  const startMatch = content.match(/[<\[]UI_ACTION:/i);
  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const jsonStartIndex = startMatch.index + startMatch[0].length;
  let braceDepth = 0;
  let jsonEndIndex = -1;
  let inString = false;
  let escapeNext = false;

  // Parse character by character to find balanced braces
  for (let i = jsonStartIndex; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      braceDepth++;
    } else if (char === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        jsonEndIndex = i + 1;
        break;
      }
    }
  }

  if (jsonEndIndex === -1) {
    return null; // Unbalanced braces - incomplete JSON
  }

  const json = content.slice(jsonStartIndex, jsonEndIndex).trim();
  
  // Find the closing bracket/angle after the JSON
  let markerEndIndex = jsonEndIndex;
  while (markerEndIndex < content.length) {
    const char = content[markerEndIndex];
    if (char === ']' || char === '>') {
      markerEndIndex++;
      break;
    } else if (char !== ' ' && char !== '\n' && char !== '\r') {
      break; // Unexpected character
    }
    markerEndIndex++;
  }

  return {
    json,
    startIndex: startMatch.index,
    endIndex: markerEndIndex,
  };
}

export interface ParsedMessage {
  text: string;
  action: UiAction | null;
}

/**
 * Parse a message content string to extract any UI action marker.
 * 
 * @param content - The raw message content from the agent
 * @returns Object with cleaned text and parsed action (or null if no action)
 * 
 * @example
 * const result = parseUiAction("Please upload your ID.\n[UI_ACTION:{\"type\":\"file_upload\",\"title\":\"Upload\"}]");
 * // result.text = "Please upload your ID."
 * // result.action = { type: "file_upload", title: "Upload" }
 */
/**
 * Strip internal system context markers from message content.
 * These should never be shown to users.
 */
function stripSystemContext(content: string): string {
  return content
    .replace(SYSTEM_CONTEXT_REGEX, '')
    .replace(SYSTEM_MESSAGE_REGEX, '')
    .trim();
}

export function parseUiAction(content: string): ParsedMessage {
  if (!content) {
    return { text: '', action: null };
  }

  // First, strip any internal system context
  const cleanedContent = stripSystemContext(content);

  // Use balanced brace extraction for complex JSON
  const extracted = extractUiActionJson(cleanedContent);
  
  if (!extracted) {
    return { text: cleanedContent, action: null };
  }

  try {
    // Parse the JSON from the action marker
    const action = JSON.parse(extracted.json) as UiAction;
    
    // Validate required fields
    if (!action.type || !action.title) {
      console.warn('Invalid UI action: missing required fields', action);
      return { text: cleanedContent, action: null };
    }
    
    // Remove the action marker from the text
    const beforeAction = cleanedContent.slice(0, extracted.startIndex).trim();
    const afterAction = cleanedContent.slice(extracted.endIndex).trim();
    const text = afterAction ? `${beforeAction}\n\n${afterAction}` : beforeAction;
    
    return { text: text.trim(), action };
  } catch (error) {
    console.warn('Failed to parse UI action:', error, 'JSON:', extracted.json);
    return { text: cleanedContent, action: null };
  }
}

/**
 * Check if a message contains a UI action marker.
 */
export function hasUiAction(content: string): boolean {
  return /[<\[]UI_ACTION:/i.test(content);
}

/**
 * Strip UI action markers and system context from a message (for display purposes).
 * Also strips partial/incomplete action markers during streaming.
 */
export function stripUiAction(content: string): string {
  // First strip system context
  let cleaned = content
    .replace(SYSTEM_CONTEXT_REGEX, '')
    .replace(SYSTEM_MESSAGE_REGEX, '');
  
  // Use balanced brace extraction to find and remove complete UI_ACTION markers
  let extracted = extractUiActionJson(cleaned);
  while (extracted) {
    cleaned = cleaned.slice(0, extracted.startIndex) + cleaned.slice(extracted.endIndex);
    extracted = extractUiActionJson(cleaned);
  }
  
  // Strip partial/incomplete action markers during streaming
  // This catches everything from [UI_ACTION: or <UI_ACTION: to the end of the string
  // when the JSON is still being streamed (braces not balanced)
  const partialMatch = cleaned.match(/[<\[]UI_ACTION:/i);
  if (partialMatch && partialMatch.index !== undefined) {
    // Check if there's a complete action marker (would have been extracted above)
    // If we're here, the action is incomplete - strip everything from the marker to end
    cleaned = cleaned.slice(0, partialMatch.index);
  }
  
  return cleaned.trim();
}

