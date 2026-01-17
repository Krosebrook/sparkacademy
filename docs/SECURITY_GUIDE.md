# 🔒 SparkAcademy - Security Guide

**Last Updated:** January 17, 2026  
**Version:** 1.0  
**Status:** Current

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [XSS Protection](#xss-protection)
5. [Rate Limiting](#rate-limiting)
6. [API Security](#api-security)
7. [Data Protection](#data-protection)
8. [Secure Coding Practices](#secure-coding-practices)
9. [Third-Party Integrations](#third-party-integrations)
10. [Vulnerability Management](#vulnerability-management)
11. [Security Checklist](#security-checklist)
12. [Incident Response](#incident-response)
13. [Security Tools & Auditing](#security-tools--auditing)

---

## Security Overview

SparkAcademy implements a **defense-in-depth** security strategy with multiple layers of protection. Security is a shared responsibility between the application code, Base44 platform, and third-party services.

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│  1. Network Layer (HTTPS, CORS, CSP)                    │
│  2. Authentication (Base44 Auth + JWT)                   │
│  3. Authorization (RBAC, Resource Permissions)           │
│  4. Input Validation (Client + Server)                   │
│  5. Rate Limiting (API Protection)                       │
│  6. Data Encryption (At Rest + In Transit)               │
│  7. Monitoring & Logging (Threat Detection)              │
└─────────────────────────────────────────────────────────┘
```

### Security Principles

1. **Least Privilege**: Users and services have minimum required permissions
2. **Defense in Depth**: Multiple security layers protect the system
3. **Fail Securely**: Errors default to secure state
4. **Security by Design**: Security built into features, not added later
5. **Zero Trust**: Verify every request, trust no input

---

## Authentication & Authorization

### Authentication Flow

SparkAcademy uses **Base44 SDK** for authentication, providing secure JWT-based auth:

```javascript
// Base44 client initialization
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: process.env.VITE_BASE44_APP_ID,
  serverUrl: process.env.VITE_BASE44_SERVER_URL,
  token: process.env.VITE_BASE44_TOKEN,
  requiresAuth: false // Auth handled per-route
});
```

### User Authentication

**Login/Signup:**
```javascript
// User login
const { user, session } = await base44.auth.signIn({
  email: sanitizeEmail(email),
  password: password
});

// User registration
const { user } = await base44.auth.signUp({
  email: sanitizeEmail(email),
  password: password,
  data: { role: 'student' }
});
```

**Session Management:**
- Sessions stored in httpOnly cookies
- JWT tokens expire after 24 hours
- Refresh tokens rotate automatically
- Logout invalidates all tokens

### Authorization Patterns

**Role-Based Access Control (RBAC):**

```javascript
// Define roles
const ROLES = {
  STUDENT: 'student',
  CREATOR: 'creator',
  ADMIN: 'admin',
  ENTERPRISE_ADMIN: 'enterprise_admin'
};

// Check user role
function requireRole(allowedRoles) {
  return async (req) => {
    const user = await base44.auth.me();
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    
    return user;
  };
}
```

**Resource-Level Authorization:**

```javascript
// Serverless function example
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId } = await req.json();
  const course = await base44.entities.Course.get(courseId);
  
  // Check ownership
  if (course.created_by !== user.email) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with authorized action
});
```

### Protected Routes

**Frontend Route Protection:**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

---

## Input Validation & Sanitization

### Server-Side Validation

**All serverless functions MUST validate input:**

```typescript
// Example: Validate course creation
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return Response.json({ error: 'Invalid title' }, { status: 400 });
    }
    
    // Validate length constraints
    if (body.title.length < 3 || body.title.length > 200) {
      return Response.json({ 
        error: 'Title must be 3-200 characters' 
      }, { status: 400 });
    }
    
    // Sanitize input
    const sanitizedTitle = sanitizeHTML(body.title);
    
    // Process validated input
    const course = await base44.entities.Course.create({
      title: sanitizedTitle,
      created_by: user.email
    });
    
    return Response.json({ course });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### Client-Side Validation

**Use React Hook Form + Zod for validation:**

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema
const courseSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  category: z.enum(['programming', 'design', 'business', 'marketing']),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(10000, 'Price too high')
});

function CourseForm() {
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: '', description: '', category: '', price: 0 }
  });
  
  const onSubmit = async (data) => {
    // Data is validated by Zod
    await createCourse(data);
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Sanitization Utilities

**Use the provided InputSanitizer:**

```javascript
import { 
  sanitizeHTML, 
  sanitizeEmail, 
  sanitizeURL,
  sanitizeFilename 
} from '@/components/security/InputSanitizer';

// Sanitize user input
const cleanHTML = sanitizeHTML(userInput);
const cleanEmail = sanitizeEmail(emailInput);
const cleanURL = sanitizeURL(urlInput);
const cleanFilename = sanitizeFilename(uploadedFile.name);
```

### Validation Rules

| Field Type | Validation Rules |
|------------|------------------|
| **Email** | Valid email format, max 255 chars, lowercase |
| **Password** | Min 8 chars, uppercase, lowercase, number, special char |
| **Username** | 3-30 chars, alphanumeric + underscore/dash |
| **URL** | Valid URL, https/http only, no javascript: protocol |
| **Filename** | Max 255 chars, no path traversal, safe characters |
| **HTML Content** | Sanitize tags, no script/iframe/object |
| **JSON** | Valid JSON structure, size limits |

---

## XSS Protection

### Content Security Policy

**Configure CSP headers in index.html:**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.base44.app https://api.stripe.com;
  frame-src https://js.stripe.com;
">
```

### React XSS Prevention

**React escapes by default, but be careful with:**

```jsx
// ✅ SAFE: React escapes automatically
<div>{userInput}</div>

// ❌ DANGEROUS: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE: Sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

### Rich Text Editor Security

**For React Quill (course descriptions):**

```jsx
import ReactQuill from 'react-quill';

// Configure allowed formats
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ]
};

// Sanitize output
function CourseEditor({ value, onChange }) {
  const handleChange = (content) => {
    const sanitized = sanitizeHTML(content);
    onChange(sanitized);
  };
  
  return <ReactQuill value={value} onChange={handleChange} modules={modules} />;
}
```

### URL Sanitization

```javascript
// Prevent javascript: and data: URLs
function sanitizeURL(url) {
  if (!url) return '';
  
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(url)) {
    return '';
  }
  
  // Ensure http/https
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  
  return url;
}
```

---

## Rate Limiting

### AI Endpoint Rate Limits

**Critical endpoints with rate limiting:**

| Endpoint | Limit | Window | User Type |
|----------|-------|--------|-----------|
| AI Tutor Chat | 10 requests | 10 minutes | Student |
| AI Course Generator | 3 generations | 24 hours | Creator |
| AI Recommendations | 20 requests | 1 hour | Student |
| Content Updates | 5 requests | 1 hour | Creator |
| Skill Analysis | 10 requests | 1 hour | Enterprise |

### Client-Side Rate Limiting

```javascript
import { RateLimiter } from '@/components/security/InputSanitizer';

// Create rate limiter
const aiTutorLimiter = new RateLimiter(10, 600000); // 10 req / 10 min

async function askAITutor(question) {
  try {
    await aiTutorLimiter.withRateLimit(async () => {
      const response = await base44.functions.invoke('aiTutor', {
        question,
        courseId
      });
      return response;
    });
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      toast.error('Too many requests. Please wait before asking again.');
    }
    throw error;
  }
}
```

### Server-Side Rate Limiting

```typescript
// Serverless function with rate limiting
const rateLimitStore = new Map();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const userKey = `${userId}`;
  
  if (!rateLimitStore.has(userKey)) {
    rateLimitStore.set(userKey, []);
  }
  
  const requests = rateLimitStore.get(userKey);
  const recentRequests = requests.filter((time: number) => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(userKey, recentRequests);
  return true;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check rate limit: 10 requests per 10 minutes
  if (!checkRateLimit(user.id, 10, 600000)) {
    return Response.json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }, { status: 429 });
  }
  
  // Process request
});
```

---

## API Security

### HTTPS Only

**All API communication MUST use HTTPS:**

```javascript
// Base44 SDK automatically uses HTTPS
const base44 = createClient({
  serverUrl: 'https://api.base44.app', // Always HTTPS
  // ...
});
```

### CORS Configuration

**Configure CORS for serverless functions:**

```typescript
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://sparkacademy.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  // Process request and add CORS headers
  const response = await handleRequest(req);
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
  return response;
});
```

### API Key Management

**Environment variables for API keys:**

```bash
# .env.local (never commit!)
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_TOKEN=your_token
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
OPENAI_API_KEY=sk-xxx  # Server-side only
STRIPE_SECRET_KEY=sk_xxx  # Server-side only
```

**Access in serverless functions:**

```typescript
// Secure: Server-side only
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

// Never expose in client code
// ❌ WRONG: const key = process.env.VITE_STRIPE_SECRET_KEY
```

### Request Signing

**Sign sensitive requests:**

```javascript
import { createHmac } from 'crypto';

function signRequest(payload, secret) {
  const signature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature;
}

// Client sends
const signature = signRequest(data, secret);
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-Signature': signature
  },
  body: JSON.stringify(data)
});

// Server verifies
const receivedSignature = req.headers.get('X-Signature');
const expectedSignature = signRequest(data, secret);
if (receivedSignature !== expectedSignature) {
  return Response.json({ error: 'Invalid signature' }, { status: 403 });
}
```

---

## Data Protection

### Sensitive Data Handling

**Personal Identifiable Information (PII):**

| Data Type | Storage | Encryption | Access |
|-----------|---------|------------|--------|
| Passwords | Base44 Auth | Bcrypt hashed | Never retrievable |
| Email | Base44 Database | At rest | Role-based |
| Payment Info | Stripe | PCI compliant | Never stored |
| SSN/Tax ID | ❌ Not stored | N/A | N/A |
| API Keys | Environment Vars | Server-side only | Admin only |

### Data Encryption

**At Rest:**
- Base44 encrypts all data at rest (AES-256)
- File uploads encrypted in storage
- Database backups encrypted

**In Transit:**
- All connections use TLS 1.3
- HTTPS enforced on all endpoints
- WebSocket connections encrypted (WSS)

### Data Retention

```javascript
// Soft delete pattern
async function deleteUser(userId) {
  await base44.entities.User.update(userId, {
    deleted_at: new Date(),
    email: `deleted_${userId}@example.com`, // Anonymize
    status: 'deleted'
  });
  
  // Hard delete after 90 days (compliance)
  scheduleHardDelete(userId, 90);
}
```

### GDPR Compliance

**Data export:**
```javascript
async function exportUserData(userId) {
  const user = await base44.entities.User.get(userId);
  const enrollments = await base44.entities.Enrollment.filter({ 
    student_email: user.email 
  });
  const progress = await base44.entities.Progress.filter({ 
    student_email: user.email 
  });
  
  return {
    personal_data: user,
    enrollments,
    progress,
    exported_at: new Date()
  };
}
```

**Data deletion:**
```javascript
async function deleteAllUserData(userId) {
  const user = await base44.entities.User.get(userId);
  
  // Delete related data
  await base44.entities.Enrollment.deleteMany({ student_email: user.email });
  await base44.entities.Progress.deleteMany({ student_email: user.email });
  await base44.entities.CourseFeedback.deleteMany({ student_email: user.email });
  
  // Delete user
  await base44.entities.User.delete(userId);
}
```

---

## Secure Coding Practices

### Code Review Checklist

**Before merging code:**
- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user inputs
- [ ] Authorization checks on protected routes
- [ ] Error messages don't leak sensitive info
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize HTML output)
- [ ] CSRF tokens on state-changing requests
- [ ] Rate limiting on expensive operations
- [ ] Logging doesn't include PII
- [ ] Dependencies are up-to-date

