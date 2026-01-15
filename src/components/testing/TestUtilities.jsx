/**
 * Testing Utilities & Helpers
 * Provides mock data, test helpers, and utilities for component testing
 */

import React from "react";

/**
 * Mock Data Generators
 */
export const mockData = {
  user: (overrides = {}) => ({
    id: "user_123",
    email: "test@example.com",
    full_name: "Test User",
    role: "user",
    created_date: new Date().toISOString(),
    ...overrides
  }),

  course: (overrides = {}) => ({
    id: "course_123",
    title: "Test Course",
    description: "A test course description",
    category: "technology",
    level: "beginner",
    is_published: true,
    rating: 4.5,
    total_enrollments: 100,
    lessons: [
      {
        title: "Lesson 1",
        content: "Lesson content",
        order: 1,
        duration_minutes: 30
      }
    ],
    created_date: new Date().toISOString(),
    created_by: "instructor@example.com",
    ...overrides
  }),

  enrollment: (overrides = {}) => ({
    id: "enrollment_123",
    student_email: "student@example.com",
    course_id: "course_123",
    status: "active",
    progress: [1, 2],
    completion_percentage: 40,
    enrolled_date: new Date().toISOString(),
    ...overrides
  }),

  learningPath: (overrides = {}) => ({
    id: "path_123",
    student_email: "student@example.com",
    course_id: "course_123",
    recommended_lessons: [
      {
        lesson_order: 1,
        lesson_title: "Introduction to JavaScript",
        reason: "Foundation for web development",
        confidence_score: 95,
        completed: false
      }
    ],
    learning_style: "visual",
    current_level: "beginner",
    personalization_score: 85,
    ...overrides
  })
};

/**
 * Mock API Client
 * Simulates Base44 SDK for testing
 */
export class MockBase44Client {
  constructor(data = {}) {
    this.data = data;
    this.entities = this.createEntityProxy();
  }

  createEntityProxy() {
    const mockEntities = {};
    const entityTypes = ['Course', 'Enrollment', 'StudentLearningPath', 'User'];

    entityTypes.forEach(entityType => {
      mockEntities[entityType] = {
        list: jest.fn().mockResolvedValue(this.data[entityType] || []),
        filter: jest.fn().mockResolvedValue(this.data[entityType] || []),
        get: jest.fn().mockResolvedValue(this.data[entityType]?.[0] || null),
        create: jest.fn().mockResolvedValue({ id: 'new_id', ...this.data[entityType]?.[0] }),
        update: jest.fn().mockResolvedValue({ id: 'updated_id' }),
        delete: jest.fn().mockResolvedValue({ success: true })
      };
    });

    return mockEntities;
  }
}

/**
 * Wait for async updates (for testing)
 */
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Render helper with providers (for testing with React Testing Library)
 */
export function renderWithProviders(ui, options = {}) {
  const { 
    initialRoute = '/',
    user = mockData.user()
  } = options;

  // Mock auth context
  const AuthProvider = ({ children }) => {
    return <>{children}</>;
  };

  const Wrapper = ({ children }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    user
  };
}

/**
 * Custom matchers for testing (Jest)
 */
export const customMatchers = {
  toBeAccessible: (element) => {
    const hasAriaLabel = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
    const hasRole = element.getAttribute('role');
    
    return {
      pass: hasAriaLabel || hasRole,
      message: () => `Expected element to be accessible with ARIA attributes`
    };
  }
};

/**
 * Test data builders
 */
export class CourseBuilder {
  constructor() {
    this.course = mockData.course();
  }

  withTitle(title) {
    this.course.title = title;
    return this;
  }

  withLessons(count) {
    this.course.lessons = Array.from({ length: count }, (_, i) => ({
      title: `Lesson ${i + 1}`,
      content: `Content for lesson ${i + 1}`,
      order: i + 1,
      duration_minutes: 30
    }));
    return this;
  }

  published() {
    this.course.is_published = true;
    return this;
  }

  draft() {
    this.course.is_published = false;
    return this;
  }

  build() {
    return this.course;
  }
}

/**
 * Accessibility testing helpers
 */
export const a11y = {
  /**
   * Check if element has keyboard accessibility
   */
  isKeyboardAccessible: (element) => {
    const tabIndex = element.getAttribute('tabindex');
    const role = element.getAttribute('role');
    const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio'];
    
    return tabIndex !== '-1' && (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT' ||
      interactiveRoles.includes(role)
    );
  },

  /**
   * Simulate keyboard navigation
   */
  pressKey: (element, key) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    element.dispatchEvent(event);
  },

  /**
   * Check color contrast ratio
   */
  hasGoodContrast: (foreground, background) => {
    // Simplified - use actual WCAG formula in production
    const fgLuminance = parseFloat(foreground);
    const bgLuminance = parseFloat(background);
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05);
    return ratio >= 4.5; // WCAG AA standard
  }
};

export default {
  mockData,
  MockBase44Client,
  waitFor,
  renderWithProviders,
  customMatchers,
  CourseBuilder,
  a11y
};