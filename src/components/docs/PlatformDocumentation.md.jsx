# INTInc AI Learning Platform Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Platform:** Base44 React Application

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [User Guides](#user-guides)
5. [Developer Documentation](#developer-documentation)
6. [API Reference](#api-reference)
7. [Deployment & Operations](#deployment--operations)
8. [Security & Compliance](#security--compliance)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Changelog](#changelog)
12. [Appendices](#appendices)

---

## Overview

### Purpose

INTInc is an enterprise AI-powered learning management platform designed to democratize AI education across organizations. It combines adaptive learning, gamification, community collaboration, and AI-driven content generation to create personalized learning experiences.

### Key Features

- **AI Course Creation**: Generate complete courses using AI with syllabi, lesson plans, quizzes, and assessments
- **Adaptive Learning Paths**: Personalized learning journeys based on skill gaps and career goals
- **Advanced AI Tutor**: Context-aware tutoring with code review, study plans, and proactive check-ins
- **Gamification**: Points, badges, leaderboards, and achievement tracking
- **Community Forum**: Topic-based discussions with AI-powered moderation
- **B2B Analytics**: Enterprise client dashboards with benchmarking and skill gap analysis
- **Live Video Sessions**: Interactive Q&A and collaborative learning
- **Offline Learning**: Download courses for offline access

### Supported Platforms

- **Web Application**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Mobile Responsive**: iOS 14+, Android 10+
- **Backend**: Deno Deploy (serverless functions)
- **Database**: Base44 managed database with real-time subscriptions

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.2, TypeScript/JavaScript |
| UI Framework | Tailwind CSS, shadcn/ui components |
| State Management | @tanstack/react-query |
| Routing | React Router v7 |
| Backend Functions | Deno Deploy |
| Database | Base44 BaaS (Postgres-based) |
| Real-time | Base44 WebSocket subscriptions |
| AI Integration | OpenAI, Anthropic, Perplexity, OpenRouter |
| Video | Daily.co API |
| Payments | Stripe |

---

## Getting Started

### Prerequisites

**For End Users:**
- Modern web browser with JavaScript enabled
- Active subscription (trial or paid)
- Email address for account creation

**For Developers:**
- Node.js 18+ and npm/yarn
- Git
- Base44 CLI (installed via npm)
- Code editor (VS Code recommended)

### Installation (Development)

```bash
# Clone the repository
git clone <repository-url>
cd intinc-learning-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Base44 app credentials

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Environment Variables

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_API_URL=https://api.base44.com
```

### First-Run Checklist

- [ ] Create account or sign in
- [ ] Subscribe to a plan (trial available)
- [ ] Complete onboarding wizard
- [ ] Explore sample courses
- [ ] Join community forum
- [ ] Configure profile settings

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Web App     │  │   Mobile     │  │   Offline    │     │
│  │  (React)     │  │  Responsive  │  │    PWA       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Base44)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication │ Rate Limiting │ Request Routing    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Entities    │  │   Functions   │  │ Integrations  │
│   (CRUD)      │  │   (Deno)      │  │   (AI APIs)   │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ - Courses     │  │ - AI Content  │  │ - OpenAI      │
│ - Users       │  │ - Analytics   │  │ - Anthropic   │
│ - Enrollments │  │ - Video       │  │ - Stripe      │
│ - Badges      │  │ - Webhooks    │  │ - Daily.co    │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                  ┌───────────────┐
                  │   Database    │
                  │  (Postgres)   │
                  └───────────────┘
```

### Component Architecture

```
src/
├── pages/              # Top-level routes
│   ├── Dashboard.jsx
│   ├── AdvancedAITutor.jsx
│   ├── CourseCreator.jsx
│   ├── CommunityForum.jsx
│   └── GamificationHub.jsx
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── learning/      # Learning-specific components
│   ├── creator/       # Course creation tools
│   ├── gamification/  # Badges, leaderboards, points
│   ├── community/     # Forum, discussions
│   └── common/        # Shared components
├── functions/         # Backend Deno functions
├── entities/          # Database schema definitions
└── Layout.jsx        # App shell and navigation
```

### Data Flow

1. **User Authentication**: Base44 handles OAuth, JWT tokens, session management
2. **Entity Operations**: React Query caches and manages CRUD operations
3. **Real-time Updates**: WebSocket subscriptions for live data (e.g., forum posts)
4. **AI Processing**: Backend functions invoke AI APIs and return structured responses
5. **File Uploads**: Direct to Base44 storage with signed URLs

---

## User Guides

### For Students

#### Enrolling in a Course

1. Navigate to **Course Discovery** or **Dashboard**
2. Browse recommended courses based on your profile
3. Click **View Details** on any course
4. Review syllabus, duration, and difficulty
5. Click **Enroll Now**
6. Track progress in **My Courses**

#### Using the AI Tutor

1. Go to **AI Tutor** from the main navigation
2. **Recommendations Tab**: View personalized course suggestions with detailed explanations
3. **AI Chat Tab**: Ask questions about course content
4. **Learning Path Tab**: See your adaptive learning journey
5. **Study Plans Tab**: Generate weekly study schedules
6. **Code Review Tab**: Submit code for AI feedback

#### Earning Badges and Points

- **Course Completion**: 100 points per course + completion badge
- **High Scores**: 50 points for 90%+ quiz scores
- **Community Engagement**: 10 points per helpful post, 25 per accepted answer
- **Streaks**: Bonus points for consecutive days of learning

View achievements in **Gamification Hub** → **Achievements** tab.

### For Instructors

#### Creating a Course with AI

1. Navigate to **Create Course**
2. Choose **AI-Powered Creation**
3. Provide:
   - Course title and description
   - Target audience and difficulty
   - Learning objectives
   - Preferred content format
4. Click **Generate Course**
5. Review AI-generated:
   - Syllabus
   - Lesson plans
   - Quizzes and assessments
   - Practice problems
6. Edit, refine, and publish

#### Analyzing Student Performance

1. Go to **Instructor Tools** → **Analytics**
2. View dashboards for:
   - Enrollment trends
   - Completion rates
   - Quiz performance
   - At-risk students
3. Use **AI Insights** for personalized recommendations
4. Export reports as PDF or CSV

### For Enterprise Admins

#### Onboarding a Client Organization

1. **B2B Client Dashboard** → **New Organization**
2. Enter organization details (name, industry, size)
3. AI generates:
   - Skills assessment
   - Recommended training plan (3 phases)
   - Implementation timeline
4. Review and customize plan
5. Invite employees via CSV upload or HR integration

#### Tracking ROI and Benchmarks

- **Organization Analytics**: Compare literacy scores against industry benchmarks
- **Department Breakdown**: View skill gaps by department
- **Trend Analysis**: Track improvement over time
- **ROI Calculator**: Estimate productivity gains and cost savings

---

## Developer Documentation

### Project Structure

```
/
├── src/
│   ├── api/
│   │   └── base44Client.js       # Pre-configured SDK instance
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives
│   │   ├── learning/             # Learning components
│   │   ├── creator/              # Course creation
│   │   ├── gamification/         # Points, badges, leaderboards
│   │   └── community/            # Forum, discussions
│   ├── pages/                    # Route components
│   ├── entities/                 # JSON schemas
│   ├── functions/                # Backend functions (Deno)
│   ├── Layout.jsx                # App shell
│   ├── globals.css               # Global styles
│   └── utils.js                  # Utility functions
├── public/                       # Static assets
├── package.json
└── vite.config.js
```

### Adding a New Entity

1. Create JSON schema in `entities/`:

```json
// entities/Certificate.json
{
  "name": "Certificate",
  "type": "object",
  "properties": {
    "student_email": { "type": "string" },
    "course_id": { "type": "string" },
    "issue_date": { "type": "string", "format": "date-time" },
    "certificate_url": { "type": "string" },
    "credential_id": { "type": "string" }
  },
  "required": ["student_email", "course_id"],
  "rls": {
    "create": true,
    "read": { "student_email": "{{user.email}}" },
    "update": false
  }
}
```

2. Use in components:

```jsx
import { base44 } from '@/api/base44Client';

// Create
await base44.entities.Certificate.create({
  student_email: user.email,
  course_id: 'course_123',
  issue_date: new Date().toISOString()
});

// Read
const certs = await base44.entities.Certificate.filter({
  student_email: user.email
});

// Real-time subscription
useEffect(() => {
  const unsubscribe = base44.entities.Certificate.subscribe((event) => {
    if (event.type === 'create') {
      console.log('New certificate:', event.data);
    }
  });
  return unsubscribe;
}, []);
```

### Creating a Backend Function

1. Create function file:

```javascript
// functions/generateCertificate.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    
    // Generate certificate using AI or template
    const certificateData = {
      student_email: user.email,
      course_id: courseId,
      issue_date: new Date().toISOString(),
      credential_id: crypto.randomUUID()
    };
    
    const certificate = await base44.asServiceRole.entities.Certificate.create(
      certificateData
    );
    
    return Response.json({ success: true, certificate });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

2. Invoke from frontend:

```jsx
const handleGenerateCert = async () => {
  const response = await base44.functions.invoke('generateCertificate', {
    courseId: course.id
  });
  console.log('Certificate:', response.data);
};
```

### Styling Guidelines

**Component Styling:**
- Use Tailwind CSS utility classes
- Follow existing color scheme (purple/blue gradient theme)
- Use shadcn/ui components for consistency
- Responsive: mobile-first approach

**Color Palette:**
```css
--primary: #7c3aed (purple-600)
--secondary: #8b5cf6 (purple-500)
--accent-cyan: #00d9ff
--bg-dark: #0f0618
--bg-card: #1a0a2e
```

**Typography:**
- Font: Inter (Google Fonts)
- Headings: font-bold, gradient text for emphasis
- Body: text-gray-400 on dark backgrounds

### State Management Patterns

**React Query for Server State:**

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data: courses, isLoading } = useQuery({
  queryKey: ['courses', userId],
  queryFn: () => base44.entities.Course.filter({ created_by: userId })
});

// Mutate data
const queryClient = useQueryClient();
const createCourseMutation = useMutation({
  mutationFn: (courseData) => base44.entities.Course.create(courseData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  }
});
```

**Local State:**
- Use `useState` for component-level state
- Use `useReducer` for complex state logic
- Avoid prop drilling: use React Context sparingly

---

## API Reference

### Entity Schemas

#### Course Entity

```typescript
interface Course {
  id: string;                    // Auto-generated
  created_by: string;            // Creator email
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  category: string;
  syllabus: object;              // Structured course outline
  lessons: Lesson[];
  quizzes: Quiz[];
  status: 'draft' | 'published' | 'archived';
  enrollments_count: number;
  rating_avg: number;
  created_date: string;          // ISO 8601
  updated_date: string;
}
```

#### Enrollment Entity

```typescript
interface Enrollment {
  id: string;
  student_email: string;
  course_id: string;
  enrollment_date: string;
  progress_percentage: number;   // 0-100
  completed_lessons: string[];   // Lesson IDs
  quiz_scores: QuizScore[];
  status: 'active' | 'completed' | 'dropped';
  completion_date?: string;
}
```

#### Badge Entity

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  badge_type: 'course_completion' | 'high_score' | 'community' | 'streak';
  criteria: object;              // Achievement requirements
  points_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### Backend Functions

#### AI Content Generation

**Function:** `generateSyllabus`

```typescript
// Request
{
  courseTitle: string;
  description: string;
  targetAudience: string;
  duration: number;              // weeks
  learningObjectives: string[];
}

// Response
{
  syllabus: {
    modules: Module[];
    totalLessons: number;
    estimatedHours: number;
  }
}
```

**Function:** `generatePersonalizedRecommendations`

```typescript
// Request
{
  userEmail: string;
  skillsPathway?: SkillsPathway;
  employeeProfile?: EmployeeProfile;
}

// Response
{
  recommendations: CourseRecommendation[];
}

interface CourseRecommendation {
  courseTitle: string;
  matchScore: number;            // 0-100
  reason: string;                // Why recommended
  alignment: string;             // Career goal alignment
  impact: string;                // Expected impact
  duration: string;
  difficulty: string;
  category: string;
}
```

### Real-time Subscriptions

```javascript
// Subscribe to entity changes
const unsubscribe = base44.entities.ForumPost.subscribe((event) => {
  console.log('Event:', event.type);  // 'create', 'update', 'delete'
  console.log('Data:', event.data);
  console.log('Entity ID:', event.id);
});

// Cleanup
return () => unsubscribe();
```

---

## Deployment & Operations

### Deployment Process

**Base44 Automatic Deployment:**
1. Push code to Git repository
2. Base44 detects changes
3. Runs build: `npm run build`
4. Deploys to CDN
5. Functions deploy to Deno Deploy

**Manual Deployment:**

```bash
# Build production bundle
npm run build

# Deploy via Base44 CLI
base44 deploy
```

### Environment Configuration

**Production Secrets:**
- Set via Base44 Dashboard → Settings → Environment Variables
- Never commit secrets to Git
- Use different secrets for dev/staging/prod

**Required Secrets:**
- `OPENAI_API_KEY`: OpenAI API access
- `ANTHROPIC_API_KEY`: Claude API access
- `STRIPE_SECRET_KEY`: Payment processing
- `DAILY_API_KEY`: Video conferencing

### Monitoring

**Logs:**
- Function logs: Base44 Dashboard → Functions → [Function Name] → Logs
- Real-time logs: Use `base44 logs --tail`

**Metrics to Track:**
- API response times
- Function error rates
- Database query performance
- User session duration
- Course completion rates

**Alerts:**
Set up alerts for:
- Function error rate > 5%
- API response time > 2s
- Database connection failures
- Payment webhook failures

### Backup & Recovery

**Database Backups:**
- Automatic daily backups (Base44 managed)
- Point-in-time recovery available
- Retention: 30 days

**Recovery Procedure:**
1. Contact Base44 support
2. Provide timestamp for recovery
3. Verify data integrity after restore

### Rollback Procedure

```bash
# List recent deployments
base44 deployments list

# Rollback to previous deployment
base44 deployments rollback <deployment-id>
```

---

## Security & Compliance

### Authentication Flow

1. User clicks "Sign In"
2. Redirected to Base44 auth page
3. User enters credentials or OAuth (Google, etc.)
4. Base44 validates and creates JWT
5. User redirected to app with auth cookie
6. Frontend accesses user via `base44.auth.me()`

### Authorization

**Row-Level Security (RLS):**
```json
{
  "rls": {
    "create": true,
    "read": { "student_email": "{{user.email}}" },
    "update": { "student_email": "{{user.email}}" },
    "delete": false
  }
}
```

**Admin-Only Functions:**
```javascript
const user = await base44.auth.me();
if (user?.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Data Privacy

- **GDPR Compliance**: User data export, deletion on request
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **PII Handling**: Minimal collection, never sold to third parties
- **Data Retention**: 90 days after account deletion

### OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| Injection | Parameterized queries (Base44 SDK) |
| Broken Auth | JWT tokens, HTTP-only cookies |
| Sensitive Data Exposure | Encrypted at rest and in transit |
| XXE | JSON-only APIs, no XML parsing |
| Broken Access Control | RLS policies on all entities |
| Security Misconfiguration | Secure defaults, regular updates |
| XSS | React auto-escaping, CSP headers |
| Insecure Deserialization | JSON.parse with validation |
| Known Vulnerabilities | Dependabot alerts, regular audits |
| Insufficient Logging | Centralized logging, audit trails |

### Secrets Management

- Store in Base44 Dashboard → Settings → Environment Variables
- Never log or expose secrets
- Rotate regularly (quarterly minimum)
- Use different secrets per environment

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- CourseCreator.test.jsx
```

### Test Coverage Requirements

- **Functions**: 80% minimum coverage
- **Components**: 70% minimum coverage
- **Critical paths**: 100% coverage (auth, payments, data mutations)

### Testing Patterns

**Component Tests:**
```jsx
import { render, screen } from '@testing-library/react';
import CourseCard from '@/components/CourseCard';

test('displays course title and description', () => {
  const course = {
    title: 'React Fundamentals',
    description: 'Learn React basics'
  };
  
  render(<CourseCard course={course} />);
  
  expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
  expect(screen.getByText('Learn React basics')).toBeInTheDocument();
});
```

**Function Tests:**
```javascript
import { test } from 'npm:@deno/std/testing/bdd.ts';
import { assertEquals } from 'npm:@deno/std/testing/asserts.ts';

test('generateSyllabus returns valid structure', async () => {
  const response = await fetch('http://localhost:8000/generateSyllabus', {
    method: 'POST',
    body: JSON.stringify({ courseTitle: 'Test Course' })
  });
  
  const data = await response.json();
  assertEquals(data.syllabus.modules.length > 0, true);
});
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Test and Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
```

---

## Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Login fails** | Redirect loop, "Unauthorized" | Clear cookies, check Base44 app settings |
| **Function timeout** | 504 errors on AI calls | Increase timeout, optimize prompts |
| **Real-time not working** | Subscriptions not firing | Check WebSocket connection, verify RLS policies |
| **Slow query performance** | Dashboard loads slowly | Add database indexes, implement pagination |
| **Payment webhook failures** | Subscriptions not updating | Verify Stripe webhook secret, check logs |

### Debugging Functions

1. **Check Logs:**
   ```bash
   base44 logs --function=generateSyllabus --tail
   ```

2. **Test Locally:**
   ```bash
   deno run --allow-net --allow-env functions/generateSyllabus.js
   ```

3. **Use Test Tool:**
   ```bash
   base44 functions test generateSyllabus --payload='{"courseTitle":"Test"}'
   ```

### Performance Optimization

**Frontend:**
- Use React.memo for expensive components
- Lazy load routes: `React.lazy(() => import('./Page'))`
- Optimize images: WebP format, responsive sizes
- Cache API responses with React Query

**Backend:**
- Batch database queries
- Use indexes on frequently queried fields
- Cache AI responses when appropriate
- Implement request debouncing

### Support Channels

- **Technical Issues**: support@intinc.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: Product feedback form
- **Security Vulnerabilities**: security@intinc.com (PGP key available)

---

## Changelog

### Version 1.0.0 (January 2026)

**Features:**
- ✨ AI-powered course creation with multi-domain customization
- ✨ Advanced AI Tutor with personalized recommendations
- ✨ Gamification hub with badges, leaderboards, and points
- ✨ Community forum with AI moderation
- ✨ B2B client analytics and benchmarking
- ✨ Live video sessions with screen sharing
- ✨ Offline course downloads (PWA)
- ✨ Stripe subscription management

**Improvements:**
- ⚡ 40% faster dashboard load times
- ⚡ Real-time subscriptions for instant updates
- ⚡ Mobile-responsive design across all pages

**Bug Fixes:**
- 🐛 Fixed enrollment tracking race condition
- 🐛 Resolved quiz score calculation errors
- 🐛 Corrected badge award timing issues

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Base44** | Backend-as-a-Service platform providing auth, database, and serverless functions |
| **Entity** | Database table schema defined in JSON |
| **RLS** | Row-Level Security: database access control policies |
| **Function** | Serverless backend function running on Deno Deploy |
| **Integration** | Pre-built API connection (e.g., OpenAI, Stripe) |
| **shadcn/ui** | Reusable component library built on Radix UI |
| **React Query** | Data fetching and caching library |

### Appendix B: Code Style Guide

**JavaScript/React:**
```javascript
// Use functional components with hooks
export default function CourseCard({ course }) {
  const [loading, setLoading] = useState(false);
  
  // Event handlers: handleX pattern
  const handleEnroll = async () => {
    setLoading(true);
    await enrollInCourse(course.id);
    setLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleEnroll} disabled={loading}>
          Enroll
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Naming Conventions:**
- Components: PascalCase (`CourseCard.jsx`)
- Functions: camelCase (`generateSyllabus.js`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- CSS classes: kebab-case (Tailwind handles this)

**File Organization:**
```
components/
  ├── feature/              # Feature-specific components
  │   ├── FeatureCard.jsx
  │   └── FeatureList.jsx
  └── ui/                   # Generic UI components
      ├── button.jsx
      └── card.jsx
```

### Appendix C: Database Schema Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │   Course    │         │ Enrollment  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id          │         │ id          │         │ id          │
│ email       │◄────────│ created_by  │         │ student_id  │─┐
│ full_name   │         │ title       │◄────────│ course_id   │ │
│ role        │         │ description │         │ progress    │ │
└─────────────┘         │ difficulty  │         │ status      │ │
                        │ category    │         └─────────────┘ │
                        └─────────────┘                         │
                              │                                 │
                              │                                 │
                              ▼                                 │
                        ┌─────────────┐                         │
                        │    Badge    │         ┌──────────────┘
                        ├─────────────┤         │
                        │ id          │         │
                        │ name        │         ▼
                        │ type        │   ┌─────────────┐
                        │ criteria    │   │  UserBadge  │
                        └─────────────┘   ├─────────────┤
                                          │ user_id     │
                                          │ badge_id    │
                                          │ earned_date │
                                          └─────────────┘
```

### Appendix D: External Resources

- [Base44 Documentation](https://docs.base44.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Deno Manual](https://deno.land/manual)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

**End of Documentation**

For questions or contributions, contact: dev-team@intinc.com