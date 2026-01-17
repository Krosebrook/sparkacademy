# 💻 SparkAcademy - Development Guide

**Last Updated:** January 17, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Development Workflow](#development-workflow)
5. [Project Structure](#project-structure)
6. [Coding Standards](#coding-standards)
7. [Git Workflow](#git-workflow)
8. [Testing](#testing)
9. [Debugging](#debugging)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|---------------------|---------|
| **Node.js** | 18.0.0 | 18.x LTS or 20.x LTS | JavaScript runtime |
| **npm** | 9.0.0 | Latest | Package manager |
| **Git** | 2.30+ | Latest | Version control |
| **VS Code** | - | Latest | IDE (recommended) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "vitest.explorer"
  ]
}
```

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 8 GB minimum, 16 GB recommended
- **Disk Space**: 2 GB for dependencies
- **Internet**: Required for Base44 and external APIs

---

## Environment Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/Krosebrook/sparkacademy.git

# Or clone via SSH
git clone git@github.com:Krosebrook/sparkacademy.git

# Navigate to project directory
cd sparkacademy
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - 76 production dependencies
# - 16 development dependencies
```

**Note**: If you encounter errors during installation:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env

# Or create manually
touch .env
```

Add the following environment variables:

```bash
# Base44 Configuration
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_API_KEY=your_base44_api_key

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Application URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api

# Environment
NODE_ENV=development

# Optional: Monitoring & Analytics (for development)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_KEY=your_posthog_key
```

**Getting API Keys**:

**Base44**:
1. Sign up at [base44.io](https://base44.io)
2. Create a new project
3. Copy App ID and API Key from dashboard

**Stripe**:
1. Sign up at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard > Developers > API keys
3. Use test keys for development

### 4. Verify Setup

```bash
# Run the development server
npm run dev

# Should output:
#   VITE v6.1.0  ready in 500 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

Open http://localhost:5173 in your browser.

---

## Installation

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 3. Start development server
npm run dev
```

### Full Setup

```bash
# 1. Clone repository
git clone https://github.com/Krosebrook/sparkacademy.git
cd sparkacademy

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Configure .env file

# 4. Run linter to check for issues
npm run lint

# 5. Run type check (optional)
npm run typecheck

# 6. Start development server
npm run dev
```

---

## Development Workflow

### Starting Development

```bash
# Start the development server
npm run dev

# The server will:
# - Start on http://localhost:5173
# - Hot-reload on file changes
# - Show errors in browser overlay
# - Log requests in terminal
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "vite",                    // Start development server
    "build": "vite build",            // Build for production
    "preview": "vite preview",        // Preview production build
    "lint": "eslint .",               // Run ESLint
    "typecheck": "tsc -p ./jsconfig.json",  // Type checking
    "test": "vitest run",             // Run tests once
    "test:watch": "vitest",           // Run tests in watch mode
    "test:ui": "vitest --ui"          // Run tests with UI
  }
}
```

### Making Changes

**1. Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

**2. Make Your Changes**
- Edit files in `src/`
- Add components, pages, or features
- Follow coding standards (see below)

**3. Test Your Changes**
```bash
# Run linter
npm run lint

# Run tests (when available)
npm run test

# Check types
npm run typecheck

# Test in browser
npm run dev
```

**4. Commit Your Changes**
```bash
git add .
git commit -m "feat: add your feature"
```

**5. Push and Create PR**
```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

---

## Project Structure

```
sparkacademy/
├── docs/                     # Documentation
├── functions/                # Serverless functions
├── src/                      # Frontend source code
│   ├── api/                 # API client functions
│   ├── assets/              # Static assets (images, etc.)
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (Radix)
│   │   ├── forms/          # Form components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components (62 files)
│   ├── test/                # Test files
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Root component
│   ├── Layout.jsx           # Layout wrapper
│   ├── main.jsx             # Application entry point
│   ├── pages.config.js      # Pages configuration
│   ├── globals.css          # Global styles
│   └── index.css            # CSS entry point
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── components.json          # Shadcn UI configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── jsconfig.json            # JavaScript configuration
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # Project readme
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite configuration
└── vitest.config.js         # Vitest test configuration
```

### Key Directories

**`src/pages/`**: Page components mapped to routes
- Each file is a full page component
- Named based on feature (e.g., `Dashboard.jsx`, `CourseViewer.jsx`)
- Configured in `pages.config.js`

**`src/components/`**: Reusable components
- `ui/`: Base UI components from Radix UI
- Feature-specific components organized by domain

**`src/api/`**: API client functions
- Organized by resource (e.g., `courses.js`, `users.js`)
- Uses Base44 SDK
- Returns promises

**`src/hooks/`**: Custom React hooks
- Reusable logic (e.g., `useAuth`, `useCourses`)
- Follow `use` naming convention

**`functions/`**: Serverless functions
- Backend logic (Stripe, AI, Enterprise features)
- Deployed to Base44

---

## Coding Standards

### JavaScript/JSX Style Guide

**1. Use ES6+ Features**
```javascript
// ✅ Good
const courses = await getCourses();
const filteredCourses = courses.filter(c => c.published);

// ❌ Avoid
var courses = getCourses();
var filteredCourses = courses.filter(function(c) {
  return c.published;
});
```

**2. Component Structure**
```jsx
// ✅ Good: Functional component with hooks
import { useState, useEffect } from 'react';

export function CourseCard({ course, onEnroll }) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const handleEnroll = async () => {
    setIsEnrolling(true);
    await onEnroll(course.id);
    setIsEnrolling(false);
  };
  
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <button onClick={handleEnroll} disabled={isEnrolling}>
        {isEnrolling ? 'Enrolling...' : 'Enroll'}
      </button>
    </div>
  );
}
```

**3. Props Destructuring**
```jsx
// ✅ Good
function CourseCard({ title, description, price }) {
  return <div>...</div>;
}

// ❌ Avoid
function CourseCard(props) {
  return <div>{props.title}</div>;
}
```

**4. Named Exports**
```javascript
// ✅ Good
export function useCourses() { ... }
export function CourseCard() { ... }

// ❌ Avoid (unless default export is appropriate)
export default useCourses;
```

### Naming Conventions

**Files**:
- Components: PascalCase (`CourseCard.jsx`)
- Utilities: camelCase (`formatDate.js`)
- Hooks: camelCase with `use` prefix (`useCourses.js`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL.js`)

**Variables**:
```javascript
// Components: PascalCase
const CourseCard = () => { ... };

// Variables: camelCase
const courseId = '123';
const isLoading = true;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// Private variables: _camelCase (prefix with underscore)
const _internalHelper = () => { ... };
```

**Functions**:
```javascript
// Functions: camelCase
function getCourses() { ... }
function handleSubmit() { ... }

// Event handlers: handle + EventName
function handleClick() { ... }
function handleSubmit() { ... }
function handleChange() { ... }

// Boolean functions: is/has/can prefix
function isAuthenticated() { ... }
function hasPermission() { ... }
function canEdit() { ... }
```

### Code Organization

**Component Structure**:
```jsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/hooks/useCourses';
import { formatDate } from '@/utils/formatDate';

// 2. Types/Interfaces (if using TypeScript)
// interface CourseCardProps { ... }

// 3. Component
export function CourseCard({ course, onEnroll }) {
  // 3.1 Hooks
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { enrollInCourse } = useCourses();
  
  // 3.2 Event handlers
  const handleEnroll = async () => {
    setIsEnrolling(true);
    await enrollInCourse(course.id);
    setIsEnrolling(false);
    onEnroll?.();
  };
  
  // 3.3 Render helpers (optional)
  const renderPrice = () => {
    return course.price === 0 ? 'Free' : `$${course.price}`;
  };
  
  // 3.4 Render
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <span>{renderPrice()}</span>
      <Button onClick={handleEnroll} disabled={isEnrolling}>
        Enroll
      </Button>
    </div>
  );
}

// 4. Helper functions (if needed)
function calculateDiscount(price, discountPercent) {
  return price * (1 - discountPercent / 100);
}
```

### ESLint Configuration

The project uses ESLint with React plugin. Run linter before committing:

```bash
# Check for issues
npm run lint

# Auto-fix issues (where possible)
npm run lint -- --fix
```

**Key ESLint Rules**:
- No unused variables
- No console.log in production
- Consistent arrow function style
- Proper React hooks dependencies
- Accessibility rules (jsx-a11y)

---

## Git Workflow

### Branch Naming

```
feature/      - New features (feature/ai-tutor)
bugfix/       - Bug fixes (bugfix/login-error)
hotfix/       - Urgent production fixes (hotfix/payment-crash)
refactor/     - Code refactoring (refactor/api-client)
docs/         - Documentation (docs/api-guide)
test/         - Test additions (test/course-viewer)
chore/        - Maintenance tasks (chore/update-deps)
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add AI course generator
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify course enrollment logic
test: add tests for CourseCard component
chore: update dependencies
```

**Structure**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples**:
```bash
# Simple commit
git commit -m "feat: add course search functionality"

# With scope
git commit -m "fix(auth): resolve token refresh issue"

# With body
git commit -m "feat: add AI tutor chat

- Implement chat interface
- Add message history
- Integrate with OpenAI API"

# Breaking change
git commit -m "feat!: change authentication method

BREAKING CHANGE: Users will need to re-authenticate"
```

### Pull Request Process

**1. Create Feature Branch**
```bash
git checkout -b feature/my-feature
```

**2. Make Changes and Commit**
```bash
git add .
git commit -m "feat: add my feature"
```

**3. Push to Remote**
```bash
git push origin feature/my-feature
```

**4. Create Pull Request on GitHub**
- Use descriptive title
- Fill in PR template
- Link related issues
- Request reviewers
- Add labels

**5. Address Review Comments**
```bash
# Make changes based on feedback
git add .
git commit -m "refactor: address PR feedback"
git push origin feature/my-feature
```

**6. Merge PR**
- Squash and merge (for feature branches)
- Rebase and merge (for clean history)
- Delete branch after merge

---

## Testing

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test src/components/CourseCard.test.jsx

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests

**Test File Structure**:
```
src/components/CourseCard.jsx
src/components/CourseCard.test.jsx
```

**Example Test**:
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('renders course title', () => {
    const course = {
      id: '1',
      title: 'React Basics',
      description: 'Learn React',
      price: 49.99
    };
    
    render(<CourseCard course={course} />);
    
    expect(screen.getByText('React Basics')).toBeInTheDocument();
  });
  
  it('calls onEnroll when button clicked', async () => {
    const onEnroll = vi.fn();
    const course = { id: '1', title: 'Test Course' };
    
    render(<CourseCard course={course} onEnroll={onEnroll} />);
    
    const button = screen.getByRole('button', { name: /enroll/i });
    fireEvent.click(button);
    
    expect(onEnroll).toHaveBeenCalledWith('1');
  });
});
```

---

## Debugging

### Browser DevTools

**React Developer Tools**:
```
1. Install React DevTools extension
2. Open browser DevTools (F12)
3. Go to "Components" tab
4. Inspect component props and state
```

**Console Debugging**:
```javascript
// Add console logs (remove before committing)
console.log('Course data:', course);
console.error('Error fetching courses:', error);

// Use debugger statement
function handleEnroll() {
  debugger; // Execution will pause here
  enrollInCourse(courseId);
}
```

### VS Code Debugging

**Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**Using Debugger**:
1. Set breakpoints by clicking line numbers
2. Press F5 to start debugging
3. Use debug toolbar to step through code

### Network Debugging

**Inspect API Calls**:
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Filter by XHR/Fetch
4. Click on request to see details
```

**React Query DevTools** (already integrated):
```javascript
// DevTools are visible in development mode
// Click floating icon in bottom-right corner
// Inspect queries, mutations, and cache
```

---

## Common Tasks

### Adding a New Page

**1. Create Page Component**
```jsx
// src/pages/NewPage.jsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      <p>Content goes here</p>
    </div>
  );
}
```

**2. Register in pages.config.js**
```javascript
// src/pages.config.js
import NewPage from './pages/NewPage';

