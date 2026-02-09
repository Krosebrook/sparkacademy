# SparkAcademy - GitHub Copilot Instructions

**Project**: SparkAcademy - AI-Powered Learning Management System  
**Stack**: React 18 + Vite 6 + Base44 BaaS + Radix UI + Tailwind CSS  
**Last Updated**: February 9, 2026

---

## Project Overview

SparkAcademy is a modern learning management system that leverages AI to revolutionize online education. The platform enables creators to build courses in minutes using AI generation, while learners benefit from personalized AI tutoring and progress tracking.

## Quick Reference

### Build & Run Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm test -- --coverage   # Run with coverage

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # Run type checking (jsconfig.json)

# Build
npm run build          # Build for production
npm run preview        # Preview production build
```

### Project Structure

```
sparkacademy/
├── .github/
│   ├── agents/                    # Custom coding agents (12 agents)
│   ├── workflows/                 # GitHub Actions CI/CD
│   ├── copilot-instructions.md    # This file
│   └── copilot-setup-steps.yml    # Environment setup
├── docs/                          # Comprehensive documentation
├── functions/                     # Base44 serverless functions (150+)
├── src/
│   ├── api/                      # API client functions
│   ├── components/
│   │   ├── ui/                   # Radix UI base components
│   │   ├── course-creator/       # Course creation tools
│   │   ├── course-viewer/        # Course viewing interface
│   │   ├── ai/                   # AI generation components
│   │   └── [30+ feature dirs]    # Feature-specific components
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Page components (62 pages)
│   ├── test/                     # Vitest test files
│   ├── utils/                    # Utility functions
│   ├── App.jsx                   # Root component
│   ├── Layout.jsx                # Main layout
│   ├── main.jsx                  # Entry point
│   └── pages.config.js           # Page routing config
├── package.json
├── vite.config.js                # Vite configuration
└── vitest.config.js              # Test configuration
```

---

## Technology Stack

### Frontend
- **React 18.2** - UI library
- **Vite 6.1** - Build tool and dev server
- **React Router 7.2** - Client-side routing
- **React Query 5.84** - Server state management
- **Tailwind CSS 3.4** - Utility-first CSS
- **Radix UI** - Accessible component primitives (shadcn/ui pattern)
- **Framer Motion 11** - Animations
- **Lucide React** - Icon library

### Backend
- **Base44 SDK 0.8.3** - Backend-as-a-Service
- **Serverless Functions** - 150+ custom functions
- **NoSQL Database** - Base44 managed database
- **Stripe** - Payment processing
- **OpenAI** - AI-powered features (via Base44 InvokeLLM)

### Development Tools
- **Vitest 4.0** - Unit and integration testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **jsdom** - Test environment

---

## Key Conventions

### File Naming

- **Components**: PascalCase (`CourseCard.jsx`, `AIQuizGenerator.jsx`)
- **Functions**: camelCase (`createCourseCheckout.ts`, `generateOutline.ts`)
- **Utilities**: camelCase (`formatDate.js`, `validateInput.js`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)

### Import Patterns

**ALWAYS use these import paths**:

```javascript
// UI components (Radix UI via shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Base44 client
import { base44 } from '@/api/base44Client';

// Utils
import { cn } from '@/lib/utils';

// Icons (Lucide)
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// React
import React, { useState, useEffect } from 'react';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

### Component Structure

**Standard React component pattern**:

```javascript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // Handler logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction}>Action</Button>
      </CardContent>
    </Card>
  );
}
```

### AI Component Pattern

**For AI generation components** (59 existing AI components):