### Dependency Security

**Audit dependencies regularly:**

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check specific package
npm audit --package=lodash

# Update packages
npm update

# Check outdated packages
npm outdated
```

**Monitor with GitHub Dependabot:**
- Enable Dependabot alerts in repository settings
- Review and merge security updates promptly
- Pin critical dependencies to specific versions

### Error Handling

**Secure error responses:**

```javascript
// ❌ BAD: Leaks implementation details
catch (error) {
  return Response.json({ 
    error: error.stack,
    query: sql,
    user: user.email
  }, { status: 500 });
}

// ✅ GOOD: Generic message
catch (error) {
  console.error('Error processing request:', error); // Log internally
  return Response.json({ 
    error: 'An error occurred. Please try again.' 
  }, { status: 500 });
}
```

### Logging Best Practices

```javascript
// ❌ BAD: Logs sensitive data
console.log('User login:', user.email, user.password);

// ✅ GOOD: Logs safely
console.log('User login:', { userId: user.id, timestamp: Date.now() });

// Use structured logging
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      ...meta, 
      timestamp: new Date() 
    }));
  },
  error: (message, error) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error.message,
      timestamp: new Date() 
    }));
  }
};
```

---

## Third-Party Integrations

### Stripe Security

**PCI Compliance:**
- Use Stripe Elements (never handle card data)
- Validate webhooks with signature verification
- Use test keys in development

```javascript
// Verify Stripe webhook signature
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Process verified event
    await handleStripeEvent(event);
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
});
```

### OpenAI Security

**Prompt injection prevention:**

```typescript
function sanitizePrompt(userInput: string): string {
  // Remove instruction injection attempts
  const dangerousPatterns = [
    /ignore (previous|all) instructions/gi,
    /system prompt/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi
  ];
  
  let sanitized = userInput;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim().substring(0, 4000); // Length limit
}