export const PAGES = {
  // ... existing pages
  "NewPage": NewPage,
};
```

**3. Add Route (if custom routing needed)**
```jsx
// src/App.jsx or router configuration
<Route path="/new-page" element={<NewPage />} />
```

### Adding a New Component

**1. Create Component File**
```jsx
// src/components/MyComponent.jsx
export function MyComponent({ title, description }) {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
```

**2. Use Component**
```jsx
import { MyComponent } from '@/components/MyComponent';

function ParentComponent() {
  return <MyComponent title="Hello" description="World" />;
}
```

### Adding a New Hook

**1. Create Hook File**
```javascript
// src/hooks/useMyCourse.js
import { useQuery } from '@tanstack/react-query';
import { coursesAPI } from '@/api/courses';

export function useMyCourse(courseId) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesAPI.getById(courseId),
    enabled: !!courseId,
  });
}
```

**2. Use Hook**
```jsx
import { useMyCourse } from '@/hooks/useMyCourse';

function CourseDetails({ courseId }) {
  const { data: course, isLoading } = useMyCourse(courseId);
  
  if (isLoading) return <Spinner />;
  return <div>{course.title}</div>;
}
```

### Adding a Serverless Function

**1. Create Function File**
```typescript
// functions/myFunction.ts
export default async function handler(req, res) {
  try {
    const { data } = req.body;
    
    // Your logic here
    const result = await processData(data);
    
    return res.json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

**2. Call Function from Frontend**
```javascript
async function callMyFunction(data) {
  const response = await fetch('/api/myFunction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  
  return await response.json();
}
```

---

## Troubleshooting

### Common Issues

**1. `npm install` fails**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**2. Port 5173 already in use**
```bash
# Kill process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

**3. Environment variables not working**
```bash
# Make sure .env file exists
ls -la .env

# Restart dev server after changing .env
npm run dev
```

**4. Build fails**
```bash
# Check for errors
npm run lint
npm run typecheck

# Clear build cache
rm -rf dist node_modules/.vite
npm run build
```

**5. Hot reload not working**
```bash
# Restart dev server
# If still not working, check:
# - File system permissions
# - Antivirus software
# - WSL2 issues (Windows)
```

### Getting Help

**Check existing resources**:
1. [Architecture Documentation](./ARCHITECTURE.md)
2. [Production Readiness Roadmap](./PRODUCTION_READINESS_ROADMAP.md)
3. [API Documentation](./API_DOCUMENTATION.md)
4. GitHub Issues

**Ask for help**:
1. Create GitHub Issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment info (OS, Node version, etc.)

---

## Best Practices

### Performance

1. **Use React.memo for expensive components**
```jsx
export const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy computation
  return <div>...</div>;
});
```

2. **Lazy load routes**
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseViewer = lazy(() => import('./pages/CourseViewer'));
```