```javascript
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AIFeature() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Your detailed prompt here...`,
        response_json_schema: {
          type: "object",
          properties: {
            // Define expected response structure
          }
        }
      });
      setResult(result.content);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={generateContent} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Generating..." : "Generate"}
    </Button>
  );
}
```

### Serverless Function Pattern

**Standard Base44 function** (TypeScript preferred):

```typescript
export default async function handler(req: any, res: any) {
  try {
    // 1. Validate input
    const { param1 } = req.body;
    if (!param1) {
      return res.status(400).json({ error: 'param1 required' });
    }

    // 2. Business logic
    const result = await performOperation(param1);

    // 3. Return success
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
```

### Testing Pattern

**Vitest + React Testing Library**:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockFn = vi.fn();
    render(<MyComponent onAction={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

---

## Code Quality Standards

### ESLint Rules (enforced)

- ✅ React hooks rules enforced
- ⚠️ `no-unused-vars` disabled (but remove unused vars anyway)
- ⚠️ `react/prop-types` disabled (no PropTypes required)
- ✅ `react/react-in-jsx-scope` disabled (React 18+)

### Best Practices

**DO**:
- ✅ Use Tailwind CSS classes for styling (never inline styles)
- ✅ Use Radix UI components from `src/components/ui/`
- ✅ Use `cn()` utility for class name merging
- ✅ Include loading states (with Loader2 icon)
- ✅ Handle errors gracefully
- ✅ Validate user input
- ✅ Use React Query for server state
- ✅ Lazy load routes and heavy components
- ✅ Use environment variables for secrets

**DON'T**:
- ❌ Hardcode API keys or secrets
- ❌ Use inline styles (use Tailwind classes)
- ❌ Skip error handling
- ❌ Forget loading states
- ❌ Use `any` type excessively
- ❌ Import React in every file (React 18+)
- ❌ Skip accessibility attributes

---

## Security Guidelines

### Critical Security Rules

1. **Stripe Integration**: Secret keys ONLY in serverless functions, NEVER in frontend
2. **Webhook Verification**: ALWAYS verify Stripe webhook signatures
3. **Input Sanitization**: Sanitize user-generated content with DOMPurify
4. **Authentication**: Use Base44 SDK authentication on all protected routes
5. **Environment Variables**: Never commit `.env` file or hardcode secrets

### Environment Variables

```bash
# Frontend (VITE_ prefix required)
VITE_BASE44_APP_ID=your_app_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (Serverless functions only)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
```

---

## Available Custom Agents

Use these specialized agents for specific tasks:

1. **ai-component-builder** - Build AI-powered components with Base44 InvokeLLM
2. **base44-serverless-function-builder** - Create serverless functions
3. **vitest-unit-test-writer** - Write unit tests with Vitest
4. **react-ui-component-builder** - Build UI components with Radix UI + Tailwind
5. **course-content-domain-expert** - Course/LMS domain logic
6. **security-auditor** - Find and fix security vulnerabilities
7. **eslint-code-quality-enforcer** - Fix linting errors
8. **github-actions-workflow-builder** - CI/CD workflows
9. **react-query-state-management** - Data fetching with React Query
10. **stripe-payment-integration** - Stripe checkout and payments
11. **documentation-writer** - Write comprehensive docs
12. **react-performance-optimizer** - Optimize performance
13. **pull-request-description-writer** - Write PR descriptions

---

## Troubleshooting

### Common Issues

**Build fails**: Check that `BASE44_LEGACY_SDK_IMPORTS=true` is set  
**Tests fail**: Ensure vitest.config.js setup file is correct  
**Lint errors**: Run `npm run lint -- --fix` to auto-fix  
**Import errors**: Use `@/` path alias for src directory

### Getting Help

- 📚 **Documentation**: See `docs/` directory
- 🐛 **Issues**: Check GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions

---

## Additional Resources

- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [Development Guide](../docs/DEVELOPMENT_GUIDE.md)
- [Contributing Guidelines](../docs/CONTRIBUTING.md)
- [Testing Guide](../docs/TESTING_GUIDE.md)
- [Security Guide](../docs/SECURITY_GUIDE.md)

---

*For questions or clarifications, see [CONTRIBUTING.md](../docs/CONTRIBUTING.md)*
