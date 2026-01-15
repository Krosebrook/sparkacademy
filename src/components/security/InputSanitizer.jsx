/**
 * Input Sanitization Utilities
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses DOMPurify-like approach
 */
export function sanitizeHTML(dirty) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return dirty.replace(reg, (match) => map[match]);
}

/**
 * Sanitize for SQL-like queries (prevent injection)
 */
export function sanitizeQuery(input) {
  if (typeof input !== 'string') return input;
  
  // Remove SQL keywords and special characters
  const dangerous = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)|[;'"\\]/gi;
  return input.replace(dangerous, '');
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return '';
  
  const cleaned = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript):/i;
  if (dangerousProtocols.test(cleaned)) {
    return '';
  }
  
  // Ensure http or https
  if (!/^https?:\/\//i.test(cleaned)) {
    return `https://${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Sanitize filename for file uploads
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'unnamed';
  
  // Remove path traversal attempts
  let clean = filename.replace(/\.\./g, '');
  
  // Remove special characters except dots, dashes, underscores
  clean = clean.replace(/[^a-zA-Z0-9.-_]/g, '_');
  
  // Limit length
  if (clean.length > 255) {
    const ext = clean.split('.').pop();
    clean = clean.substring(0, 250) + '.' + ext;
  }
  
  return clean;
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJSON(input) {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed); // Re-stringify to ensure valid
  } catch {
    return null;
  }
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    
    // Remove old requests outside window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  async withRateLimit(fn) {
    if (!this.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.recordRequest();
    return await fn();
  }
}

/**
 * Input validation schemas
 */
export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email address';
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Invalid URL';
    }
  },

  minLength: (min) => (value) => {
    return value.length >= min || `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    return value.length <= max || `Must be no more than ${max} characters`;
  },

  required: (value) => {
    return (value && value.trim() !== '') || 'This field is required';
  },

  numeric: (value) => {
    return !isNaN(value) || 'Must be a number';
  },

  alphanumeric: (value) => {
    return /^[a-zA-Z0-9]+$/.test(value) || 'Must contain only letters and numbers';
  }
};

export default {
  sanitizeHTML,
  sanitizeQuery,
  sanitizeEmail,
  sanitizeURL,
  sanitizeFilename,
  sanitizeJSON,
  RateLimiter,
  validators
};

/**
 * Example usage:
 * 
 * import { sanitizeHTML, sanitizeEmail, validators } from '@/components/security/InputSanitizer';
 * 
 * const clean = sanitizeHTML(userInput);
 * const email = sanitizeEmail(emailInput);
 * const isValid = validators.email(emailInput);
 */