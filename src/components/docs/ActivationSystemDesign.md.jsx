# Post-Onboarding Activation System

## 1. Activation Goals (Non-Negotiable)

Users reach **First Moment of Value (FMV)** within 7–14 days through one of three pathways:

### Milestone A: Deal Discovery & Engagement
- **First Relevant Deal Viewed** - User browses personalized deal recommendations
- **First Deal Saved** - User flags or saves a deal matching criteria
- **Impact** - User understands deal matching logic ("why this deal matches you")

### Milestone B: Portfolio Configuration
- **First Portfolio Goal Set** - User defines time horizon, return targets, or asset focus
- **Benchmark Comparison** - User sees projected outcome or peer benchmarks
- **Impact** - User understands how deals map to their strategic goals

### Milestone C: Community Connection
- **First Community Joined/Followed** - User follows experts or joins discussion group
- **Observer Participation** - User views high-value discussions without pressure to post
- **Impact** - User feels part of a peer network with valuable insights

**Success Condition:** User achieves at least ONE core milestone within first session, not all three immediately.

---

## 2. Adaptive Activation Paths

### Path A: Deal-First Users
**Trigger Signals:**
- Strong deal sourcing criteria (target industries, deal structures, geography)
- Aggressive or moderate risk tolerance
- 5+ years of investment experience
- Skipped portfolio goals during onboarding

**Guidance Sequence:**
1. Welcome to personalized deal discovery
2. Browse 3–5 deals with match-score explanations
3. Tooltip: "Save deals to train your recommendations"
4. Achievement: "Your watchlist is growing"

**Nudges:**
- "You've browsed 3 deals. Save one to improve matches"
- "Why these deals? See your match criteria"
- "New deals matching your criteria arrived"

**Deferred Prompts:**
- Portfolio goals only when viewing analytics

---

### Path B: Portfolio-First Users
**Trigger Signals:**
- Emphasis on long-term horizon (3+ years)
- High target return expectations (10%+)
- High diversification preference
- Skipped deal sourcing during onboarding

**Guidance Sequence:**
1. Welcome—complete portfolio framework
2. Set time horizon → target return → asset classes
3. See projected portfolio outcome (visual benchmark)
4. Achievement: "Your investment strategy is live"

**Nudges:**
- "Setting goals unlocks AI-powered insights"
- "View how deals fit your portfolio targets"
- "Your projected return vs. peers: [comparison]"

**Deferred Prompts:**
- Community invitation when viewing peer analytics

---

### Path C: Community-First Users
**Trigger Signals:**
- Emphasis on knowledge sharing or networking
- < 3 years of investment experience (novice)
- Interest in peer groups during onboarding
- Skipped deal sourcing & portfolio setup

**Guidance Sequence:**
1. Welcome—explore your niche community
2. Browse 1–2 relevant communities (curated, no pressure)
3. Follow 1–2 experts or investors (lightweight)
4. Achievement: "You're connected"

**Nudges:**
- "Join investors like you—no pressure to post"
- "Expert insights on [your interest]"
- "Discussion: [relevant topic]"

**Deferred Prompts:**
- Deal sourcing when browsing community recommendations
- Portfolio setup for advanced analytics

---

## 3. Lightweight Interactive Guidance Rules

### Non-Blocking Elements
✅ Inline highlights (subtle borders, icons)  
✅ Contextual tooltips on key features  
✅ "Try this next" cards in sidebar  
✅ Progress checkmarks (saved deals, goals set, communities joined)  
✅ Subtle badge rewards (e.g., "watchlist started")

❌ Modal dialogs (unless critical flow)  
❌ Forced page redirects  
❌ Overlays blocking core features  
❌ Persistent nagging

### Dismissal & Resumption
- Every guidance element can be dismissed with single click
- Resume only when contextually relevant
  - E.g., show "portfolio setup" nudge only when user views analytics
  - E.g., show "save deals" nudge only after browsing 3 deals
- Track dismissals to avoid repeat fatigue

### Visual Design
- Soft colors (grays, purples)
- Single-line copy (max 60 chars per line)
- Single action per element
- No jargon

---

## 4. Smart Nudges & Timing Logic

### Nudge Categories

#### A. Inactivity Detection
**Trigger:** 2+ days without login  
**Message:** "Welcome back! We found 5 new deals matching your criteria."  
**Surface:** Banner  
**Cooldown:** 24 hours  
**Priority:** High

#### B. Milestone Encouragement
**Trigger:** Path-specific (viewed 3 deals without saving, etc.)  
**Message:** "Save deals to train our AI and improve future matches"  
**Surface:** Side panel  
**Cooldown:** 12 hours  
**Priority:** Medium

#### C. Feature Discovery
**Trigger:** User visits feature page without completing setup (e.g., analytics without portfolio goals)  
**Message:** "Setting portfolio goals unlocks AI insights specific to your strategy"  
**Surface:** Modal (only on feature first-visit)  
**Cooldown:** 24 hours  
**Priority:** High

#### D. Community Prompts
**Trigger:** Community path OR viewed 5+ deals without exploring community  
**Message:** "Learn from experienced investors in your niche"  
**Surface:** Side panel  
**Cooldown:** 12 hours  
**Priority:** Medium

#### E. Behavior Pattern Insight
**Trigger:** Repeated action without outcome (e.g., browsing deals 3+ sessions without saving)  
**Message:** "You're browsing deals—let's save your favorites to improve recommendations"  
**Surface:** Sidebar toast  
**Cooldown:** 48 hours  
**Priority:** Low

### Cooldown Logic
- Track last shown date per nudge ID
- Never show same nudge within cooldown window
- Max 2 nudges per session (avoid spam)
- Dismiss one = no repeat for 48 hours

