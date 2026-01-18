# Advanced User Segmentation Strategy

## Overview

Dynamic user segmentation combines **lifecycle state**, **power-user signals**, and **monetization status** to deliver targeted interventions, feature rollouts, and personalized campaigns.

---

## Segment Definitions

### 1. **Emerging Power Users**

**Criteria:**
- Power-user score: 40–69
- State: Engaged or Activated
- Subscription: Free
- Capabilities: ≥1 tier unlocked

**Characteristics:**
- Active feature adoption
- High conversion potential
- Not yet paying
- Demonstrating power-user behavior

**Intervention Strategy:**
- **Type:** Upgrade nudge
- **Message:** "You're using this like a pro"
- **CTA:** "See Pro Features"
- **Timing:** Immediate (in-app banner)
- **Goal:** Convert to paying subscriber

**Feature Rollout Priority:** Beta features, advanced tooltips

---

### 2. **Active Pro Subscribers**

**Criteria:**
- Subscription: Active or trialing
- State: Engaged or Power User
- Churn risk: Low or moderate

**Characteristics:**
- Paying customers
- Regular engagement
- Low churn risk
- Value realization in progress

**Intervention Strategy:**
- **Type:** Value reinforcement
- **Message:** "Your Pro toolkit is working"
- **CTA:** "View Your Impact"
- **Timing:** Weekly digest email
- **Goal:** Retention, upsell to higher tier

**Feature Rollout Priority:** Premium features first, exclusive access

---

### 3. **At-Risk Engaged Users**

**Criteria:**
- State: Engaged or Power User
- Churn risk: High or critical

**Characteristics:**
- Was active, now declining
- High retention priority
- Intervention window open
- May still convert/retain

**Intervention Strategy:**
- **Type:** Re-engagement
- **Message:** "We noticed you haven't checked in"
- **CTA:** "View New Matches"
- **Timing:** Immediate (push notification)
- **Goal:** Prevent churn, restore engagement

**Feature Rollout Priority:** Skip (focus on core value)

---

### 4. **High-Intent Free Users**

**Criteria:**
- Power-user status: Power User
- Power-user score: ≥70
- Subscription: Free
- Capabilities: ≥2 tiers unlocked

**Characteristics:**
- Heavy free-tier usage
- Multiple capabilities unlocked
- Critical conversion readiness
- Prime monetization target

**Intervention Strategy:**
- **Type:** Conversion offer
- **Message:** "Unlock everything you need"
- **CTA:** "Upgrade to Pro"
- **Timing:** Immediate (modal)
- **Goal:** Convert to premium ASAP

**Feature Rollout Priority:** Paywall advanced features

---

### 5. **Dormant Premium Users**

**Criteria:**
- Subscription: Active or trialing
- State: Dormant

**Characteristics:**
- Paying but inactive
- Revenue at risk
- Urgent win-back priority
- High value churn

**Intervention Strategy:**
- **Type:** Win-back premium
- **Message:** "Your Pro features are waiting"
- **CTA:** "Resume"
- **Timing:** Immediate (email)
- **Goal:** Reactivate before cancellation

**Feature Rollout Priority:** Pause feature releases, focus on re-engagement

---

### 6. **Returning Champions**

**Criteria:**
- State: Returning
- Previous state: Power User (in history)
- High historical engagement

**Characteristics:**
- Was power user, went dormant, now returning
- High retention value
- Sensitive to friction
- Strong re-engagement signal

**Intervention Strategy:**
- **Type:** Welcome back VIP
- **Message:** "Welcome back, power user"
- **CTA:** "Pick Up Where You Left Off"
- **Timing:** Immediate (in-app modal)
- **Goal:** Restore to power-user status

**Feature Rollout Priority:** Context restoration, resume features

---

### 7. **New High-Potential**

**Criteria:**
- State: New or Activated
- Days to activation: ≤3
- Consecutive weeks active: ≥1

**Characteristics:**
- Fast activation
- Strong early engagement
- High conversion potential
- Risk of early cliff

