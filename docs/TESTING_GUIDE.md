# 🧪 SparkAcademy - Testing Guide

**Last Updated:** January 17, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Testing Strategy](#testing-strategy)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Test Coverage](#test-coverage)
8. [Running Tests](#running-tests)
9. [Writing Tests](#writing-tests)
10. [Mocking & Fixtures](#mocking--fixtures)
11. [CI/CD Integration](#cicd-integration)
12. [Best Practices](#best-practices)

---

## Testing Philosophy

### Current State

**Status**: 🔴 **0% test coverage** (Critical gap)

### Testing Pyramid

```
        /\
       /  \
      / E2E \          ← Few (expensive, slow)
     /______\
    /        \
   /Integration\       ← Some (moderate cost/speed)
  /____________\
 /              \
/  Unit Tests    \     ← Many (cheap, fast)
/__________________\
```

### Goals

**Short-term** (MVP):
- 40%+ coverage on critical paths
- Smoke tests for main features
- Basic E2E for user journeys

**Medium-term** (v1.1):
- 60%+ coverage
- Integration tests
- Comprehensive E2E

**Long-term** (Production):
- 80%+ coverage
- Performance tests
- Visual regression tests
- A/B testing infrastructure

---

## Testing Stack

### Core Testing Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Unit & integration testing | 4.0.17 |
| **@testing-library/react** | React component testing | 16.3.1 |
| **@testing-library/jest-dom** | DOM matchers | 6.9.1 |
| **jsdom** | DOM environment for tests | 27.4.0 |
| **Playwright** | E2E testing | TBD |

### Already Configured

✅ Vitest is already installed  
✅ `vitest.config.js` exists  
✅ Test scripts in `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Testing Strategy

### What to Test

**Priority 1: Critical User Paths** (Must Test)
- ✅ User authentication (signup, login, logout)
- ✅ Course browsing and search
- ✅ Course enrollment
- ✅ Course viewing and progress
- ✅ AI course generation
- ✅ Payment checkout

**Priority 2: Core Features** (Should Test)
- Course creation (manual)
- Course editing
- Profile management
- Dashboard functionality
- AI tutor interactions

**Priority 3: Secondary Features** (Nice to Test)
- Analytics dashboards
- Settings pages
- Advanced features

### What NOT to Test

❌ Third-party libraries (React, Radix UI)  
❌ Base44 SDK internals  
❌ External APIs (Stripe, OpenAI)  
❌ Browser APIs  
❌ CSS/styling (unless functional)

---

## Unit Testing

### Component Testing

**Example: Button Component**

```javascript
// src/components/ui/button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('applies correct variant class', () => {
    const { container } = render(
      <Button variant="outline">Click me</Button>
    );
    
    expect(container.firstChild).toHaveClass('border');
  });
});
```

**Example: CourseCard Component**

```javascript
// src/components/CourseCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  const mockCourse = {
    id: '1',
    title: 'React Basics',
    description: 'Learn React fundamentals',
    thumbnail: 'https://example.com/image.jpg',
    price: 49.99,
    level: 'beginner',
  };

  it('renders course information', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('React Basics')).toBeInTheDocument();
    expect(screen.getByText('Learn React fundamentals')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('renders thumbnail image', () => {
    render(<CourseCard course={mockCourse} />);
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockCourse.thumbnail);
    expect(img).toHaveAttribute('alt', mockCourse.title);
  });

  it('calls onEnroll when enroll button clicked', () => {
    const onEnroll = vi.fn();
    render(<CourseCard course={mockCourse} onEnroll={onEnroll} />);
    
    const button = screen.getByRole('button', { name: /enroll/i });
    fireEvent.click(button);
    
    expect(onEnroll).toHaveBeenCalledWith(mockCourse.id);
  });

  it('shows free label for free courses', () => {
    const freeCourse = { ...mockCourse, price: 0 };
    render(<CourseCard course={freeCourse} />);
    
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
```

### Hook Testing

**Example: useAuth Hook**

```javascript
// src/hooks/useAuth.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('returns null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    result.current.login.mutate(credentials);

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.user.email).toBe(credentials.email);
    });
  });

  it('handles login error', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    result.current.login.mutate({
      email: 'invalid@example.com',
      password: 'wrong',
    });

    await waitFor(() => {
      expect(result.current.login.isError).toBe(true);
    });
  });
});
```

### Utility Function Testing

**Example: formatDate Utility**

```javascript
// src/utils/formatDate.test.js
import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime } from './formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-01-17T12:00:00Z');
    expect(formatDate(date)).toBe('January 17, 2026');
  });

  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('Invalid date');
    expect(formatDate(undefined)).toBe('Invalid date');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns "5 minutes ago" correctly', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('returns "2 hours ago" correctly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });
});
```

---

## Integration Testing

### API Integration Tests

**Example: Course API**

```javascript
// src/api/courses.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { coursesAPI } from './courses';
import { db } from '@base44/sdk';

// Mock Base44 SDK
vi.mock('@base44/sdk', () => ({
  db: {
    collection: vi.fn(),
  },
}));