3. **Optimize images**
```jsx
<img 
  src="image.jpg" 
  loading="lazy" 
  alt="Description"
  width={800}
  height={600}
/>
```

### Accessibility

1. **Use semantic HTML**
```jsx
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Avoid
<div onClick={handleClick}>Click me</div>
```

2. **Add ARIA labels**
```jsx
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>
```

3. **Support keyboard navigation**
```jsx
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  ...
</div>
```

### Security

1. **Never commit secrets**
```bash
# Use .env for sensitive data
# Add .env to .gitignore
echo ".env" >> .gitignore
```

2. **Validate user input**
```javascript
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().min(0),
});

const result = courseSchema.safeParse(formData);
```

3. **Sanitize HTML content**
```javascript
import DOMPurify from 'isomorphic-dompurify';

const cleanHTML = DOMPurify.sanitize(userHTML);
```

### Code Quality

1. **Keep functions small and focused**
```javascript
// ✅ Good: Single responsibility
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// ❌ Avoid: Multiple responsibilities
function calculateAndFormatTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(total);
}
```

2. **Use meaningful variable names**
```javascript
// ✅ Good
const enrolledCourses = user.courses.filter(c => c.status === 'enrolled');
const completedCount = courses.filter(c => c.completed).length;

// ❌ Avoid
const c = user.courses.filter(x => x.status === 'enrolled');
const n = courses.filter(x => x.completed).length;
```

3. **Add comments for complex logic**
```javascript
// ✅ Good
// Calculate discount based on user's enrollment history
// - 10% for users with 1-5 courses
// - 20% for users with 6-10 courses
// - 30% for users with 11+ courses
function calculateLoyaltyDiscount(enrollmentCount) {
  if (enrollmentCount >= 11) return 0.3;
  if (enrollmentCount >= 6) return 0.2;
  if (enrollmentCount >= 1) return 0.1;
  return 0;
}
```

---

## Conclusion

You're now ready to start developing SparkAcademy! Remember:

1. ✅ Follow coding standards
2. ✅ Write tests for new features
3. ✅ Run linter before committing
4. ✅ Create meaningful commit messages
5. ✅ Ask for help when stuck

Happy coding! 🚀

---

*Last Updated: January 17, 2026*  
*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)*  
*For deployment info, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)*
