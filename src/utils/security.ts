import DOMPurify from 'dompurify';

/**
 * Security & Sanitization Utilities for Celebrio AI
 * Adheres to OWASP ASVS and LLM Security Prompt Injection Guidelines
 */

// Max allowed character count for user prompts to prevent ReDoS & Token Exhaustion DoS
export const MAX_PROMPT_LENGTH = 1500;
export const MAX_ITEM_NAME_LENGTH = 120;
export const MAX_NOTES_LENGTH = 2000;

/**
 * Sanitize rich text / HTML to prevent Stored & Reflected XSS
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'span', 'br', 'code'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  });
}

/**
 * Strip plain text of any unexpected HTML or script tags
 */
export function sanitizePlainText(input: string, maxLength: number = MAX_ITEM_NAME_LENGTH): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, maxLength);
  // Remove dangerous HTML tags & scripts
  const stripped = trimmed.replace(/<[^>]*>?/gm, '');
  return stripped;
}

/**
 * Known prompt injection patterns and delimiters to disarm
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+DAN\s+mode/i,
  /reveal\s+your\s+hidden\s+rules/i,
  /disregard\s+the\s+above/i,
  /jailbreak/i,
  /as\s+an\s+unfiltered\s+ai/i,
];

export interface PromptSanitizationResult {
  sanitizedPrompt: string;
  isFlagged: boolean;
  flagReason?: string;
}

/**
 * Prompt Injection Defense & Token Safety Fencing
 */
export function sanitizePromptForAI(rawPrompt: string): PromptSanitizationResult {
  if (!rawPrompt) {
    return { sanitizedPrompt: '', isFlagged: false };
  }

  const trimmed = rawPrompt.trim();

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      sanitizedPrompt: trimmed.slice(0, MAX_PROMPT_LENGTH),
      isFlagged: true,
      flagReason: `Prompt exceeds maximum character limit (${MAX_PROMPT_LENGTH} characters). Truncated for token safety.`,
    };
  }

  // Check for common prompt injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      // Neutralize without crashing: wrap and neutralize malicious directive
      const neutralized = trimmed.replace(pattern, '[Content Flagged by Prompt Guard]');
      return {
        sanitizedPrompt: neutralized,
        isFlagged: true,
        flagReason: 'Detected potential prompt override pattern. Input sanitized for assistant safety.',
      };
    }
  }

  // Escape XML/Markdown delimiter attacks (e.g. attempting to close <system_context> tags)
  const escaped = trimmed
    .replace(/<\/system>/gi, '&lt;/system&gt;')
    .replace(/<system>/gi, '&lt;system&gt;')
    .replace(/<\/event_data>/gi, '&lt;/event_data&gt;')
    .replace(/<event_data>/gi, '&lt;event_data&gt;');

  return {
    sanitizedPrompt: escaped,
    isFlagged: false,
  };
}

/**
 * Mask API Key for safe UI display (displays e.g. AIzaSy...9dE3)
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '********';
  return `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
}

/**
 * Basic validation for currency values
 */
export function sanitizeCurrencyAmount(amount: unknown): number {
  if (typeof amount === 'number') {
    if (isNaN(amount) || !isFinite(amount)) return 0;
    return Math.max(0, Math.round(amount * 100) / 100);
  }
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    if (isNaN(parsed) || !isFinite(parsed)) return 0;
    return Math.max(0, Math.round(parsed * 100) / 100);
  }
  return 0;
}

/**
 * In-memory client rate limiter to protect against request flooding & rapid automated clicks
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function resetRateLimit(key?: string): void {
  if (key) {
    rateLimitMap.delete(key);
  } else {
    rateLimitMap.clear();
  }
}

/**
 * Strict schema validation for AI Action Proposals before execution
 * Prevents unauthorized or malformed state mutation
 */
export function validateActionProposal(proposal: unknown): { valid: boolean; reason?: string } {
  if (!proposal || typeof proposal !== 'object') {
    return { valid: false, reason: 'Proposal must be an object' };
  }

  const p = proposal as Record<string, any>;
  const allowedTypes = ['add_budget_item', 'add_milestone', 'add_vendor', 'update_budget', 'apply_theme'];

  if (!allowedTypes.includes(p.actionType)) {
    return { valid: false, reason: `Unknown or disallowed actionType: ${p.actionType}` };
  }

  if (!p.payload || typeof p.payload !== 'object') {
    return { valid: false, reason: 'Proposal payload is missing or invalid' };
  }

  if (p.actionType === 'add_budget_item') {
    if (!p.payload.name || typeof p.payload.name !== 'string') {
      return { valid: false, reason: 'Budget item must have a valid string name' };
    }
  }

  if (p.actionType === 'add_milestone') {
    if (!p.payload.title || typeof p.payload.title !== 'string') {
      return { valid: false, reason: 'Milestone must have a valid title' };
    }
  }

  if (p.actionType === 'add_vendor') {
    if (!p.payload.name || typeof p.payload.name !== 'string') {
      return { valid: false, reason: 'Vendor must have a valid name' };
    }
  }

  if (p.actionType === 'apply_theme') {
    if (!p.payload.title || typeof p.payload.title !== 'string') {
      return { valid: false, reason: 'Theme proposal must have a valid title' };
    }
  }

  return { valid: true };
}

