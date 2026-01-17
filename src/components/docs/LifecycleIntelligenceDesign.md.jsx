# Lifecycle Intelligence System

## 1. Lifecycle State Model

Users move through distinct lifecycle stages based on **measurable signals**, not time alone.

### Seven States

#### 1. **New**
**Duration:** Days 1–7  
**Definition:** User signed up, hasn't yet achieved core activation milestone  
**Characteristics:**
- Exploring basic features
- Deciding if platform is relevant
- High churn risk (decisions made early)

**Exit Condition:** Core activation milestone achieved (first deal viewed, goal set, community joined)

**System Goal:** Guide toward first meaningful action

---

#### 2. **Activated**
**Duration:** Days 7–14  
**Definition:** Achieved core milestone but not yet consistent  
**Characteristics:**
- First action completed
- Still building habit
- Moderate churn risk

**Exit Conditions:**
- ≥2 weeks consecutive activity OR
- Move to Power User if capabilities unlock

**System Goal:** Reinforce habit, prevent early cliff

---

#### 3. **Engaged**
**Duration:** Weeks 3+ (ongoing)  
**Definition:** ≥2 weeks active, ≥2 sessions/week, stable or increasing engagement  
**Characteristics:**
- Regular platform usage
- Multiple habit loops active
- Building compounding value
- Good retention signal

**Exit Conditions:**
- Unlock capabilities → Power User
- Engagement drops 40%+ → At-Risk
- No activity 21+ days → Dormant

**System Goal:** Encourage capability exploration, deepen habits

---

#### 4. **Power User**
**Duration:** Ongoing (indefinite)  
**Definition:** ≥1 capability tier unlocked + sustained engagement  
**Characteristics:**
- Advanced feature usage
- High personal investment
- Prime conversion target
- Low churn risk (sunk cost + value)

**Exit Conditions:**
- Engagement drops → At-Risk
- Extended inactivity → Dormant

**System Goal:** Monetize, provide premium tools, reinforce value

---

#### 5. **At-Risk**
**Duration:** Variable (intervention window)  
**Definition:** Active user showing engagement decline ≥40% over 14 days  
**Characteristics:**
- Was Engaged or Power User
- Engagement declining
- Still logging in occasionally
- Last-chance intervention window

**Entry Signals:**
- Sessions 7-day → 14-day drop >40%
- Habit loops becoming inactive
- Nudges ignored

**Exit Conditions:**
- Re-engagement success → back to Engaged
- Continue decline 21+ days → Dormant

**System Goal:** Value reminder, reduce friction, relevance reset

---

#### 6. **Dormant**
**Duration:** Variable (re-engagement window)  
**Definition:** No meaningful activity for 21+ days  
**Characteristics:**
- Was active, now inactive
- May have logged in briefly
- Requires win-back campaign
- Lower conversion probability

**Entry Signals:**
- days_since_last_action ≥ 21

**Exit Condition:**
- Re-entry with activity → Returning

**System Goal:** High-signal summary, optional reactivation, no pressure

---

#### 7. **Returning**
**Duration:** Days 1–7 post-reactivation  
**Definition:** Was Dormant/At-Risk, now showing activity again  
**Characteristics:**
- Reactivated by win-back intervention
- Sensitive to friction
- Needs context restoration
- Good retention signal if sustained

**Exit Conditions:**
- Stabilize at ≥1 session/week → back to Engaged
- Drop again → Dormant (with increased suppression)

**System Goal:** Restore context, resume unfinished actions, celebrate return

---

## 2. State Transition Signals

### Transition Rules

| From | To | Signal | Threshold |
|---|---|---|---|
| New | Activated | Core milestone achieved | First deal/goal/community action |
| Activated | Engaged | Sustained activity | ≥2 consecutive weeks + ≥2 sessions/week |
| Engaged | Power User | Capability unlock | ≥1 tier unlocked + ≥4 sessions/week |
| Engaged | At-Risk | Engagement decline | Sessions drop 40%+ over 14 days |
| At-Risk | Engaged | Re-engagement | ≥2 sessions in 7 days |
| Engaged | Dormant | Extended inactivity | No activity for 21+ days |
| Dormant | Returning | Reactivation signal | Activity after dormancy |
| Returning | Engaged | Sustained return | ≥1 session/week for 2 weeks |

