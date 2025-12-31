import type { UiAction } from '@/types/kyc';

const SYSTEM_CONTEXT_REGEX = /\[SYSTEM CONTEXT:[\s\S]*?\]\s*/gi;
const SYSTEM_MESSAGE_REGEX = /\[SYSTEM:[\s\S]*?\]\s*/gi;

function extractUiActionJson(content: string): { json: string; startIndex: number; endIndex: number } | null {
  const startMatch = content.match(/[<\[]UI_ACTION:/i);
  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const jsonStartIndex = startMatch.index + startMatch[0].length;
  let braceDepth = 0;
  let jsonEndIndex = -1;
  let inString = false;
  let escapeNext = false;

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

  if (jsonEndIndex === -1) return null;

  const json = content.slice(jsonStartIndex, jsonEndIndex).trim();
  
  let markerEndIndex = jsonEndIndex;
  while (markerEndIndex < content.length) {
    const char = content[markerEndIndex];
    if (char === ']' || char === '>') { markerEndIndex++; break; }
    if (char !== ' ' && char !== '\n' && char !== '\r') break;
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

function stripSystemContext(content: string): string {
  return content
    .replace(SYSTEM_CONTEXT_REGEX, '')
    .replace(SYSTEM_MESSAGE_REGEX, '')
    .trim();
}

export function parseUiAction(content: string): ParsedMessage {
  if (!content) return { text: '', action: null };

  const cleanedContent = stripSystemContext(content);
  const extracted = extractUiActionJson(cleanedContent);
  
  if (!extracted) {
    return { text: cleanedContent, action: null };
  }

  try {
    const action = JSON.parse(extracted.json) as UiAction;
    
    if (!action.type || !action.title) {
      console.warn('Invalid UI action: missing required fields', action);
      return { text: cleanedContent, action: null };
    }
    
    const beforeAction = cleanedContent.slice(0, extracted.startIndex).trim();
    const afterAction = cleanedContent.slice(extracted.endIndex).trim();
    const text = afterAction ? `${beforeAction}\n\n${afterAction}` : beforeAction;
    
    return { text: text.trim(), action };
  } catch (error) {
    console.warn('Failed to parse UI action:', error, 'JSON:', extracted.json);
    return { text: cleanedContent, action: null };
  }
}

export function hasUiAction(content: string): boolean {
  return /[<\[]UI_ACTION:/i.test(content);
}

export function stripUiAction(content: string): string {
  let cleaned = content
    .replace(SYSTEM_CONTEXT_REGEX, '')
    .replace(SYSTEM_MESSAGE_REGEX, '');
  
  let extracted = extractUiActionJson(cleaned);
  while (extracted) {
    cleaned = cleaned.slice(0, extracted.startIndex) + cleaned.slice(extracted.endIndex);
    extracted = extractUiActionJson(cleaned);
  }
  
  const partialMatch = cleaned.match(/[<\[]UI_ACTION:/i);
  if (partialMatch && partialMatch.index !== undefined) {
    cleaned = cleaned.slice(0, partialMatch.index);
  }
  
  return cleaned.trim();
}