// Use in AI calls
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful tutor.' },
    { role: 'user', content: sanitizePrompt(userQuestion) }
  ]
});
```

### External API Authentication

```typescript
// Store credentials securely
const BAMBOOHR_API_KEY = Deno.env.get('BAMBOOHR_API_KEY');
const WORKDAY_USERNAME = Deno.env.get('WORKDAY_USERNAME');
const WORKDAY_PASSWORD = Deno.env.get('WORKDAY_PASSWORD');

// Use secure headers
const auth = btoa(`${BAMBOOHR_API_KEY}:x`);
const response = await fetch('https://api.bamboohr.com/api/gateway.php', {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json'
  }
});
```

---

## Vulnerability Management

### Security Scanning

**Automated scans:**

```bash
# npm audit
npm audit --audit-level=high

# Snyk (install globally)
npm install -g snyk
snyk test
snyk monitor

# OWASP Dependency Check
npm install -g dependency-check
dependency-check --project "SparkAcademy" --scan .
```

### Vulnerability Severity

| Severity | Response Time | Action |
|----------|--------------|--------|
| **Critical** | 24 hours | Immediate patch & deploy |
| **High** | 7 days | Priority fix in next release |
| **Medium** | 30 days | Fix in regular sprint |
| **Low** | 90 days | Fix when convenient |

### Reporting Vulnerabilities

**Security contact:**
```
Email: security@sparkacademy.com
PGP Key: [Public key fingerprint]
Response Time: 48 hours
```

**Responsible disclosure:**
1. Email security team with details
2. Wait 90 days for fix before public disclosure
3. Receive credit in security advisory
4. Eligible for bug bounty (if program active)

---

## Security Checklist

### Pre-Deployment Checklist

**Authentication & Authorization:**
- [ ] All routes require authentication (except public pages)
- [ ] Role-based access control implemented
- [ ] Session timeout configured (24 hours)
- [ ] Password requirements enforced (min 8 chars, complexity)
- [ ] Failed login attempts are rate limited

**Input Validation:**
- [ ] All user inputs validated on client and server
- [ ] Zod schemas defined for all forms
- [ ] SQL injection prevention (parameterized queries)
- [ ] Path traversal prevention (file uploads)
- [ ] File upload size limits enforced
- [ ] Allowed file types validated

**XSS Prevention:**
- [ ] Content Security Policy configured
- [ ] React dangerouslySetInnerHTML used sparingly
- [ ] Rich text editor output sanitized
- [ ] URL inputs validated (no javascript: protocol)
- [ ] HTML entities escaped in output

**API Security:**
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured correctly
- [ ] API keys stored in environment variables
- [ ] Rate limiting on all expensive endpoints
- [ ] Webhook signatures verified (Stripe, etc.)

**Data Protection:**
- [ ] Sensitive data encrypted at rest
- [ ] PII access is role-restricted
- [ ] Payment data never stored (Stripe handles)
- [ ] User data export implemented (GDPR)
- [ ] User data deletion implemented (GDPR)

**Dependencies:**
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] All dependencies up-to-date
- [ ] Dependabot enabled
- [ ] Unused dependencies removed
- [ ] Production dependencies minimal

**Error Handling:**
- [ ] Error boundaries implemented
- [ ] User-friendly error messages
- [ ] Error logging configured (no PII)
- [ ] 404/500 pages implemented
- [ ] API errors don't leak stack traces

**Monitoring:**
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Security events logged
- [ ] Anomaly detection configured
- [ ] Incident response plan documented

---

## Incident Response

### Security Incident Plan

**1. Detection & Triage (0-1 hour)**
- Monitor alerts from Sentry, logs, user reports
- Assess severity: Critical, High, Medium, Low
- Notify security team immediately

**2. Containment (1-4 hours)**
- Isolate affected systems
- Disable compromised accounts
- Block malicious IPs/requests
- Preserve evidence for analysis

**3. Investigation (4-24 hours)**
- Analyze logs and audit trails
- Identify root cause
- Assess data breach scope
- Document findings

**4. Remediation (24-72 hours)**
- Deploy security patches
- Update vulnerable dependencies
- Strengthen affected systems
- Reset compromised credentials

**5. Recovery (72+ hours)**
- Restore normal operations
- Monitor for re-infection
- Communicate with affected users
- Update security policies

**6. Post-Incident Review**
- Document lessons learned
- Update incident response plan
- Improve monitoring/detection
- Conduct security training

### Breach Notification

**Required notifications:**
- Users affected: Within 72 hours
- Regulatory bodies: Per GDPR/CCPA requirements
- Law enforcement: If criminal activity suspected
- Insurance provider: Per policy terms

**Notification template:**
```
Subject: Important Security Notice