### Auditable & Configurable

Each signal must:
- ✅ Use specific metrics (sessions, actions, days, engagement %)
- ✅ Be queryable from RetentionState, PowerUserState
- ✅ Be overrideable via admin settings
- ✅ Have clear explanation in LifecycleState.state_history

---

## 3. Churn Risk Detection

### Lightweight Churn Risk Score (0–100)

Combines **behavior trends**, not absolute silence.

#### Risk Factors

| Factor | Weight | Points |
|---|---|---|
| Inactivity (21+ days) | 40% | +40 |
| Inactivity (14–20 days) | 25% | +25 |
| Inactivity (7–13 days) | 10% | +10 |
| Engagement decline >50% | 35% | +35 |
| Engagement decline >30% | 20% | +20 |
| Engagement decline >10% | 10% | +10 |
| All habit loops dormant | 15% | +15 |
| Early engagement cliff (<4 weeks) | 15% | +15 |

#### Risk Levels

```
0–29:   Low      → No intervention
30–49:  Moderate → Optional relevance reset
50–69:  High     → Value reminder + reactivation nudge
70–100: Critical → High-signal summary + urgent win-back
```

#### Never Surface "Churn"

❌ Don't show users: "You're at risk of churning"  
❌ Don't use internal language: "churn score," "at-risk user"  
✅ Instead: "We've noticed you haven't checked in—here's what's new"

---

## 4. Intervention Playbooks by State

### Playbook: At-Risk Users

**Goal:** Remind value, reduce friction, avoid overwhelming  

**Intervention 1: Value Reminder**
```
TIMING: Day 3 of engagement decline
HEADLINE: "See what's changed"
MESSAGE: "3 new deals arrived that match your criteria."
ACTION: Link to new deals with match explanations
TONE: Informative, not accusatory
```

**Intervention 2: Relevance Reset**
```
TIMING: Day 7 of decline
HEADLINE: "Your preferences are still here"
MESSAGE: "Refresh your interests and get smarter matches."
ACTION: Quick preferences adjustment UI
TONE: Helpful, optional
```

**Intervention 3: Cognitive Load Reduction**
```
TIMING: If user returns but looks overwhelmed
HEADLINE: "Start simple"
MESSAGE: "Focus on one deal at a time. Everything else is here."
ACTION: Simplified view toggle
TONE: Supportive, permission-giving
```

**Suppression Rules:**
- Max 1 at-risk intervention per 3 days
- Stop after 3 unsuccessful interventions
- Suppress upgrade offers while at-risk

---

### Playbook: Dormant Users

**Goal:** Curiosity win-back, optional reactivation, zero pressure  

**Intervention 1: High-Signal Summary**
```
TIMING: Day 2 after detected dormancy OR user returns
HEADLINE: "What's new (60 seconds)"
MESSAGE: "Top 3 things since you were last here:
  • 5 new deals in your sector
  • Portfolio insights updated
  • Expert posted on strategy"
ACTION: Quick summary modal
TONE: Respectful, time-conscious
```

**Intervention 2: Reactivation Path**
```
TIMING: Day 4 of dormancy (email/push)
HEADLINE: "Welcome back—no pressure"
MESSAGE: "Pick up where you left off. Everything's waiting."
ACTION: "Resume" button → last active section
TONE: Warm, casual, low-friction
```

**Example Email:**
```
Subject: What you saved is still here

Hi [Name],

You were tracking 3 promising deals. We found 2 more that match your strategy.

No pressure to come back—just wanted you to know. When you're ready:

[Resume Button]

—The Team
```

---

### Playbook: Returning Users

**Goal:** Context restoration, celebrate return, smooth onboarding  

**Intervention: Context Restoration**
```
TIMING: Immediately on first return session
HEADLINE: "Welcome back"
MESSAGE: "You were tracking these opportunities."
ACTION: Show saved deals, bookmarks, in-progress scenarios
TONE: Warm, celebratory
```