---

## 5. Deferred Completion Prompts

For **Quick Start** users or those who skipped onboarding steps:

### Rule: Surface Only When Relevant
❌ Don't ask for portfolio goals on login  
✅ Ask for portfolio goals when user views "Analytics" page

❌ Don't ask for risk profile unprompted  
✅ Ask for risk profile when user saves first deal

### Deferred Prompt Matrix

| User Skipped | Trigger When | Message |
|---|---|---|
| Portfolio Goals | Views analytics | "Complete portfolio setup for personalized insights" |
| Community Prefs | Browses community or views peer analytics | "Tell us your community interests to find your niche" |
| Risk Profile | Saves first deal or views risk dashboard | "Update your risk tolerance for smarter deal matching" |
| Deal Criteria | Views investment analytics | "Refine your sourcing criteria to improve deal matches" |

### Timing
- First prompt: Day 3–5 after signup
- Retry: Day 7, Day 14 (if dismissed)
- Max frequency: 1 per 48 hours

---

## 6. Activation State Tracking (JSON Schema)

```json
{
  "user_email": "investor@example.com",
  "activation_path": "deal_first",
  "activation_status": "in_progress",
  "path_rationale": "Deal-focused investor with strong sourcing criteria. You'll benefit from finding your first deal match.",
  
  "milestones": {
    "first_deal_viewed": true,
    "first_deal_saved": false,
    "first_portfolio_goal_set": false,
    "first_community_joined": false,
    "core_milestone_achieved": true
  },
  
  "milestone_dates": {
    "first_deal_viewed_date": "2026-01-17T10:30:00Z",
    "first_deal_saved_date": null
  },
  
  "active_nudges": [
    {
      "nudge_id": "nudge_save_first_deal",
      "status": "shown",
      "shown_date": "2026-01-17T11:00:00Z"
    }
  ],
  
  "dismissed_nudges": ["nudge_inactivity_prompt"],
  
  "guidance_completion": {
    "deal_browsing_tutorial": true,
    "deal_saving_explained": false
  },
  
  "activity_signals": {
    "days_since_signup": 1,
    "last_activity_date": "2026-01-17T14:30:00Z",
    "inactivity_days": 0,
    "session_count": 3,
    "avg_session_duration_minutes": 12.5,
    "features_explored": ["deal_browser", "deal_detail"]
  },
  
  "deferred_setup": {
    "pending_portfolio_goals": true,
    "pending_community_preferences": false,
    "deferred_prompt_shown_dates": []
  }
}
```

---

## 7. Decision Logic Flow

```
USER SIGNS UP
  ↓
Run determineActivationPath()
  • Analyze onboarding data (deal criteria, portfolio goals, community prefs)
  • Score each path (deal, portfolio, community)
  • Assign winner + rationale
  ↓
CREATE ActivationState record
  • Set activation_path
  • Set activation_status = "not_started"
  ↓
FIRST SESSION
  • Display ActivationGuide (path-specific)
  • Track feature exploration
  • Generate nudges via generateActivationNudges()
  ↓
USER ACHIEVES FIRST MILESTONE
  • Update milestones.core_milestone_achieved = true
  • Update activation_status = "milestone_1_achieved"
  • Display subtle achievement badge
  ↓
IF INACTIVITY DETECTED (2+ days)
  • Generate inactivity nudge
  • Show "Welcome back" guidance
  ↓
IF SECOND MILESTONE REACHED
  • Update activation_status = "milestone_2_achieved"
  • Suggest adjacent features (e.g., portfolio if deal focused)
  ↓
IF ALL THREE MILESTONES OR 14 DAYS ELAPSED
  • Set activation_status = "fully_activated"
  • Graduate to standard user experience
  • Archive guidance elements
```

---

## 8. Component Integration

### In Dashboard/Main App
```jsx
<ActivationGuide 
  feature="deal_browser"
  onMilestoneAchieved={handleMilestoneUpdate}
/>

<ActivationNudge 
  nudge={nudgeObject}
  activationStateId={activationId}
/>
```

### In Feature Pages
- Track `feature` prop to trigger contextual nudges
- Pass `ActivationState` to components for milestone checking
- On milestone achievement, call `updateActivationState()`

---

## 9. Tone & UX Principles

✅ **Encouraging:** "You're on the right track"  
✅ **Intelligent:** "Here's why this matters to you"  
✅ **Helpful:** Suggest next action, don't demand  
✅ **Respectful:** Single-click dismissal, no repeat nagging  
✅ **Novice-Friendly:** Explain jargon; empower without intimidating  
✅ **Non-Patronizing:** Acknowledge experience levels  

---

## 10. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| FMV Achieved (% users with 1+ milestone) | 70%+ | Day 7 / Day 14 |
| Path Accuracy | 85%+ | Activation path matches user behavior |
| Nudge CTR | 15%+ | Clicks on nudge CTA / nudges shown |
| Dismissal Rate | <20% | Dismissals / nudges shown |
| Time to First Milestone | < 2 hours | median from signup |
| Activation Status Progression | 50%+ reach "fully_activated" | by Day 14 |
| Deferred Prompt Conversion | 40%+ | Complete deferred step within 7 days |

---

## 11. Future Enhancements

- **AI-Driven Timing:** Use predictive ML to send nudges at optimal engagement windows
- **A/B Testing:** Test message variants and surface types
- **Segmentation:** Create micro-paths (e.g., "Growth Investor" vs. "Value Investor")
- **Gamification:** Unlock badges/streaks for milestone achievements
- **Peer Comparisons:** Show how user progress compares to cohort
- **Re-engagement:** Trigger automated emails for high-value inactive users