Dear [User],

We are writing to inform you of a security incident that may have 
affected your account. On [DATE], we discovered [BRIEF DESCRIPTION].

What happened: [DETAILS]
What information was involved: [DATA TYPES]
What we're doing: [ACTIONS TAKEN]
What you should do: [USER ACTIONS]

We take security seriously and apologize for this incident. If you 
have questions, please contact security@sparkacademy.com.

Sincerely,
SparkAcademy Security Team
```

---

## Security Tools & Auditing

### Recommended Tools

**Static Analysis:**
```bash
# ESLint security plugin
npm install --save-dev eslint-plugin-security
```

```javascript
// eslint.config.js
import security from 'eslint-plugin-security';

export default [
  {
    plugins: { security },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn'
    }
  }
];
```

**Dependency Scanning:**
```bash
# Snyk
npx snyk test
npx snyk monitor

# npm audit
npm audit --production

# OWASP Dependency Check
dependency-check --project "SparkAcademy" --scan .
```

**Runtime Protection:**
```bash
# Sentry error tracking
npm install @sentry/react

# Rate limiting (server-side)
# Implemented in serverless functions
```

### Security Audit Schedule

| Audit Type | Frequency | Owner |
|------------|-----------|-------|
| **Dependency Scan** | Weekly | CI/CD Pipeline |
| **Code Review** | Per PR | Dev Team |
| **Penetration Test** | Quarterly | Security Team |
| **Access Review** | Monthly | Admin |
| **Log Analysis** | Daily | Monitoring System |
| **Incident Drills** | Bi-annually | Security Team |

### Manual Security Testing

**Testing checklist:**
```bash
# 1. Authentication bypass attempts
curl -X POST https://api.base44.app/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' # Should return 401