**Context Includes:**
- Saved deals (with latest updates)
- Portfolio goals
- In-progress scenarios
- Unread expert insights
- Missed community discussions

**Actions:**
- Skip tutorials (user is experienced)
- Simplify UI (less guidance needed)
- Highlight changes since last visit

---

### Playbook: New Users

**Goal:** Activate first meaningful action  

**Intervention: Onboarding Guidance**
```
HEADLINE: "Let's get you started"
MESSAGE: "Here's how to find your first deal that matches your criteria."
ACTION: Guided walkthrough to first deal view
TONE: Encouraging, clear steps
```

---

## 5. Adaptive Personalization Over Time

As users mature, the platform **reduces friction and increases autonomy**.

### Maturity Stages

#### Stage 1: Baseline (New → Activated)
- Show all guidance banners
- Contextual tutorials enabled
- Nudge frequency: frequent
- UI complexity: simplified
- Messaging: instructional

#### Stage 2: Learning (Activated → Engaged)
- Guidance still visible
- Contextual tutorials enabled
- Nudge frequency: moderate
- UI complexity: standard
- Messaging: confirmatory

#### Stage 3: Refined (Engaged + 2+ months)
- Reduce guidance banners
- Contextual tutorials optional
- Nudge frequency: low, targeted
- UI complexity: advanced
- Messaging: value-focused

#### Stage 4: Expert (Power User + sustained)
- Minimal guidance
- No tutorials unless requested
- Nudges: only high-value moments
- UI complexity: expert mode available
- Messaging: insights, predictions

### Implementation Rules

✅ **Never reset** preferences without explicit user request  
✅ **Infer evolution** from behavior (save preferences automatically)  
✅ **Allow micro-refinement** ("Adjust time horizon?") without heavy setup  
✅ **Surface deferred setup** contextually, not intrusively  
✅ **Track maturity stage** in LifecycleState.personalization_maturity  

---

## 6. Lifecycle-Aware Monetization

### Rules

❌ **Don't monetize At-Risk or Dormant users aggressively**  
✅ Monetize Engaged and Power User states  
✅ Frame as capability expansion, not restriction  
✅ Suppress upgrade offers while at-risk

### When Monetization Window is Open

```
state === 'engaged' && engagement_trend !== 'declining' && days_since_last_action < 3
state === 'power_user' && no_rejected_offers_in_7_days
state === 'returning' && sustained_return >= 2 weeks
```

### When to Suppress

```
state === 'at_risk'
state === 'dormant'
churn_risk === 'critical' || churn_risk === 'high'
recent_dismissal_of_upgrade_offer
```

---

## 7. Lifecycle State JSON Schema

