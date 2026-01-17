# 📡 SparkAcademy - API Documentation

**Last Updated:** January 17, 2026  
**Version:** 1.0  
**Status:** Current

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Base44 SDK](#base44-sdk)
3. [Authentication](#authentication)
4. [Serverless Functions](#serverless-functions)
5. [Entity APIs](#entity-apis)
6. [Error Handling](#error-handling)
7. [Rate Limits](#rate-limits)
8. [Webhooks](#webhooks)
9. [Code Examples](#code-examples)

---

## API Overview

SparkAcademy uses a **Backend-as-a-Service (BaaS)** architecture powered by Base44 SDK. The API consists of:

- **Base44 Entity APIs**: CRUD operations on database entities
- **Serverless Functions**: 32 custom endpoints for business logic
- **Third-Party APIs**: Stripe, OpenAI, HR integrations

### Base URL

```
Development: https://dev.base44.app
Production: https://api.base44.app
```

### API Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Application                   │
│                    (React + Base44 SDK)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS/REST
                         │
┌────────────────────────┴────────────────────────────────┐
│                     Base44 Platform                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Auth API   │  │  Entity API  │  │  Functions   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Base44 SDK

### Installation

```bash
npm install @base44/sdk
```

### Client Initialization

```javascript
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: process.env.VITE_BASE44_APP_ID,
  serverUrl: process.env.VITE_BASE44_SERVER_URL,
  token: process.env.VITE_BASE44_TOKEN,
  functionsVersion: 'v1',
  requiresAuth: false
});
```

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `appId` | string | Yes | Your Base44 application ID |
| `serverUrl` | string | Yes | Base44 API server URL |
| `token` | string | Yes | Application token |
| `functionsVersion` | string | No | Functions version (default: 'v1') |
| `requiresAuth` | boolean | No | Global auth requirement (default: false) |

---

## Authentication

### Sign Up

Create a new user account.

**Endpoint:** `base44.auth.signUp()`

**Request:**
```javascript
const { user, session } = await base44.auth.signUp({
  email: 'student@example.com',
  password: 'SecurePass123!',
  data: {
    role: 'student',
    full_name: 'John Doe'
  }
});
```

**Response:**
```javascript
{
  user: {
    id: 'usr_abc123',
    email: 'student@example.com',
    role: 'student',
    full_name: 'John Doe',
    created_at: '2026-01-17T10:00:00Z'
  },
  session: {
    token: 'eyJhbGciOiJIUzI1NiIs...',
    expires_at: '2026-01-18T10:00:00Z'
  }
}
```

**Errors:**
- `400` - Invalid email or password format
- `409` - Email already exists

---

### Sign In

Authenticate an existing user.

**Endpoint:** `base44.auth.signIn()`

**Request:**
```javascript
const { user, session } = await base44.auth.signIn({
  email: 'student@example.com',
  password: 'SecurePass123!'
});
```

**Response:**
```javascript
{
  user: {
    id: 'usr_abc123',
    email: 'student@example.com',
    role: 'student'
  },
  session: {
    token: 'eyJhbGciOiJIUzI1NiIs...',
    expires_at: '2026-01-18T10:00:00Z'
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### Get Current User

Retrieve authenticated user information.

**Endpoint:** `base44.auth.me()`

**Request:**
```javascript
const user = await base44.auth.me();
```

**Response:**
```javascript
{
  id: 'usr_abc123',
  email: 'student@example.com',
  role: 'student',
  full_name: 'John Doe',
  avatar_url: 'https://...'
}
```

**Errors:**
- `401` - Not authenticated

---

### Sign Out

Invalidate current session.

**Endpoint:** `base44.auth.signOut()`

**Request:**
```javascript
await base44.auth.signOut();
```

**Response:**
```javascript
{ success: true }
```

---

## Serverless Functions

SparkAcademy includes 32 serverless functions for business logic.

### Function Invocation

**Generic syntax:**
```javascript
const response = await base44.functions.invoke('functionName', payload);
```

---

### Payment Functions

#### 1. Create Stripe Checkout

Create a Stripe checkout session for course purchase.

**Function:** `createStripeCheckout`

**Request:**
```javascript
const response = await base44.functions.invoke('createStripeCheckout', {
  courseId: 'crs_abc123',
  successUrl: 'https://sparkacademy.com/success',
  cancelUrl: 'https://sparkacademy.com/cancel'
});
```

**Response:**
```javascript
{
  sessionId: 'cs_test_abc123',
  url: 'https://checkout.stripe.com/pay/cs_test_abc123'
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Course not found
- `400` - Invalid course (not published or free)

---

#### 2. Create Subscription Checkout

Create checkout session for subscription plans.

**Function:** `createSubscriptionCheckout`

**Request:**
```javascript
const response = await base44.functions.invoke('createSubscriptionCheckout', {
  planId: 'plan_monthly',
  successUrl: 'https://sparkacademy.com/success',
  cancelUrl: 'https://sparkacademy.com/cancel'
});
```

**Response:**
```javascript
{
  sessionId: 'cs_test_abc123',
  url: 'https://checkout.stripe.com/pay/cs_test_abc123'
}
```

**Plans:**
- `plan_monthly` - $29/month
- `plan_annual` - $290/year (save $58)
- `plan_enterprise` - Custom pricing

---

#### 3. Create Portal Session

Create Stripe customer portal session for subscription management.

**Function:** `createPortalSession`

**Request:**
```javascript
const response = await base44.functions.invoke('createPortalSession', {
  returnUrl: 'https://sparkacademy.com/dashboard'
});
```

**Response:**
```javascript
{
  url: 'https://billing.stripe.com/session/abc123'
}
```

---

#### 4. Verify Stripe Session

Verify payment completion and create enrollment.

**Function:** `verifyStripeSession`

**Request:**
```javascript
const response = await base44.functions.invoke('verifyStripeSession', {
  sessionId: 'cs_test_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  enrollment: {
    id: 'enr_abc123',
    course_id: 'crs_abc123',
    student_email: 'student@example.com',
    enrolled_at: '2026-01-17T10:00:00Z'
  }
}
```

---

#### 5. Stripe Webhook

Handle Stripe webhook events.

**Function:** `stripeWebhook`

**Webhook Events:**
- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.paid` - Subscription payment received
- `invoice.payment_failed` - Payment failed

**Setup:**
```bash
# Stripe CLI for testing
stripe listen --forward-to http://localhost:3000/api/stripe-webhook

# Production webhook URL
https://api.base44.app/v1/functions/stripeWebhook
```

---

### AI Functions

#### 6. Generate Course Content

AI-powered course generation from topic.

**Function:** `generateContentUpdates`

**Request:**
```javascript
const response = await base44.functions.invoke('generateContentUpdates', {
  topic: 'Introduction to React Hooks',
  level: 'intermediate',
  duration: 120, // minutes
  includeQuizzes: true
});
```

**Response:**
```javascript
{
  course: {
    title: 'Introduction to React Hooks',
    description: 'Learn React Hooks...',
    modules: [
      {
        title: 'Getting Started',
        lessons: [
          {
            title: 'What are Hooks?',
            content: '...',
            duration: 15,
            video_url: null
          }
        ],
        quiz: {
          questions: [...]
        }
      }
    ]
  }
}
```

**Rate Limit:** 3 generations per 24 hours per user

**Errors:**
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `400` - Invalid parameters

---

#### 7. Generate Recommendations

AI-powered course recommendations based on user progress.

**Function:** `generateRecommendations`

**Request:**
```javascript
const response = await base44.functions.invoke('generateRecommendations', {
  studentEmail: 'student@example.com',
  limit: 5
});
```

**Response:**
```javascript
{
  recommendations: [
    {
      course_id: 'crs_abc123',
      title: 'Advanced React Patterns',
      reason: 'Based on your completion of React Hooks',
      match_score: 0.92
    }
  ]
}
```

**Rate Limit:** 20 requests per hour

---

#### 8. Generate Project Assignment

AI-generated project for course.

**Function:** `generateProjectAssignment`

**Request:**
```javascript
const response = await base44.functions.invoke('generateProjectAssignment', {
  courseId: 'crs_abc123',
  difficulty: 'intermediate'
});
```

**Response:**
```javascript
{
  project: {
    title: 'Build a Todo App with React Hooks',
    description: 'Create a fully functional...',
    requirements: [
      'Use useState for state management',
      'Implement useEffect for side effects',
      'Add custom hooks for reusability'
    ],
    rubric: {
      functionality: 40,
      code_quality: 30,
      ui_design: 20,
      documentation: 10
    },
    estimated_hours: 8
  }
}
```

---

#### 9. Generate Course Feedback

AI-generated personalized feedback for students.

**Function:** `generateCourseFeedback`

**Request:**
```javascript
const response = await base44.functions.invoke('generateCourseFeedback', {
  studentEmail: 'student@example.com',
  courseId: 'crs_abc123'
});
```

**Response:**
```javascript
{
  feedback: {
    overall_performance: 'excellent',
    strengths: ['Quick learner', 'Consistent progress'],
    areas_for_improvement: ['Practice more advanced patterns'],
    recommended_next_steps: ['Take Advanced React course'],
    completion_percentage: 85
  }
}
```

---

### Certificate Functions

#### 10. Generate Certificate

Create course completion certificate.

**Function:** `generateCertificate`

**Request:**
```javascript
const response = await base44.functions.invoke('generateCertificate', {
  enrollmentId: 'enr_abc123'
});
```

**Response:**
```javascript
{
  certificate: {
    id: 'cert_abc123',
    student_name: 'John Doe',
    course_title: 'React Hooks Mastery',
    completion_date: '2026-01-17',
    certificate_url: 'https://cdn.base44.app/certificates/cert_abc123.pdf',
    verification_code: 'CERT-2026-ABC123'
  }
}
```

**Requirements:**
- Course must be 100% complete
- All quizzes passed (70%+ score)

---

#### 11. Generate Course Certificate

Alternative certificate generation endpoint.

**Function:** `generateCourseCertificate`

**Request:**
```javascript
const response = await base44.functions.invoke('generateCourseCertificate', {
  courseId: 'crs_abc123',
  studentEmail: 'student@example.com'
});
```

**Response:**
```javascript
{
  certificate_id: 'cert_abc123',
  download_url: 'https://...'
}
```

---

### Video Functions

#### 12. Create Video Session

Create live video session for course.

**Function:** `createVideoSession`

**Request:**
```javascript
const response = await base44.functions.invoke('createVideoSession', {
  courseId: 'crs_abc123',
  title: 'Live Q&A Session',
  scheduledFor: '2026-01-20T14:00:00Z',
  duration: 60
});
```

**Response:**
```javascript
{
  session: {
    id: 'vid_abc123',
    join_url: 'https://meet.sparkacademy.com/vid_abc123',
    start_url: 'https://meet.sparkacademy.com/host/vid_abc123',
    scheduled_for: '2026-01-20T14:00:00Z'
  }
}
```

---

#### 13. End Video Session

End active video session.

**Function:** `endVideoSession`

**Request:**
```javascript
const response = await base44.functions.invoke('endVideoSession', {
  sessionId: 'vid_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  duration: 3600, // seconds
  participants: 45,
  recording_url: 'https://...'
}
```

---

#### 14. Get Recordings

Retrieve video session recordings.

**Function:** `getRecordings`

**Request:**
```javascript
const response = await base44.functions.invoke('getRecordings', {
  courseId: 'crs_abc123'
});
```

**Response:**
```javascript
{
  recordings: [
    {
      id: 'rec_abc123',
      session_id: 'vid_abc123',
      title: 'Live Q&A Session',
      duration: 3600,
      recorded_at: '2026-01-20T14:00:00Z',
      url: 'https://cdn.base44.app/recordings/rec_abc123.mp4',
      thumbnail_url: 'https://...'
    }
  ]
}
```

---

### Enterprise Functions

#### 15. Provision Users

Bulk user provisioning for enterprise.

**Function:** `provisionUsers`

**Request:**
```javascript
const response = await base44.functions.invoke('provisionUsers', {
  users: [
    { email: 'user1@company.com', full_name: 'User One', role: 'student' },
    { email: 'user2@company.com', full_name: 'User Two', role: 'student' }
  ],
  organizationId: 'org_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  provisioned: 2,
  failed: 0,
  users: [
    { email: 'user1@company.com', id: 'usr_abc123', status: 'active' },
    { email: 'user2@company.com', id: 'usr_def456', status: 'active' }
  ]
}
```

**Rate Limit:** 1000 users per hour

---

#### 16. Enterprise Provision Users

Advanced enterprise provisioning with custom attributes.

**Function:** `enterpriseProvisionUsers`

**Request:**
```javascript
const response = await base44.functions.invoke('enterpriseProvisionUsers', {
  users: [
    {
      email: 'user@company.com',
      full_name: 'User Name',
      department: 'Engineering',
      employee_id: 'EMP001',
      manager_email: 'manager@company.com',
      custom_fields: { team: 'Frontend' }
    }
  ],
  organizationId: 'org_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  provisioned: 1,
  users: [...]
}
```

---

#### 17. Analyze Team Skills

Analyze skills across enterprise team.

**Function:** `analyzeTeamSkills`

**Request:**
```javascript
const response = await base44.functions.invoke('analyzeTeamSkills', {
  organizationId: 'org_abc123',
  teamId: 'team_eng'
});
```

**Response:**
```javascript
{
  team_size: 50,
  skills_analysis: {
    frontend: { average_proficiency: 0.75, coverage: 0.90 },
    backend: { average_proficiency: 0.65, coverage: 0.70 },
    devops: { average_proficiency: 0.50, coverage: 0.60 }
  },
  top_skills: ['React', 'JavaScript', 'Node.js'],
  skill_gaps: ['Kubernetes', 'AWS', 'TypeScript'],
  recommendations: [
    { course_id: 'crs_k8s', priority: 'high', affected_employees: 35 }
  ]
}
```

---

#### 18. Analyze Enterprise Skill Gaps

Comprehensive skill gap analysis for organization.

**Function:** `analyzeEnterpriseSkillGaps`

**Request:**
```javascript
const response = await base44.functions.invoke('analyzeEnterpriseSkillGaps', {
  organizationId: 'org_abc123',
  targetSkills: ['React', 'TypeScript', 'AWS', 'Kubernetes']
});
```

**Response:**
```javascript
{
  organization_size: 500,
  skill_gaps: [
    {
      skill: 'Kubernetes',
      current_proficiency: 0.30,
      target_proficiency: 0.80,
      gap: 0.50,
      employees_needing_training: 350
    }
  ],
  estimated_training_cost: 175000,
  recommended_courses: [...],
  priority: 'high'
}
```

---

#### 19. Enterprise Get Progress

Retrieve progress for all enterprise users.

**Function:** `enterpriseGetProgress`

**Request:**
```javascript
const response = await base44.functions.invoke('enterpriseGetProgress', {
  organizationId: 'org_abc123',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

**Response:**
```javascript
{
  total_users: 500,
  active_users: 420,
  courses_completed: 1250,
  average_completion_rate: 0.68,
  total_learning_hours: 15000,
  users: [
    {
      email: 'user@company.com',
      courses_enrolled: 5,
      courses_completed: 3,
      completion_rate: 0.60,
      learning_hours: 40
    }
  ]
}
```

---

#### 20. Calculate Training ROI

Calculate return on investment for training programs.

**Function:** `calculateTrainingROI`

**Request:**
```javascript
const response = await base44.functions.invoke('calculateTrainingROI', {
  organizationId: 'org_abc123',
  programId: 'prog_abc123',
  costData: {
    training_cost: 100000,
    employee_hours: 5000,
    avg_hourly_rate: 50
  }
});
```

**Response:**
```javascript
{
  roi_percentage: 225,
  total_cost: 350000, // Training + time cost
  estimated_benefit: 787500,
  net_benefit: 437500,
  payback_period_months: 6,
  metrics: {
    productivity_increase: 15,
    error_reduction: 25,
    employee_retention: 10
  }
}
```

---

### HR Integration Functions

#### 21. Sync BambooHR Employees

Sync employee data from BambooHR.

**Function:** `syncBambooHREmployees`

**Request:**
```javascript
const response = await base44.functions.invoke('syncBambooHREmployees', {
  integration_id: 'int_bamboo123'
});
```

**Response:**
```javascript
{
  success: true,
  synced: 150,
  created: 10,
  updated: 140,
  failed: 0,
  duration_ms: 5000
}
```

**Requires:** BAMBOOHR_API_KEY, BAMBOOHR_SUBDOMAIN environment variables

---

#### 22. Sync Workday Employees

Sync employee data from Workday.

**Function:** `syncWorkdayEmployees`

**Request:**
```javascript
const response = await base44.functions.invoke('syncWorkdayEmployees', {
  integration_id: 'int_workday123'
});
```

**Response:**
```javascript
{
  success: true,
  synced: 500,
  created: 50,
  updated: 450,
  duration_ms: 15000
}
```

**Requires:** WORKDAY_TENANT_URL, WORKDAY_USERNAME, WORKDAY_PASSWORD

---

#### 23. Push Learning Data to HR

Push course completion data back to HR system.

**Function:** `pushLearningDataToHR`

**Request:**
```javascript
const response = await base44.functions.invoke('pushLearningDataToHR', {
  integration_id: 'int_bamboo123',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

**Response:**
```javascript
{
  success: true,
  records_pushed: 250,
  failed: 0,
  hr_system: 'bamboohr'
}
```

---

#### 24. Test SSO Connection

Test single sign-on configuration.

**Function:** `testSSOConnection`

**Request:**
```javascript
const response = await base44.functions.invoke('testSSOConnection', {
  sso_provider: 'okta',
  domain: 'company.okta.com'
});
```

**Response:**
```javascript
{
  success: true,
  provider: 'okta',
  metadata_url: 'https://company.okta.com/.well-known/saml-metadata',
  entity_id: 'https://company.okta.com',
  sso_url: 'https://company.okta.com/sso/saml',
  certificate_valid: true
}
```

---

### Export Functions

#### 25. Export SCORM

Export course as SCORM 1.2 package.

**Function:** `exportScorm`

**Request:**
```javascript
const response = await base44.functions.invoke('exportScorm', {
  courseId: 'crs_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  download_url: 'https://cdn.base44.app/exports/scorm_crs_abc123.zip',
  expires_at: '2026-01-18T10:00:00Z',
  size_bytes: 15728640
}
```

**Format:** ZIP file containing SCORM 1.2 compliant package

---

#### 26. Export xAPI

Export course as xAPI (Tin Can) package.

**Function:** `exportXapi`

**Request:**
```javascript
const response = await base44.functions.invoke('exportXapi', {
  courseId: 'crs_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  download_url: 'https://cdn.base44.app/exports/xapi_crs_abc123.zip',
  expires_at: '2026-01-18T10:00:00Z',
  statements: 125
}
```

---

### Admin Functions

#### 27. List Paid Users

Get list of users with active paid subscriptions.

**Function:** `listPaidUsers`

**Request:**
```javascript
const response = await base44.functions.invoke('listPaidUsers', {
  page: 1,
  limit: 100
});
```

**Response:**
```javascript
{
  users: [
    {
      email: 'user@example.com',
      plan: 'monthly',
      subscription_id: 'sub_abc123',
      status: 'active',
      started_at: '2025-12-17',
      expires_at: '2026-02-17'
    }
  ],
  total: 450,
  page: 1,
  pages: 5
}
```

**Auth Required:** Admin role

---

#### 28. Sync Course Purchases

Sync one-time course purchases from Stripe.

**Function:** `syncCoursePurchases`

**Request:**
```javascript
const response = await base44.functions.invoke('syncCoursePurchases', {
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

**Response:**
```javascript
{
  success: true,
  purchases_synced: 125,
  total_revenue: 12500,
  new_enrollments: 125
}
```

---

#### 29. Sync Stripe Subscriptions

Sync subscription status from Stripe.

**Function:** `syncStripeSubscriptions`

**Request:**
```javascript
const response = await base44.functions.invoke('syncStripeSubscriptions');
```

**Response:**
```javascript
{
  success: true,
  active_subscriptions: 450,
  cancelled: 25,
  past_due: 10,
  updated: 35
}
```

---

#### 30. Verify Course Checkout

Verify and finalize course checkout.

**Function:** `verifyCourseCheckout`

**Request:**
```javascript
const response = await base44.functions.invoke('verifyCourseCheckout', {
  sessionId: 'cs_test_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  course_id: 'crs_abc123',
  student_email: 'student@example.com',
  enrollment_id: 'enr_abc123'
}
```

---

#### 31. Verify Subscription Session

Verify subscription checkout completion.

**Function:** `verifySubscriptionSession`

**Request:**
```javascript
const response = await base44.functions.invoke('verifySubscriptionSession', {
  sessionId: 'cs_test_abc123'
});
```

**Response:**
```javascript
{
  success: true,
  subscription_id: 'sub_abc123',
  plan: 'monthly',
  status: 'active'
}
```

---

#### 32. Create Course Checkout

Create custom checkout session for course bundle.

**Function:** `createCourseCheckout`

**Request:**
```javascript
const response = await base44.functions.invoke('createCourseCheckout', {
  courseIds: ['crs_abc123', 'crs_def456'],
  successUrl: 'https://sparkacademy.com/success',
  cancelUrl: 'https://sparkacademy.com/cancel'
});
```

**Response:**
```javascript
{
  sessionId: 'cs_test_abc123',
  url: 'https://checkout.stripe.com/pay/cs_test_abc123',
  total_amount: 19800 // cents
}
```

---

## Entity APIs

### Course Entity

**Create Course:**
```javascript
const course = await base44.entities.Course.create({
  title: 'React Fundamentals',
  description: 'Learn React basics',
  category: 'programming',
  level: 'beginner',
  price: 49.99,
  is_published: false,
  created_by: user.email
});
```

**Get Course:**
```javascript
const course = await base44.entities.Course.get('crs_abc123');
```

**Update Course:**
```javascript
const updated = await base44.entities.Course.update('crs_abc123', {
  is_published: true,
  price: 39.99
});
```

**List Courses:**
```javascript
const courses = await base44.entities.Course.filter({
  is_published: true,
  category: 'programming'
});
```

**Delete Course:**
```javascript
await base44.entities.Course.delete('crs_abc123');
```

---

### Enrollment Entity

**Create Enrollment:**
```javascript
const enrollment = await base44.entities.Enrollment.create({
  course_id: 'crs_abc123',
  student_email: 'student@example.com',
  enrolled_at: new Date(),
  status: 'active'
});
```

**Get Enrollments:**
```javascript
const enrollments = await base44.entities.Enrollment.filter({
  student_email: 'student@example.com'
});
```

---

### Progress Entity

**Update Progress:**
```javascript
const progress = await base44.entities.Progress.create({
  enrollment_id: 'enr_abc123',
  module_id: 'mod_abc123',
  lesson_id: 'les_abc123',
  completed: true,
  completed_at: new Date()
});
```

**Get Progress:**
```javascript
const progress = await base44.entities.Progress.filter({
  enrollment_id: 'enr_abc123'
});
```

---

## Error Handling

### Error Response Format

```javascript
{
  error: 'Error message',
  code: 'ERROR_CODE',
  details: {}, // Optional
  timestamp: '2026-01-17T10:00:00Z'
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INVALID_PARAMETERS` | Missing or invalid parameters |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `PERMISSION_DENIED` | Insufficient permissions |
| `PAYMENT_FAILED` | Payment processing failed |

---

## Rate Limits

### Global Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| **Authentication** | 10 requests | 1 minute |
| **Entity CRUD** | 100 requests | 1 minute |
| **AI Functions** | 20 requests | 1 hour |
| **Payments** | 10 requests | 1 minute |
| **Exports** | 5 requests | 1 hour |

### Function-Specific Limits

See individual function documentation for specific rate limits.

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1705489200
```

---

## Webhooks

### Stripe Webhooks

**Endpoint:** `/api/stripe-webhook`

**Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

**Signature Verification:**
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## Code Examples

### Complete Course Purchase Flow

```javascript
// 1. Create checkout session
const { url } = await base44.functions.invoke('createStripeCheckout', {
  courseId: 'crs_abc123',
  successUrl: window.location.origin + '/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: window.location.origin + '/courses'
});

// 2. Redirect to Stripe
window.location.href = url;

// 3. On success page, verify payment
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session_id');

const { enrollment } = await base44.functions.invoke('verifyStripeSession', {
  sessionId
});

// 4. Redirect to course
navigate(`/courses/${enrollment.course_id}/learn`);
```

---

### AI Course Generation

```javascript
// Generate course content
const { course } = await base44.functions.invoke('generateContentUpdates', {
  topic: 'Advanced TypeScript Patterns',
  level: 'advanced',
  duration: 180,
  includeQuizzes: true
});

// Save to database
const savedCourse = await base44.entities.Course.create({
  ...course,
  created_by: user.email,
  is_published: false
});

// Generate project assignment
const { project } = await base44.functions.invoke('generateProjectAssignment', {
  courseId: savedCourse.id,
  difficulty: 'advanced'
});

// Update course with project
await base44.entities.Course.update(savedCourse.id, {
  final_project: project
});
```

---

### Enterprise Bulk Enrollment

```javascript
// 1. Provision users
const { users } = await base44.functions.invoke('provisionUsers', {
  users: [
    { email: 'emp1@company.com', full_name: 'Employee 1' },
    { email: 'emp2@company.com', full_name: 'Employee 2' }
  ],
  organizationId: 'org_abc123'
});

// 2. Enroll in courses
const courseIds = ['crs_abc123', 'crs_def456'];

for (const user of users) {
  for (const courseId of courseIds) {
    await base44.entities.Enrollment.create({
      course_id: courseId,
      student_email: user.email,
      enrolled_at: new Date(),
      status: 'active'
    });
  }
}

// 3. Track progress
const { users: progress } = await base44.functions.invoke('enterpriseGetProgress', {
  organizationId: 'org_abc123',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});
```

---

## Related Documentation

- [Security Guide](./SECURITY_GUIDE.md) - API security best practices
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Development setup
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [Testing Guide](./TESTING_GUIDE.md) - API testing

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial API documentation |

---

**Document Owner:** Engineering Team  
**Last Reviewed:** January 17, 2026  
**Next Review:** April 17, 2026