**Intervention Strategy:**
- **Type:** Fast-track activation
- **Message:** "You're moving fast"
- **CTA:** "Try Comparisons"
- **Timing:** Day 3
- **Goal:** Accelerate to engaged state

**Feature Rollout Priority:** Core features, guided tours

---

### 8. **Passive Browsers**

**Criteria:**
- State: Engaged
- Power-user score: <30
- Capabilities: None unlocked
- Subscription: Free

**Characteristics:**
- Low engagement depth
- Not exploring features
- Capability unlock opportunity
- Needs nudge to activate

**Intervention Strategy:**
- **Type:** Capability unlock nudge
- **Message:** "Discover deeper insights"
- **CTA:** "Compare Deals"
- **Timing:** After 3 saves
- **Goal:** Unlock first capability tier

**Feature Rollout Priority:** Discovery prompts, tooltips

---

### 9. **Subscription Churn Risk**

**Criteria:**
- Subscription: Active
- Churn risk: High or critical
- State: Engaged or Power User

**Characteristics:**
- Paying but at-risk
- Revenue at risk
- Urgent retention priority
- Needs intervention

**Intervention Strategy:**
- **Type:** Retention offer
- **Message:** "How can we help?"
- **CTA:** "Share Feedback"
- **Timing:** Immediate (email)
- **Goal:** Understand issue, prevent cancellation

**Feature Rollout Priority:** Hold back, focus on core value

---

### 10. **Trial Converters**

**Criteria:**
- Subscription: Trialing
- State: Engaged or Power User
- Churn risk: Low

**Characteristics:**
- Active trial users
- High conversion likelihood
- Demonstrating value
- Prime conversion target

**Intervention Strategy:**
- **Type:** Trial conversion
- **Message:** "Your trial is working"
- **CTA:** "Subscribe Now"
- **Timing:** Trial day 10
- **Goal:** Convert to paid subscription

**Feature Rollout Priority:** Premium features, value demonstration

---

## Intervention Playbooks by Segment

### Emerging Power Users

**Objective:** Convert to premium

**Intervention Sequence:**
1. **Day 1:** In-app banner showing unlock prompt
2. **Day 3:** Email highlighting premium benefits
3. **Day 7:** Modal with limited-time offer
4. **Day 14:** Final conversion push

**Messaging Tone:** Congratulatory, empowering  
**Offer Type:** Standard pricing, no urgency  
**Suppression Rules:** Stop after 3 dismissals

---

### Active Pro Subscribers

**Objective:** Retain and delight

**Intervention Sequence:**
1. **Weekly:** Value metrics email digest
2. **Monthly:** Feature update newsletter
3. **Quarterly:** Exclusive feature preview

**Messaging Tone:** Partner, insider  
**Offer Type:** Upsell to higher tier (soft)  
**Suppression Rules:** Respect preferences

---

### At-Risk Engaged Users

**Objective:** Prevent churn

**Intervention Sequence:**
1. **Day 1:** Re-engagement push notification
2. **Day 3:** Value reminder email
3. **Day 7:** Personalized win-back offer
4. **Day 14:** Final outreach from founder

**Messaging Tone:** Caring, non-pushy  
**Offer Type:** No monetization  
**Suppression Rules:** Stop after day 14 if no response

---

### High-Intent Free Users

**Objective:** Immediate conversion

**Intervention Sequence:**
1. **Immediate:** Full-screen upgrade modal
2. **Day 1:** Triggered email with benefits
3. **Day 2:** In-app reminder with value preview

**Messaging Tone:** Direct, confident  
**Offer Type:** Clear value proposition  
**Suppression Rules:** 1 per session max

---

### Dormant Premium Users

**Objective:** Win back before churn

**Intervention Sequence:**
1. **Day 1:** High-signal summary email
2. **Day 3:** "We miss you" push notification
3. **Day 7:** Exclusive preview of new features
4. **Day 14:** Cancellation survey if still dormant

**Messaging Tone:** Personal, non-desperate  
**Offer Type:** Feature highlights only  
**Suppression Rules:** Pause after day 14

---

## Feature Rollout Strategy

### Beta Access Priority