describe('coursesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all published courses', async () => {
      const mockCourses = [
        { id: '1', title: 'Course 1', status: 'published' },
        { id: '2', title: 'Course 2', status: 'published' },
      ];

      const mockGet = vi.fn().resolvedValue(mockCourses);
      const mockOrderBy = vi.fn(() => ({ get: mockGet }));
      const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));

      db.collection.mockReturnValue({ where: mockWhere });

      const courses = await coursesAPI.getAll();

      expect(db.collection).toHaveBeenCalledWith('courses');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'published');
      expect(courses).toEqual(mockCourses);
    });
  });

  describe('create', () => {
    it('creates a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Description',
        status: 'draft',
      };

      const mockCourse = { id: '123', ...courseData };
      const mockAdd = vi.fn().resolvedValue(mockCourse);

      db.collection.mockReturnValue({ add: mockAdd });

      const result = await coursesAPI.create(courseData);

      expect(db.collection).toHaveBeenCalledWith('courses');
      expect(mockAdd).toHaveBeenCalledWith(courseData);
      expect(result).toEqual(mockCourse);
    });
  });
});
```

### Component Integration Tests

**Example: CourseEnrollment Flow**

```javascript
// src/features/enrollment/CourseEnrollment.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseEnrollment } from './CourseEnrollment';

describe('CourseEnrollment Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('completes enrollment flow successfully', async () => {
    const courseId = '123';
    
    render(<CourseEnrollment courseId={courseId} />, { wrapper });

    // 1. Course details are displayed
    expect(await screen.findByText(/course details/i)).toBeInTheDocument();

    // 2. User clicks enroll button
    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    fireEvent.click(enrollButton);

    // 3. Confirmation dialog appears
    expect(await screen.findByText(/confirm enrollment/i)).toBeInTheDocument();

    // 4. User confirms
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // 5. Success message appears
    await waitFor(() => {
      expect(screen.getByText(/successfully enrolled/i)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing

### Playwright Setup

**Install Playwright**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration** (`playwright.config.js`):
```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

**Example: User Authentication Flow**

```javascript
// e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/');
    
    // Click signup button
    await page.click('text=Sign Up');
    
    // Fill signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can logout', async ({ page }) => {
    // Assume user is logged in
    await page.goto('/dashboard');
    
    // Click user menu
    await page.click('[data-testid="user-menu"]');
    
    // Click logout
    await page.click('text=Logout');
    
    // Verify redirect to home
    await expect(page).toHaveURL('/');
  });
});
```

**Example: Course Enrollment Flow**

```javascript
// e2e/enrollment.spec.js
import { test, expect } from '@playwright/test';

test.describe('Course Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('student can enroll in free course', async ({ page }) => {
    // Browse courses
    await page.goto('/courses');
    
    // Click on a course
    await page.click('text=React Basics');
    
    // Verify course details page
    await expect(page.locator('h1')).toContainText('React Basics');
    
    // Click enroll button
    await page.click('button:has-text("Enroll")');
    
    // Verify enrollment success
    await expect(page.locator('.toast')).toContainText('Successfully enrolled');
    
    // Verify button changes to "Go to Course"
    await expect(page.locator('button')).toContainText('Go to Course');
  });

  test('student can view enrolled course', async ({ page }) => {
    await page.goto('/my-courses');
    
    // Click on enrolled course
    await page.click('text=React Basics');
    
    // Verify course viewer
    await expect(page).toHaveURL(/\/courses\/\w+\/view/);
    await expect(page.locator('h2')).toContainText('Lesson 1');
    
    // Complete a lesson
    await page.click('button:has-text("Mark as Complete")');
    
    // Verify progress update
    await expect(page.locator('.progress')).toContainText('50%');
  });
});
```

**Example: Payment Flow**

```javascript
// e2e/payment.spec.js
import { test, expect } from '@playwright/test';

test.describe('Payment', () => {
  test('student can purchase paid course', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to paid course
    await page.goto('/courses');
    await page.click('text=Advanced React');
    
    // Click enroll button (should redirect to payment)
    await page.click('button:has-text("Enroll - $49.99")');
    
    // Wait for Stripe redirect
    await page.waitForURL(/stripe\.com/);
    
    // Fill Stripe test card
    await page.fill('[placeholder="Card number"]', '4242424242424242');
    await page.fill('[placeholder="MM / YY"]', '12/30');
    await page.fill('[placeholder="CVC"]', '123');
    await page.fill('[placeholder="ZIP"]', '12345');
    
    // Submit payment
    await page.click('button:has-text("Pay")');
    
    // Wait for redirect back
    await page.waitForURL(/sparkacademy\.com/);
    
    // Verify success
    await expect(page.locator('h1')).toContainText('Payment Successful');
  });
});
```

---

## Test Coverage

### Coverage Configuration

**vitest.config.js**:
```javascript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        '**/test/**',
      ],
      threshold: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
  },
});
```

### Running Coverage

```bash
# Generate coverage report
npm run test -- --coverage

