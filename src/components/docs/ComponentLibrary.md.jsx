# Component Library Documentation

## Gamification Components

### AchievementCelebration

**Purpose:** Full-screen modal celebrating skill mastery with confetti animation.

**Usage:**
```jsx
import AchievementCelebration from '@/components/gamification/AchievementCelebration';

<AchievementCelebration
  achievement={{
    skillName: "Python Advanced Architecture",
    xpEarned: 500,
    rank: 3,
    currentLevel: 14,
    nextLevel: 15,
    progress: 75
  }}
  onClose={() => setShowCelebration(false)}
/>
```

**Props:**
- `achievement`: Object containing skill details
- `onClose`: Callback when modal is dismissed

**Features:**
- Confetti animation using canvas-confetti
- 3D card rotation entrance
- Progress bar with level progression
- Purple/orange gradient theme

---

### DailyQuestsPanel

**Purpose:** Displays daily quests with progress tracking and streak visualization.

**Usage:**
```jsx
import DailyQuestsPanel from '@/components/gamification/DailyQuestsPanel';

<DailyQuestsPanel
  quests={[
    { id: 1, title: 'Team Cheer', description: 'Send 3 recognitions', 
      xp: 50, progress: 2, total: 3, icon: Users, completed: false },
    { id: 2, title: 'Insight Explorer', description: 'Read weekly AI Insight', 
      xp: 100, badge: 'RARE BADGE', icon: Lightbulb, completed: false }
  ]}
  onClaimRewards={handleClaimRewards}
/>
```

**Props:**
- `quests`: Array of quest objects
- `onClaimRewards`: Callback for claiming rewards

**Features:**
- Circular progress indicator
- Streak tracking with flame icons
- Individual quest progress bars
- Auto-generated fallback quests if none provided

---

## System Components

### SystemStatusMonitor

**Purpose:** Real-time platform health and performance monitoring.

**Usage:**
```jsx
import SystemStatusMonitor from '@/components/system/SystemStatusMonitor';

<SystemStatusMonitor />
```

**Features:**
- Live engagement metrics (98% default)
- Rendering status (Optimal/Ready)
- Response time tracking
- Active user count
- Auto-updating stats every 3 seconds

---

## Enterprise Components

### TrainingAssignment

**Purpose:** Multi-step workflow for assigning training programs to employees.

**Usage:**
```jsx
import TrainingAssignment from '@/components/enterprise/TrainingAssignment';

<TrainingAssignment
  onClose={() => setShowAssignment(false)}
  onAssign={(courseId, recipients) => handleAssign(courseId, recipients)}
/>
```

**Props:**
- `onClose`: Callback when modal is dismissed
- `onAssign`: Callback with selected course and recipients

**Features:**
- Search and filter courses (Internal/Coursera)
- Smart Select AI recommendations
- Step progress indicator
- Course selection with metadata display

---

## Design System

### Color Palette

```css
/* Primary Gradients */
--gradient-primary: linear-gradient(to right, #7c3aed, #f97316);
--gradient-card: linear-gradient(to bottom right, #6b21a8, #ea580c);

/* Colors */
--purple-600: #7c3aed
--purple-700: #6d28d9
--orange-500: #f97316
--orange-600: #ea580c

/* Usage Examples */
.btn-primary { @apply bg-gradient-to-r from-purple-600 to-orange-500; }
.card-glow { @apply bg-gradient-to-br from-purple-900/80 to-orange-900/80; }
.badge-premium { @apply bg-gradient-to-r from-purple-600 to-orange-500; }
```

### Animation Patterns

```jsx
// Entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Stagger children
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.1 }}
  >
))}

// 3D rotation
<motion.div
  initial={{ scale: 0, rotateY: -180 }}
  animate={{ scale: 1, rotateY: 0 }}
  transition={{ type: "spring", duration: 0.8 }}
>
```

### Responsive Patterns

```jsx
// Mobile-first grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-3xl md:text-5xl lg:text-7xl">

// Mobile navigation
<div className="fixed bottom-0 left-0 right-0 md:relative">
```

---

## Best Practices

### Component Structure

1. **Imports**: Group by category (React, UI, icons, API)
2. **Props destructuring**: Use object destructuring in parameters
3. **State management**: useState for local, React Query for server
4. **Effects**: useEffect with cleanup functions
5. **Event handlers**: Prefix with `handle` (handleClick, handleSubmit)

### Performance

- Use `React.memo` for expensive renders
- Lazy load heavy components
- Debounce search inputs
- Paginate large lists
- Cache API responses with React Query

### Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Color contrast ratios (WCAG AA)

### Error Handling

```jsx
// Query error states
const { data, error, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3
});

if (error) return <ErrorMessage error={error} />;
if (isLoading) return <LoadingSpinner />;
```

---

## Testing Guidelines

### Component Tests

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import DailyQuestsPanel from './DailyQuestsPanel';

test('displays quest progress', () => {
  const quests = [{ id: 1, title: 'Test Quest', progress: 2, total: 3 }];
  render(<DailyQuestsPanel quests={quests} />);
  expect(screen.getByText('2/3')).toBeInTheDocument();
});

test('claim button disabled when no completed quests', () => {
  const quests = [{ id: 1, completed: false }];
  render(<DailyQuestsPanel quests={quests} onClaimRewards={jest.fn()} />);
  expect(screen.getByText('Claim Rewards')).toBeDisabled();
});
```

---

## Migration Guide

### Updating from v1.0 to v1.1

**Color Scheme Changes:**
```jsx
// Old (v1.0)
className="bg-amber-500"

// New (v1.1)
className="bg-gradient-to-r from-purple-600 to-orange-500"
```

**New Components Available:**
- Import achievement celebrations
- Import daily quests tracking
- Import team pulse analytics
- Import system status monitoring

**Breaking Changes:**
- None. All changes are additive.

---

**Last Updated:** January 23, 2026