1. **Active Pro Subscribers** → Get all beta features first
2. **Trial Converters** → Get beta to demonstrate premium value
3. **Emerging Power Users** → Get beta to encourage upgrade
4. **Returning Champions** → Get beta as welcome-back gesture
5. **All others** → Standard release schedule

### A/B Testing Cohorts

- **Emerging Power Users:** Test conversion messaging variants
- **At-Risk Engaged:** Test win-back intervention types
- **Passive Browsers:** Test capability unlock prompts
- **Trial Converters:** Test trial-to-paid conversion flows

---

## Re-Engagement Campaigns

### Campaign 1: At-Risk Engaged Users

**Goal:** Prevent churn before dormancy

**Touchpoints:**
- Email (Day 1): "What changed since you left?"
- Push (Day 3): "3 new deals match your criteria"
- In-app (Day 5): Simplified dashboard with top picks

**Success Metric:** 35%+ re-engagement rate

---

### Campaign 2: Dormant Premium Users

**Goal:** Win back before cancellation

**Touchpoints:**
- Email (Day 1): "Your Pro tools are waiting"
- Email (Day 7): "Here's what you're missing"
- Call (Day 14): Personal outreach from success team

**Success Metric:** 15%+ reactivation rate

---

### Campaign 3: Returning Champions

**Goal:** Restore to power-user status

**Touchpoints:**
- In-app (Immediate): Context restoration modal
- Email (Day 1): "Welcome back, here's what's new"
- In-app (Day 3): Capability unlock celebration

**Success Metric:** 70%+ sustained return rate

---

## Upgrade Offer Personalization

### Emerging Power Users

**Offer:** Standard pricing, no discount  
**Messaging:** "You're ready for unlimited"  
**CTA:** "Upgrade to Pro"  
**Placement:** In-app banner after 3rd capability use

---

### High-Intent Free Users

**Offer:** Standard pricing, urgency-free  
**Messaging:** "Get everything you're already using, unlimited"  
**CTA:** "Unlock Full Access"  
**Placement:** Full-screen modal after hitting capability limit

---

### Trial Converters

**Offer:** Seamless trial-to-paid conversion  
**Messaging:** "Continue unlimited access"  
**CTA:** "Subscribe Now"  
**Placement:** Trial countdown banner (days 7, 10, 12, 14)

---

## Success Metrics by Segment

| Segment | Key Metric | Target |
|---|---|---|
| Emerging Power Users | Conversion rate | 20–30% |
| Active Pro Subscribers | Retention rate | 90%+ |
| At-Risk Engaged | Re-engagement rate | 35%+ |
| High-Intent Free | Conversion rate | 40–60% |
| Dormant Premium | Reactivation rate | 15–25% |
| Returning Champions | Sustained return | 70%+ |
| New High-Potential | Activation rate | 80%+ |
| Passive Browsers | Capability unlock | 25%+ |
| Subscription Churn Risk | Retention rate | 60%+ |
| Trial Converters | Trial-to-paid rate | 50–70% |

---

## Implementation Workflow

```
USER ACTIVITY LOGGED
  ↓
RUN identifyUserSegments() (daily/weekly)
  • Fetch lifecycle, power-user, retention states
  • Evaluate segment criteria
  • Assign user to segments
  ↓
IF SEGMENTS IDENTIFIED
  • Run triggerSegmentedIntervention()
  • Select intervention based on primary segment
  • Create intervention record
  ↓
SHOW SEGMENTED CONTENT
  • Display SegmentedContent component
  • Show segment-specific messaging
  • Track engagement
  ↓
USER ACTS OR DISMISSES
  • Update intervention status
  • Track segment performance
  • Adjust future interventions
  ↓
FEATURE ROLLOUT DECISION
  • Check segment eligibility
  • Enable/disable features per segment
  • Track adoption metrics
```

---

## Tone & Philosophy

✅ **Segment-aware, not manipulative**  
✅ **Targeted, not intrusive**  
✅ **Personalized, not creepy**  
✅ **Value-first, not sales-first**  
✅ **Respectful, always**