# View HTML report
open coverage/index.html
```

### Coverage Targets

**MVP Phase**:
- Lines: 40%+
- Functions: 40%+
- Branches: 30%+
- Statements: 40%+

**v1.1 Phase**:
- Lines: 60%+
- Functions: 60%+
- Branches: 50%+
- Statements: 60%+

**Production**:
- Lines: 80%+
- Functions: 80%+
- Branches: 70%+
- Statements: 80%+

---

## Running Tests

### Local Development

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test src/components/CourseCard.test.jsx

# Run tests matching pattern
npm run test -- --grep "CourseCard"

# Run with coverage
npm run test -- --coverage
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/test.yml`):
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
      
      # Upload coverage to Codecov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Writing Tests

### Test Structure

Follow **AAA Pattern** (Arrange, Act, Assert):

```javascript
it('should do something', () => {
  // Arrange: Set up test data
  const user = { name: 'John', age: 30 };
  
  // Act: Perform action
  const greeting = greetUser(user);
  
  // Assert: Verify result
  expect(greeting).toBe('Hello, John!');
});
```

### Test Naming

**Good names describe behavior**:
```javascript
// ✅ Good
it('renders error message when API call fails', () => {});
it('disables submit button while form is submitting', () => {});
it('redirects to dashboard after successful login', () => {});

// ❌ Avoid
it('test1', () => {});
it('works correctly', () => {});
it('button test', () => {});
```

### Assertions

**Common Matchers**:
```javascript
// Equality
expect(value).toBe(42);
expect(value).toEqual({ name: 'John' });
expect(value).not.toBe(null);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeCloseTo(0.3); // for floats

// Strings
expect(text).toContain('hello');
expect(text).toMatch(/world/);

// Arrays
expect(array).toContain('item');
expect(array).toHaveLength(5);

// Objects
expect(obj).toHaveProperty('name');
expect(obj).toMatchObject({ age: 30 });

// DOM
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/home');
```

---

## Mocking & Fixtures

### Mocking Functions

```javascript
import { vi } from 'vitest';

// Create mock function
const mockFn = vi.fn();

// Mock with implementation
const mockFn = vi.fn((x) => x * 2);

// Mock with return value
const mockFn = vi.fn().mockReturnValue(42);

// Mock with promise
const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

// Assert function was called
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### Mocking Modules

```javascript
// Mock entire module
vi.mock('@base44/sdk', () => ({
  db: {
    collection: vi.fn(),
  },
  auth: {
    login: vi.fn(),
  },
}));

// Mock with factory
vi.mock('./api/courses', () => ({
  coursesAPI: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
  },
}));
```

### Test Fixtures

**Create fixture files**:
```javascript
// src/test/fixtures/courses.js
export const mockCourses = [
  {
    id: '1',
    title: 'React Basics',
    description: 'Learn React',
    price: 49.99,
    level: 'beginner',
  },
  {
    id: '2',
    title: 'Advanced React',
    description: 'Master React',
    price: 99.99,
    level: 'advanced',
  },
];

export const mockCourse = mockCourses[0];
```

**Use in tests**:
```javascript
import { mockCourse, mockCourses } from '@/test/fixtures/courses';

it('renders course list', () => {
  render(<CourseList courses={mockCourses} />);
  expect(screen.getByText('React Basics')).toBeInTheDocument();
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run tests
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
      
      - name: Build
        run: npm run build
  
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### General Testing

1. ✅ **Write tests first** (TDD) or alongside code
2. ✅ **Test behavior, not implementation**
3. ✅ **Keep tests simple and focused**
4. ✅ **Use descriptive test names**
5. ✅ **Follow AAA pattern** (Arrange, Act, Assert)
6. ✅ **Test edge cases and error handling**
7. ✅ **Avoid test interdependence**
8. ✅ **Clean up after tests** (reset mocks, clear state)

### Component Testing

1. ✅ **Test user interactions, not code**
2. ✅ **Use semantic queries** (getByRole, getByLabelText)
3. ✅ **Test accessibility**
4. ✅ **Mock external dependencies**
5. ✅ **Test loading and error states**
6. ✅ **Use fixtures for test data**

### E2E Testing

1. ✅ **Test critical user journeys**
2. ✅ **Keep tests independent**
3. ✅ **Use page object pattern** for complex flows
4. ✅ **Handle async operations properly**
5. ✅ **Take screenshots on failure**
6. ✅ **Run E2E tests in CI**

### What to Avoid

❌ Testing implementation details  
❌ Testing external libraries  
❌ Testing styles/CSS  
❌ Overly complex test setup  
❌ Too many mocks  
❌ Flaky tests  
❌ Slow tests  
❌ Tests that test nothing

---

## Conclusion

### Current Status

- 🔴 **0% coverage** (needs immediate attention)
- ✅ Testing infrastructure ready (Vitest configured)
- ⚠️ No tests written yet

### Next Steps

1. **Week 1-2**: Write smoke tests for critical paths
2. **Week 3-4**: Achieve 40% coverage on core features
3. **Week 5-6**: Add E2E tests for user journeys
4. **Post-MVP**: Increase coverage to 60%+

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

---

*Last Updated: January 17, 2026*  
*For more info, see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)*
