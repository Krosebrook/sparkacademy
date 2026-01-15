import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code, Rocket, Users, Shield, Zap, BookOpen, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Project Documentation Component
 * Comprehensive documentation for the AI-powered educational platform
 */
export default function ProjectDocumentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 gradient-text">Project Documentation</h1>
          <p className="text-lg text-gray-300">Complete guide to the FlashFusion AI Educational Platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a0a2e] border border-[#00d9ff]/20 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="contributing">Contributing</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-3">🚀 FlashFusion AI Educational Platform</h3>
                  <p className="mb-4">
                    A cutting-edge SaaS platform that leverages Large Language Models (LLMs) to revolutionize online education. 
                    Course creators can generate high-quality content 10x faster, while students receive personalized AI tutoring and learning paths.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-magenta-300 mb-3">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0f0618]/50 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">For Course Creators</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• AI-powered course generation with Chain-of-Thought reasoning</li>
                        <li>• Automated lesson drafting and quiz creation</li>
                        <li>• Interactive element suggestions</li>
                        <li>• Multi-industry scenario generation</li>
                        <li>• Study materials auto-generation (flashcards, guides)</li>
                        <li>• Completion analytics with drop-off identification</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[#0f0618]/50 rounded-lg border border-magenta-500/20">
                      <h4 className="font-semibold text-magenta-400 mb-2">For Students</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• AI tutor with ReAct framework and RAG</li>
                        <li>• Personalized learning paths</li>
                        <li>• Knowledge assessment quiz</li>
                        <li>• Progress tracking with streaks and gamification</li>
                        <li>• Study material generation on-demand</li>
                        <li>• Career guidance and skill gap analysis</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-orange-300 mb-3">🛠️ Tech Stack</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <h4 className="font-semibold text-blue-300 text-sm mb-2">Frontend</h4>
                      <ul className="text-xs space-y-1 text-gray-400">
                        <li>• React 18 + Hooks</li>
                        <li>• TailwindCSS</li>
                        <li>• shadcn/ui components</li>
                        <li>• Framer Motion</li>
                        <li>• React Router</li>
                        <li>• TanStack Query</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                      <h4 className="font-semibold text-purple-300 text-sm mb-2">Backend</h4>
                      <ul className="text-xs space-y-1 text-gray-400">
                        <li>• Base44 Platform (BaaS)</li>
                        <li>• Deno Deploy Functions</li>
                        <li>• OpenAI GPT-4o</li>
                        <li>• LangChain</li>
                        <li>• PostgreSQL</li>
                        <li>• OAuth 2.0</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <h4 className="font-semibold text-green-300 text-sm mb-2">Integrations</h4>
                      <ul className="text-xs space-y-1 text-gray-400">
                        <li>• Stripe (payments)</li>
                        <li>• Google Workspace</li>
                        <li>• Notion</li>
                        <li>• Slack</li>
                        <li>• Salesforce</li>
                        <li>• HubSpot</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">⚠️ Prerequisites</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Node.js 18+ or Deno 1.40+</li>
                    <li>• Base44 account (free tier available)</li>
                    <li>• OpenAI API key</li>
                    <li>• Stripe account (for payments)</li>
                    <li>• Git and npm/yarn</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-green-400" />
                  Setup Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">1. Clone Repository</h3>
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-cyan-500/20">
{`git clone https://github.com/yourusername/flashfusion-platform.git
cd flashfusion-platform
npm install`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">2. Environment Variables</h3>
                  <p className="text-sm text-gray-400 mb-2">Create a <code className="bg-black/50 px-2 py-1 rounded">.env</code> file:</p>
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-cyan-500/20">
{`# Base44
BASE44_APP_ID=your_app_id

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: External Services
HUBSPOT_API_KEY=...
NOTION_API_KEY=...`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">3. Database Setup</h3>
                  <p className="text-sm text-gray-400 mb-3">Base44 automatically handles database schema. Entities are defined in <code className="bg-black/50 px-2 py-1 rounded">entities/</code> folder.</p>
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-cyan-500/20">
{`# No manual database setup required
# Base44 manages PostgreSQL automatically`}
                  </pre>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">4. Run Development Server</h3>
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-cyan-500/20">
{`npm run dev
# App runs on http://localhost:3000`}
                  </pre>
                </section>

                <section className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">✅ Verification Steps</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>1. Navigate to <code className="bg-black/50 px-2 py-1 rounded">http://localhost:3000</code></li>
                    <li>2. Create a test account</li>
                    <li>3. Generate a test course using AI</li>
                    <li>4. Verify Stripe webhook setup</li>
                    <li>5. Test OAuth connections (Google, Notion)</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-purple-400" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Architecture Overview</h3>
                  <div className="bg-black/50 p-6 rounded-lg border border-cyan-500/20">
                    <pre className="text-xs text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (React)                     │
│  Pages → Components → Utils → Base44 SDK → API Client          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Base44 Platform (BaaS)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Service │  │ Entity CRUD  │  │ File Storage │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Functions    │  │ Integrations │  │ OAuth Mgmt   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  OpenAI GPT-4o │ Stripe │ Google APIs │ Notion │ Slack         │
└─────────────────────────────────────────────────────────────────┘`}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-magenta-300 mb-3">Key Design Patterns</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0f0618]/50 rounded-lg border border-magenta-500/20">
                      <h4 className="font-semibold text-magenta-400 mb-1">Chain-of-Thought Prompting</h4>
                      <p className="text-sm text-gray-400">Used for course generation - breaks down complex content creation into logical reasoning steps</p>
                    </div>
                    <div className="p-3 bg-[#0f0618]/50 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-1">ReAct Framework</h4>
                      <p className="text-sm text-gray-400">Powers AI tutoring - iterative reasoning and action loops for student support</p>
                    </div>
                    <div className="p-3 bg-[#0f0618]/50 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-1">RAG (Retrieval-Augmented Generation)</h4>
                      <p className="text-sm text-gray-400">Grounds LLM responses in course materials using vector search</p>
                    </div>
                    <div className="p-3 bg-[#0f0618]/50 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-1">Prompt Chaining</h4>
                      <p className="text-sm text-gray-400">Multi-stage workflows for enterprise reporting and complex analytics</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Folder Structure</h3>
                  <pre className="bg-black/50 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto border border-cyan-500/20">
{`flashfusion-platform/
├── entities/              # Database schemas (JSON)
│   ├── Course.json
│   ├── Enrollment.json
│   └── StudentLearningPath.json
├── pages/                 # Main routes (FLAT - no subfolders)
│   ├── Dashboard.jsx
│   ├── CourseCreator.jsx
│   └── AITutor.jsx
├── components/            # Reusable components (CAN have subfolders)
│   ├── ui/               # shadcn components
│   ├── course-creator/   # Course creation tools
│   ├── learning/         # Student learning features
│   └── analytics/        # Analytics widgets
├── functions/            # Backend serverless functions
│   ├── stripeWebhook.js
│   └── generateRecommendations.js
├── agents/               # AI agent configs (JSON)
│   └── courseAssistant.json
├── Layout.jsx            # App layout wrapper
└── globals.css           # Global styles`}
                  </pre>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Feature Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    category: "AI Content Generation",
                    features: [
                      "Course outline generation with Chain-of-Thought",
                      "Lesson drafting with examples and analogies",
                      "Quiz and assessment auto-generation",
                      "Interactive element suggestions (polls, simulations)",
                      "Multi-industry scenario generation",
                      "Study materials (flashcards, guides) creation"
                    ]
                  },
                  {
                    category: "Student Learning Experience",
                    features: [
                      "AI tutor with ReAct + RAG framework",
                      "Personalized learning paths",
                      "Knowledge assessment quiz",
                      "Progress tracking with streaks",
                      "Career path analysis",
                      "Study material on-demand generation"
                    ]
                  },
                  {
                    category: "Creator Analytics",
                    features: [
                      "Course completion rate analysis",
                      "Drop-off point identification",
                      "AI-powered improvement suggestions",
                      "Student engagement metrics",
                      "Feedback sentiment analysis",
                      "Content performance benchmarking"
                    ]
                  },
                  {
                    category: "Integrations",
                    features: [
                      "Stripe payment processing",
                      "Google Workspace sync (Calendar, Drive, Sheets, Slides)",
                      "Notion database sync",
                      "Slack notifications",
                      "Salesforce CRM integration",
                      "HubSpot marketing automation"
                    ]
                  }
                ].map((section, idx) => (
                  <div key={idx} className="p-4 bg-[#0f0618]/50 rounded-lg border border-cyan-500/20">
                    <h3 className="font-semibold text-cyan-300 mb-3">{section.category}</h3>
                    <ul className="space-y-1">
                      {section.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-gray-400">
                  The platform uses Base44 SDK for all API interactions. Below are key endpoints and usage patterns.
                </p>

                <section>
                  <h3 className="font-semibold text-cyan-300 mb-2">Entity Operations</h3>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs overflow-x-auto border border-cyan-500/20">
{`import { base44 } from "@/api/base44Client";

// List entities
const courses = await base44.entities.Course.list();

// Filter
const activeCourses = await base44.entities.Course.filter({ 
  is_published: true 
});

// Create
const newCourse = await base44.entities.Course.create({
  title: "My Course",
  description: "..."
});

// Update
await base44.entities.Course.update(courseId, { title: "Updated" });

// Delete
await base44.entities.Course.delete(courseId);`}
                  </pre>
                </section>

                <section>
                  <h3 className="font-semibold text-magenta-300 mb-2">LLM Integration</h3>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs overflow-x-auto border border-magenta-500/20">
{`// Call OpenAI via Base44 integration
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Generate a course outline for...",
  response_json_schema: {
    type: "object",
    properties: {
      lessons: { type: "array" }
    }
  }
});`}
                  </pre>
                </section>

                <section>
                  <h3 className="font-semibold text-green-300 mb-2">Backend Functions</h3>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs overflow-x-auto border border-green-500/20">
{`// Invoke backend function
const response = await base44.functions.invoke('functionName', {
  param1: "value"
});`}
                  </pre>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-orange-400" />
                  Deployment Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Production Deployment</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <h4 className="font-semibold text-blue-300 mb-2">1. Build</h4>
                      <pre className="bg-black/50 p-2 rounded text-xs">npm run build</pre>
                    </div>
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                      <h4 className="font-semibold text-purple-300 mb-2">2. Environment</h4>
                      <p className="text-xs text-gray-400">Set production environment variables in Base44 dashboard</p>
                    </div>
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <h4 className="font-semibold text-green-300 mb-2">3. Deploy</h4>
                      <pre className="bg-black/50 p-2 rounded text-xs">base44 deploy --production</pre>
                    </div>
                  </div>
                </section>

                <section className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Pre-Deployment Checklist</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>☐ All secrets configured in production</li>
                    <li>☐ Stripe webhooks pointing to production URL</li>
                    <li>☐ OAuth redirect URIs updated</li>
                    <li>☐ Database migrations applied</li>
                    <li>☐ Error tracking service configured</li>
                    <li>☐ Rate limiting enabled</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributing">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-400" />
                  Contributing Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <section>
                  <h3 className="font-semibold text-cyan-300 mb-2">Code Style</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Use ES6+ features (arrow functions, destructuring, etc.)</li>
                    <li>• Follow React Hooks patterns</li>
                    <li>• Use TailwindCSS for styling (no inline styles)</li>
                    <li>• Add JSDoc comments for functions</li>
                    <li>• Keep components under 300 lines</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-magenta-300 mb-2">Branching Strategy</h3>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs border border-magenta-500/20">
{`main        → Production branch
develop     → Development branch
feature/*   → New features
bugfix/*    → Bug fixes
hotfix/*    → Emergency fixes`}
                  </pre>
                </section>

                <section>
                  <h3 className="font-semibold text-orange-300 mb-2">Pull Request Process</h3>
                  <ol className="space-y-1 ml-4">
                    <li>1. Create feature branch from <code className="bg-black/50 px-2 py-0.5 rounded">develop</code></li>
                    <li>2. Make changes and commit with clear messages</li>
                    <li>3. Add tests for new features</li>
                    <li>4. Update documentation if needed</li>
                    <li>5. Submit PR with description of changes</li>
                    <li>6. Wait for code review and CI checks</li>
                  </ol>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-400" />
                  Testing Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="font-semibold text-cyan-300 mb-2">Test Coverage Goals</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30 text-center">
                      <div className="text-3xl font-bold text-green-400">90%+</div>
                      <div className="text-xs text-gray-400">Unit Tests</div>
                    </div>
                    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30 text-center">
                      <div className="text-3xl font-bold text-blue-400">80%+</div>
                      <div className="text-xs text-gray-400">Integration</div>
                    </div>
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 text-center">
                      <div className="text-3xl font-bold text-purple-400">100%</div>
                      <div className="text-xs text-gray-400">E2E Critical Paths</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-magenta-300 mb-2">Running Tests</h3>
                  <pre className="bg-black/50 p-3 rounded-lg text-xs text-gray-300 border border-magenta-500/20">
{`# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests
npm run test:e2e`}
                  </pre>
                </section>

                <section className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Testing Best Practices</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Test user behavior, not implementation details</li>
                    <li>• Mock external API calls</li>
                    <li>• Use data-testid for element selection</li>
                    <li>• Write descriptive test names</li>
                    <li>• Keep tests independent and isolated</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}