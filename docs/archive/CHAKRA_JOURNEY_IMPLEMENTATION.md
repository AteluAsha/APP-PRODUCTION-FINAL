# Chakra Journey Implementation Plan

## Overview

This document outlines the implementation plan for the calendar-based chakra journey feature in the Seven Chakras app. The journey follows a specific pattern where each chakra is tied to a particular day of the week, starting with the Root chakra on Monday and progressing to the Crown chakra on Sunday.

## User Journey Flow

### First-Time User Experience

1. **Monday (First Launch)**
   - User receives a welcome onboarding explaining the 7-day chakra journey concept
   - Root chakra is unlocked and available
   - A progression indicator shows the current day and locked future days

2. **Other Weekday (First Launch)**
   - User sees the waiting screen: "We begin on Monday. I will open on Monday, [next Monday's date]. Your 7 Day Journey Begins."
   - Preview option allows exploring limited Root chakra content
   - Calendar visualization shows the chakra-weekday mapping

### Weekly Progression

1. **Daily Unlocking**
   - Monday: Root chakra unlocked
   - Tuesday: Root and Sacral chakras unlocked
   - Wednesday: Root, Sacral, and Solar Plexus chakras unlocked
   - Thursday: Root through Heart chakras unlocked
   - Friday: Root through Throat chakras unlocked
   - Saturday: Root through Third Eye chakras unlocked
   - Sunday: All chakras unlocked

2. **Missing Days**
   - If user skips days, they still gain access to the appropriate chakras for the current day
   - Example: If a user starts Monday, skips to Friday, they'll have access to Root through Throat chakras

### Weekly Reset / Completion

1. **All Chakras Completed**
   - If user views all 7 chakras within a week, all chakras remain permanently unlocked
   - A congratulatory message appears when the user completes all 7

2. **Incomplete Journey**
   - If the user doesn't complete all chakras by Sunday, the journey resets the following Monday
   - A reset message appears: "A new week begins! Today we return to the Root chakra."
   - Options to "Begin Fresh Journey" or "See My Progress So Far"

## Technical Implementation

### 1. State Management

We'll implement a Zustand store to manage the chakra journey state:

```typescript
interface ChakraJourneyStore {
  // Journey state
  journeyStarted: boolean
  allChakrasCompleted: boolean
  lastWeekStartDate: string | null

  // Completion tracking
  completedChakras: Chakra[]

  // Actions
  markChakraCompleted: (chakra: Chakra) => void
  startJourney: () => void
  resetJourney: () => void
  checkWeekTransition: () => void
}
```

### 2. Data Persistence

We'll use AsyncStorage to persist the journey state:

```typescript
// Storage keys
const JOURNEY_STARTED = "journey_started"
const ALL_CHAKRAS_COMPLETED = "all_chakras_completed"
const COMPLETED_CHAKRAS = "completed_chakras"
const LAST_WEEK_START_DATE = "last_week_start_date"
```

### 3. Date & Time Utilities

Create utility functions for day-of-week calculations:

```typescript
// Get current day of week (0 = Monday, 6 = Sunday)
const getCurrentDayOfWeek = (): number => {
  const day = new Date().getDay()
  // Convert from JS Sunday-first (0) to Monday-first (0)
  return day === 0 ? 6 : day - 1
}

// Calculate next Monday's date
const getNextMondayDate = (): Date => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday
  const daysUntilNextMonday = currentDay === 1 ? 7 : (8 - currentDay) % 7
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilNextMonday)
  return nextMonday
}
```

### 4. UI Components

#### Waiting Screen

Three design options for the waiting screen:

**Option A: Minimalist Countdown**

- Black background with elegant typography
- Countdown timer to next Monday
- Pulsing "Preview Journey" button

**Option B: Chakra Week Wheel**

- Circular visualization of the 7 chakras mapped to weekdays
- Calendar element showing next Monday's date
- Preview button near the Root chakra

**Option C: Journey Map**

- Visual path showing the 7 chakras as steps on a journey
- Calendar element with current date and next Monday highlighted
- "Get a Glimpse" preview button

#### Progression Indicators

Three options for tracking weekly progress:

**Linear Day Indicator**

- Horizontal bar with M-T-W-T-F-S-S labels
- Current day highlighted
- Color-coding matching each chakra

**Circular Week Wheel**

- Circular arrangement of days
- Chakra icons for each day
- Animation when transitioning between days

**Chakra Stacking**

- Vertical stack of chakras
- Unlocked chakras colored, locked chakras grayed out
- Day labels beside each chakra

### 5. Notifications

Implement local notifications for:

- New chakra available (daily morning notification)
- Reminder if today's chakra hasn't been viewed (evening)
- Weekend reminder for incomplete chakras
- Week completion congratulations

### 6. Developer Tools

Create a developer panel accessed through a hidden gesture:

- Day override controls
- Completion status toggles
- Week reset simulation
- "All completed" state testing

## Implementation Phases

### Phase 1: Core Logic & State Management

1. **Create ChakraJourneyStore**
   - Implement the state management logic
   - Add persistence with AsyncStorage
   - Create date utility functions

2. **Update ChakraHome Component**
   - Modify to check current day of week
   - Implement chakra visibility logic
   - Create waiting screen component

### Phase 2: UI Development

1. **Design Three Waiting Screen Options**
   - Implement all three designs for evaluation
   - Add preview functionality

2. **Create Three Progression Indicators**
   - Implement all three designs for testing
   - Integrate with journey state

3. **Design Reset/Completion Messaging**
   - Create modals for journey reset
   - Design completion celebration

### Phase 3: Additional Features

1. **Develop Developer Tools**
   - Implement hidden developer panel
   - Add day/completion override controls

2. **Implement Notifications**
   - Set up local notification system
   - Create notification content and scheduling

3. **Add Onboarding Flow**
   - Design first-time user experience
   - Create explanatory screens for journey concept

## Chakra-Day Mapping

| Weekday   | Day # | Chakra       | Association             |
| --------- | ----- | ------------ | ----------------------- |
| Monday    | 0     | Root         | "I Am" - Foundation     |
| Tuesday   | 1     | Sacral       | "I Feel" - Emotion      |
| Wednesday | 2     | Solar Plexus | "I Do" - Power/Action   |
| Thursday  | 3     | Heart        | "I Love" - Connection   |
| Friday    | 4     | Throat       | "I Speak" - Expression  |
| Saturday  | 5     | Third Eye    | "I See" - Intuition     |
| Sunday    | 6     | Crown        | "I Understand" - Wisdom |

## Testing Scenarios

1. **First Launch Tests**
   - First launch on Monday
   - First launch on other weekdays
   - Preview functionality

2. **Weekly Progress Tests**
   - Daily progression through the week
   - Skipping days
   - Accessing previously unlocked chakras

3. **Week Transition Tests**
   - Complete journey - verify all chakras remain unlocked
   - Incomplete journey - verify proper reset
   - Multiple week cycles

4. **Edge Cases**
   - App closed for extended periods
   - Device date/time changes
   - Timezone transitions

## Success Metrics

- User retention throughout the week
- Completion rate for all 7 chakras
- Engagement with each chakra's content
- Return rate for users who don't complete all chakras

## Future Enhancements

- Journey achievement badges
- Social sharing of completion
- Personalized chakra insights based on engagement
- Multiple journey cycles with progressive content