# 2. SQL injection
curl "https://api.base44.app/courses?id=1' OR '1'='1" # Should be sanitized

# 3. XSS payload
curl -X POST https://api.base44.app/courses \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"<script>alert(1)</script>"}' # Should be sanitized

# 4. Rate limiting
for i in {1..100}; do 
  curl https://api.base44.app/ai-tutor
done # Should trigger 429 after limit

# 5. CORS
curl -H "Origin: https://evil.com" \
  https://api.base44.app/courses # Should block
```

---

## Additional Resources

### Security Training

**Recommended courses:**
- OWASP Top 10 Web Application Security Risks
- Secure Coding in JavaScript/TypeScript
- React Security Best Practices
- API Security Fundamentals

### Security Standards

**Compliance frameworks:**
- OWASP ASVS (Application Security Verification Standard)
- CWE Top 25 (Common Weakness Enumeration)
- NIST Cybersecurity Framework
- ISO 27001 (Information Security Management)

### Related Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - Security architecture details
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Secure development practices
- [API Documentation](./API_DOCUMENTATION.md) - API security requirements
- [Production Readiness Roadmap](./PRODUCTION_READINESS_ROADMAP.md) - Security milestones

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial security guide created |

---

**Document Owner:** Security Team  
**Last Reviewed:** January 17, 2026  
**Next Review:** April 17, 2026
