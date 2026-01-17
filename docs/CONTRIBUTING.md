# 🤝 SparkAcademy - Contributing Guide

**Last Updated:** January 17, 2026  
**Version:** 1.0  
**Status:** Current

---

## Table of Contents

1. [Welcome](#welcome)
2. [Code of Conduct](#code-of-conduct)
3. [Getting Started](#getting-started)
4. [Development Setup](#development-setup)
5. [How to Contribute](#how-to-contribute)
6. [Coding Standards](#coding-standards)
7. [Testing Requirements](#testing-requirements)
8. [Pull Request Process](#pull-request-process)
9. [Documentation Requirements](#documentation-requirements)
10. [Issue Guidelines](#issue-guidelines)
11. [Community](#community)

---

## Welcome

Thank you for considering contributing to SparkAcademy! 🎉

SparkAcademy is an AI-powered learning management system built with modern web technologies. We're building a platform that makes high-quality education accessible to everyone, and we welcome contributions from developers, designers, writers, and educators.

### Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features or improvements
- 💻 **Code Contributions**: Submit bug fixes or new features
- 📝 **Documentation**: Improve our docs, guides, and tutorials
- 🎨 **Design**: Enhance UI/UX with designs and feedback
- 🌍 **Translation**: Help make SparkAcademy multilingual
- 💬 **Community Support**: Answer questions and help other users

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We pledge to make participation in our project a harassment-free experience for everyone, regardless of:

- Age
- Body size
- Disability
- Ethnicity
- Gender identity and expression
- Level of experience
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Other conduct inappropriate for a professional setting

### Enforcement

Instances of unacceptable behavior may be reported to the project team at **conduct@sparkacademy.com**. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js** 18+ installed
- **npm** 9+ installed
- **Git** for version control
- A **GitHub account**
- Basic knowledge of **React** and **JavaScript/TypeScript**

### Quick Start

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/sparkacademy.git
cd sparkacademy

# 3. Add upstream remote
git remote add upstream https://github.com/Krosebrook/sparkacademy.git

# 4. Install dependencies
npm install

# 5. Create a branch
git checkout -b feature/your-feature-name

# 6. Start development server
npm run dev

# 7. Make your changes and test
npm run test
npm run lint

# 8. Commit and push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 9. Open a Pull Request on GitHub
```

---

## Development Setup

### Environment Configuration

**1. Copy environment template:**
```bash
cp .env.example .env.local
```

**2. Configure required variables:**
```bash
# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_SERVER_URL=https://api.base44.app
VITE_BASE44_TOKEN=your_token
VITE_BASE44_FUNCTIONS_VERSION=v1

# Stripe (for payment testing)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key

# Development
VITE_APP_URL=http://localhost:5173
```

**3. Get Base44 credentials:**
- Sign up at [base44.app](https://base44.app)
- Create a new application
- Copy your App ID and Token

### Development Server

```bash
# Start dev server (with hot reload)
npm run dev

# Access at http://localhost:5173
```

### Project Structure

```
sparkacademy/
├── docs/                    # Documentation
├── functions/              # Serverless functions (32)
│   ├── createStripeCheckout
│   ├── generateContentUpdates
│   └── ...
├── src/
│   ├── api/               # API clients
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── security/     # Security utilities
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components (62)
│   └── utils/            # Helper utilities
├── package.json
└── vite.config.js
```

---

## How to Contribute

### Finding Issues to Work On

**Good First Issues:**
Look for issues labeled `good-first-issue` - these are ideal for newcomers.

**Help Wanted:**
Issues labeled `help-wanted` need community contributions.

**Bug Fixes:**
Check issues labeled `bug` for known problems to fix.

### Reporting Bugs

**Before submitting a bug:**
1. Check if the issue already exists
2. Verify it's reproducible on the latest version
3. Collect relevant information

**Bug report template:**
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.1]
- Node version: [e.g., 18.19.0]

**Additional Context**
Any other relevant information.
```

### Suggesting Features

**Feature request template:**
```markdown
**Feature Description**
Clear description of the feature.

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Mockups, examples, or references.
```

---

## Coding Standards

### JavaScript/JSX Style Guide

**General Rules:**
- Use **ES6+** syntax (const/let, arrow functions, destructuring)
- Use **functional components** with hooks (no class components)
- Follow **Airbnb JavaScript Style Guide** principles
- Use **meaningful variable names**

**Example:**
```javascript
// ✅ GOOD
const CourseCard = ({ course, onEnroll }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      await onEnroll(course.id);
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <h3>{course.title}</h3>
      <Button onClick={handleEnroll} disabled={isLoading}>
        {isLoading ? 'Enrolling...' : 'Enroll'}
      </Button>
    </Card>
  );
};

// ❌ BAD
class CourseCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  
  render() {
    var c = this.props.course;
    return <div onClick={() => this.props.enroll(c.id)}>{c.title}</div>;
  }
}
```

### Component Structure

**Order of elements:**
```javascript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/api/base44Client';

// 2. Type definitions (if using TypeScript)
interface CourseProps {
  courseId: string;
  onComplete: () => void;
}

// 3. Component definition
export function CourseViewer({ courseId, onComplete }) {
  // 3a. State hooks
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 3b. Effect hooks
  useEffect(() => {
    loadCourse();
  }, [courseId]);
  
  // 3c. Custom hooks
  const { user } = useAuth();
  
  // 3d. Event handlers
  const loadCourse = async () => {
    // ...
  };
  
  const handleComplete = () => {
    // ...
  };
  
  // 3e. Render conditions
  if (loading) return <LoadingSpinner />;
  if (!course) return <ErrorMessage />;
  
  // 3f. JSX return
  return (
    <div className="course-viewer">
      {/* Component JSX */}
    </div>
  );
}

// 4. Sub-components (if any)
function CourseModule({ module }) {
  // ...
}

// 5. Exports
export default CourseViewer;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `CourseCard`, `StudentDashboard` |
| **Functions** | camelCase | `handleSubmit`, `fetchCourses` |
| **Constants** | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRIES` |
| **Files** | PascalCase (components) | `CourseCard.jsx` |
| **Folders** | lowercase | `components`, `utils` |
| **CSS Classes** | kebab-case | `course-card`, `btn-primary` |

### Import Organization

```javascript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal dependencies
import { base44 } from '@/api/base44Client';

// 3. Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Utilities
import { formatDate } from '@/lib/utils';
import { sanitizeHTML } from '@/components/security/InputSanitizer';

// 5. Styles
import './CourseCard.css';
```

### Comments and Documentation

**When to comment:**
- Complex logic that isn't immediately obvious
- Workarounds or hacks (with explanation)
- API contracts and data structures
- TODO items with issue numbers

**Example:**
```javascript
/**
 * Calculate course completion percentage
 * @param {Object} progress - User progress data
 * @param {Object} course - Course structure
 * @returns {number} Completion percentage (0-100)
 */
function calculateProgress(progress, course) {
  // Filter only completed lessons
  const completed = progress.filter(p => p.completed);
  
  // TODO(#123): Handle optional lessons in calculation
  const totalLessons = course.modules.reduce(
    (sum, mod) => sum + mod.lessons.length, 
    0
  );
  
  return Math.round((completed.length / totalLessons) * 100);
}
```

### File Organization

**Component file structure:**
```
components/
├── courses/
│   ├── CourseCard.jsx          # Main component
│   ├── CourseCard.test.jsx     # Tests
│   ├── CourseList.jsx
│   └── index.js                # Barrel export
└── ui/
    ├── button.jsx
    ├── card.jsx
    └── index.js
```

**Barrel exports (index.js):**
```javascript
export { CourseCard } from './CourseCard';
export { CourseList } from './CourseList';
```

---

## Testing Requirements

### Testing Philosophy

**All contributions should include tests:**
- Bug fixes must include regression tests
- New features must include unit and integration tests
- Aim for 80%+ code coverage on new code

### Test Structure

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CourseCard from './CourseCard';

describe('CourseCard', () => {
  // Setup
  const mockCourse = {
    id: 'crs_123',
    title: 'React Fundamentals',
    price: 49.99
  };
  
  const mockOnEnroll = vi.fn();
  
  beforeEach(() => {
    mockOnEnroll.mockClear();
  });
  
  // Tests
  it('renders course information', () => {
    render(<CourseCard course={mockCourse} onEnroll={mockOnEnroll} />);
    
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });
  
  it('calls onEnroll when button clicked', async () => {
    render(<CourseCard course={mockCourse} onEnroll={mockOnEnroll} />);
    
    const button = screen.getByRole('button', { name: /enroll/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnEnroll).toHaveBeenCalledWith('crs_123');
    });
  });
  
  it('shows loading state during enrollment', async () => {
    mockOnEnroll.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<CourseCard course={mockCourse} onEnroll={mockOnEnroll} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(screen.getByText(/enrolling/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm test CourseCard.test.jsx

# Run tests with UI
npm run test:ui
```

### Test Coverage Requirements

| Type | Minimum Coverage |
|------|-----------------|
| **Statements** | 80% |
| **Branches** | 75% |
| **Functions** | 80% |
| **Lines** | 80% |

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console errors in browser
- [ ] Tested in multiple browsers (Chrome, Firefox, Safari)
- [ ] Accessibility checked (keyboard nav, screen reader)

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Examples:
feat(courses): add AI-powered course recommendations
fix(auth): resolve login redirect issue
docs(api): update authentication documentation
test(enrollment): add unit tests for enrollment flow
refactor(components): simplify CourseCard component
style(ui): fix button alignment on mobile
perf(search): optimize course search query
chore(deps): update dependencies
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `style`: Code style changes (formatting)
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### PR Description Template

```markdown
## Description
Brief description of changes.

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
- [ ] No linting errors
```

### Review Process

**1. Automated Checks:**
- CI/CD pipeline runs tests
- Linting checks
- Build verification

**2. Code Review:**
- At least one approval required
- Address all review comments
- Resolve all conversations

**3. Merge Requirements:**
- All checks passing ✅
- At least 1 approval ✅
- No merge conflicts ✅
- Up-to-date with main branch ✅

### After Merge

- Delete your branch
- Close related issues
- Update project board
- Celebrate! 🎉

---

## Documentation Requirements

### When to Update Documentation

**Always update docs when:**
- Adding new features
- Changing API endpoints
- Modifying configuration
- Changing environment variables
- Adding dependencies
- Updating setup process

### Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview and quick start |
| **ARCHITECTURE.md** | System architecture |
| **API_DOCUMENTATION.md** | API reference |
| **DEVELOPMENT_GUIDE.md** | Development setup |
| **SECURITY_GUIDE.md** | Security best practices |
| **TESTING_GUIDE.md** | Testing guidelines |
| **CONTRIBUTING.md** | This file |

### Documentation Style

**Writing style:**
- Clear and concise
- Step-by-step instructions
- Code examples for complex concepts
- Screenshots for UI features
- Table of contents for long docs

**Example:**
```markdown
## Installing Dependencies

To install project dependencies, run:

```bash
npm install
```

This will install:
- 76 production dependencies
- 16 development dependencies

If installation fails, try:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```
```

### Inline Code Comments

**JSDoc for functions:**
```javascript
/**
 * Enroll student in a course
 * @param {string} courseId - The course ID
 * @param {string} studentEmail - Student email address
 * @returns {Promise<Object>} Enrollment object
 * @throws {Error} If course not found or already enrolled
 */
async function enrollStudent(courseId, studentEmail) {
  // Implementation
}
```

---

## Issue Guidelines

### Issue Templates

**Bug Report:**
```markdown
**Bug Description**
Clear description of the issue.

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- Browser: Chrome 120
- OS: macOS 14.1
- Node: 18.19.0

**Screenshots**
Add screenshots if applicable.
```

**Feature Request:**
```markdown
**Feature Description**
What feature should be added?

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives**
Other solutions considered.

**Additional Context**
Mockups, examples, references.
```

### Issue Labels

| Label | Usage |
|-------|-------|
| `bug` | Something isn't working |
| `feature` | New feature request |
| `documentation` | Documentation improvements |
| `good-first-issue` | Good for newcomers |
| `help-wanted` | Community help needed |
| `priority-high` | High priority issue |
| `wontfix` | Won't be addressed |
| `duplicate` | Duplicate issue |
| `question` | Question needing clarification |

---

## Community

### Getting Help

**Communication Channels:**
- **GitHub Discussions**: For questions and discussions
- **GitHub Issues**: For bugs and feature requests
- **Discord**: [Join our Discord](https://discord.gg/sparkacademy) (coming soon)
- **Email**: support@sparkacademy.com

### Recognition

**Contributors are recognized in:**
- README.md Contributors section
- Release notes
- Annual contributor spotlight

### Security Issues

**Do NOT open public issues for security vulnerabilities.**

Report security issues to: **security@sparkacademy.com**

See [Security Guide](./SECURITY_GUIDE.md) for our security policy.

---

## Development Best Practices

### Git Workflow

**Branch naming:**
```
feature/add-course-analytics
fix/login-redirect-bug
docs/update-api-docs
test/add-enrollment-tests
refactor/simplify-auth-flow
```

**Commit messages:**
```bash
# Good commits
git commit -m "feat(courses): add course rating system"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs(api): add webhook documentation"

# Bad commits
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "wip"
```

**Keeping your fork updated:**
```bash
# Fetch upstream changes
git fetch upstream

# Merge into your local main
git checkout main
git merge upstream/main

# Update your fork
git push origin main
```

### Code Review Guidelines

**As a reviewer:**
- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve PRs that meet standards
- Use GitHub's suggestion feature

**As an author:**
- Respond to all comments
- Ask for clarification when needed
- Don't take feedback personally
- Thank reviewers for their time

### Performance Considerations

**Best practices:**
- Lazy load components and images
- Memoize expensive calculations
- Use React.memo for pure components
- Optimize bundle size
- Minimize re-renders

**Example:**
```javascript
import { memo, useMemo } from 'react';

// Memoize component
export const CourseCard = memo(({ course }) => {
  // Memoize expensive calculation
  const statistics = useMemo(() => 
    calculateCourseStatistics(course),
    [course]
  );
  
  return <Card>{/* ... */}</Card>;
});

// Lazy load heavy components
const CourseEditor = lazy(() => import('./CourseEditor'));
```

### Accessibility

**Requirements:**
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader compatibility

**Example:**
```jsx
// ✅ GOOD: Accessible button
<button
  onClick={handleClick}
  aria-label="Enroll in course"
  disabled={isLoading}
>
  {isLoading ? 'Enrolling...' : 'Enroll'}
</button>

// ❌ BAD: Inaccessible div
<div onClick={handleClick}>
  Enroll
</div>
```

---

## Additional Resources

### Learning Resources

**React:**
- [React Documentation](https://react.dev)
- [React Hooks Guide](https://react.dev/reference/react)

**Base44:**
- [Base44 Documentation](https://docs.base44.app)
- [Base44 SDK Reference](https://docs.base44.app/sdk)

**Testing:**
- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)

**Code Quality:**
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)

### Related Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Guide](./SECURITY_GUIDE.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

## FAQ

**Q: I'm new to open source. Where should I start?**  
A: Look for issues labeled `good-first-issue`. These are designed for newcomers.

**Q: How long does PR review take?**  
A: Usually 2-5 days. Complex PRs may take longer.

**Q: Can I work on an issue that's already assigned?**  
A: Please ask in the issue comments before starting work.

**Q: My tests are failing. What should I do?**  
A: Run `npm test` locally and fix errors. Ask for help in the PR if stuck.

**Q: Do I need to sign a CLA?**  
A: No, SparkAcademy doesn't require a CLA.

**Q: Can I add a new dependency?**  
A: Discuss in an issue first. Prefer existing dependencies when possible.

**Q: How do I become a maintainer?**  
A: Consistent contributions and community involvement. Maintainers are invited.

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial contributing guide created |

---

## Thank You! 🙏

Thank you for contributing to SparkAcademy! Your contributions help make education more accessible to everyone around the world.

**Questions?** Open a discussion or email us at contribute@sparkacademy.com

**Document Owner:** Community Team  
**Last Reviewed:** January 17, 2026  
**Next Review:** April 17, 2026