```json
{
  "user_email": "investor@example.com",
  "current_state": "engaged",
  
  "state_history": [
    {
      "state": "new",
      "entered_date": "2026-01-01T10:00:00Z",
      "exit_date": "2026-01-08T15:30:00Z",
      "trigger_reason": "core_milestone_hit",
      "days_in_state": 7
    },
    {
      "state": "activated",
      "entered_date": "2026-01-08T15:30:00Z",
      "exit_date": "2026-01-22T09:00:00Z",
      "trigger_reason": "sustained_engagement",
      "days_in_state": 14
    },
    {
      "state": "engaged",
      "entered_date": "2026-01-22T09:00:00Z",
      "exit_date": null,
      "trigger_reason": "2_weeks_active_plus_2_sessions_weekly"
    }
  ],
  
  "engagement_trends": {
    "sessions_7days": 4,
    "sessions_14days": 8,
    "actions_7days": 12,
    "actions_14days": 20,
    "engagement_trend_7days": "stable",
    "engagement_trend_percent": -5,
    "days_since_last_action": 2,
    "last_session_date": "2026-01-25T14:30:00Z"
  },
  
  "churn_risk": {
    "churn_risk_score": 22,
    "risk_level": "low",
    "primary_risk_factor": null,
    "secondary_risk_factors": [],
    "last_risk_assessment_date": "2026-01-25T15:00:00Z"
  },
  
  "activation_signals": {
    "activation_path": "deal_first",
    "core_milestone_achieved": true,
    "milestone_achieved_date": "2026-01-08T15:30:00Z",
    "days_to_activation": 7
  },
  
  "habit_loop_status": {
    "active_loops": ["discovery", "insight"],
    "primary_loop": "discovery",
    "loop_momentum": {
      "discovery_momentum": 75,
      "insight_momentum": 50,
      "social_momentum": 0
    }
  },
  
  "capability_tier_status": {
    "unlocked_tiers": ["tier_1"],
    "tier_adoption_status": {
      "tier_1_adoption_percent": 80,
      "tier_2_adoption_percent": 0,
      "tier_3_adoption_percent": 0
    }
  },
  
  "personalization_maturity": "learning",
  
  "ui_adaptation_state": {
    "show_guidance_banners": true,
    "show_contextual_tutorials": true,
    "show_nudges": true,
    "insight_density": "moderate",
    "ui_complexity_level": "standard"
  },
  
  "intervention_state": {
    "eligible_interventions": ["feature_discovery"],
    "active_intervention": null,
    "dismissed_interventions": []
  },
  
  "monetization_state": {
    "eligible_for_upgrade": true,
    "monetization_window_open": true,
    "suppressed_until_date": null,
    "suppression_reason": null
  },
  
  "value_metrics": {
    "time_saved_hours": 8,
    "decisions_made": 3,
    "network_connections": 2,
    "compounding_value_score": 45
  }
}
```

---

## 8. Implementation Flow

```
USER ACTIVITY LOGGED
  ↓
RUN detectLifecycleState() (daily/weekly)
  • Fetch engagement metrics
  • Evaluate state transition rules
  • Update current_state if changed
  • Record state_history entry
  ↓
IF STATE CHANGED
  • Trigger state-specific initialization
  • Update UI adaptation flags
  • Suppress/enable monetization
  ↓
RUN predictChurnRisk() (daily for at-risk/dormant)
  • Calculate churn_risk_score
  • Identify primary_risk_factor
  • Set risk_level
  ↓
IF CHURN RISK HIGH/CRITICAL OR STATE AT-RISK/DORMANT
  • Run triggerLifecycleIntervention()
  • Select appropriate playbook
  • Create active_intervention record
  ↓
SHOW INTERVENTION
  • Display LifecycleIntervention component
  • Track shown_date
  • Measure engagement
  ↓
USER ACTS OR DISMISSES
  • Update intervention status
  • Track sentiment (acted vs dismissed)
  • Adjust future interventions
  ↓
WEEKLY/MONTHLY
  • Recalculate lifecycle state
  • Assess maturity progression
  • Adjust personalization settings
```

---

## 9. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| State transitions detected | 85%+ | Automated vs manual |
| At-risk intervention success rate | 35%+ | Re-engagement rate |
| Dormant re-activation rate | 15%+ | Return rate |
| Returning user retention (week 2) | 70%+ | Sustained activity |
| Churn prediction accuracy | 75%+ | AUC of model |
| Premature churn prevented | 20%+ | Intervention impact |
| User satisfaction with interventions | 60%+ | Survey feedback |

---

## 10. Tone & Philosophy

✅ **Long-term partner:** "We're here whenever you're ready"  
✅ **Respectful:** Never assume engagement = satisfaction  
✅ **Intelligent:** Predict, don't reactive  
✅ **Calm:** Urgency only when necessary  
✅ **Transparent:** Explain why interventions exist  
✅ **Autonomy:** Respect user choices always  

---

## 11. Future Enhancements

- **Predictive interventions:** ML model predicts next state 7 days early
- **Personalized timing:** Send interventions at user's optimal engagement window
- **Cohort analysis:** Group users by state + activation path, test interventions
- **Win-back campaigns:** Tiered email/push sequence for dormant users
- **State-based feature rollout:** Release features to power users first
- **Lifecycle cohort analysis:** Measure state duration and outcomes by cohort