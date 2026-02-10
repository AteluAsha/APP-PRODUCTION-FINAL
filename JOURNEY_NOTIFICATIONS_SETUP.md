# Journey Reminder Notifications

Local notifications to support users as they await their 7-day somatic journey start.

## Setup (Complete)

- **expo-notifications** installed and configured
- **Permissions:** Requested after user confirms date selection (non-intrusive)
- **Android:** `SCHEDULE_EXACT_ALARM` + `expo-notifications` plugin with default channel
- **iOS:** No extra usage strings required (notification permissions are standard)

## Flow

1. User selects start date on DateSelection and confirms
2. `scheduleJourneyReminders(courseStartDateISO)` is called
3. Permissions are requested (if not already granted)
4. Three local notifications are scheduled:
   - **3 days before** (9:00 AM): "Your path is opening soon"
   - **2 days before** (9:00 AM): "Two days until your journey"
   - **1 day before** (9:00 AM): "Tomorrow, your journey begins" (includes day name, e.g. "Monday awaits")

## Preloaded Messages

All messages are heart-minded, matched to the user's specific countdown:

| When | Title | Body |
|------|-------|------|
| 3 days out | Your path is opening soon | In 3 days, your 7-day somatic journey begins. Your heart is preparing... |
| 2 days out | Two days until your journey | The eve of your path draws near. Rest well—your Root chakra day awaits. |
| 1 day before | Tomorrow, your journey begins | Monday awaits. Open the app when you're ready—your first day of somatic alignment is here. |

## App Store Readiness

- Permission request happens at contextually appropriate moment (after date selection)
- Graceful handling of permission denial (reminders are skipped, no crash)
- No custom usage descriptions needed for notifications (standard iOS/Android)
- Android 13+ notification permission prompt appears when channel is created

## Testing

1. Run on a physical device (notifications don't fire reliably on simulators)
2. Select a start date 4+ days in the future
3. Grant notification permission when prompted
4. To test sooner: temporarily change `daysBefore` loop or `notifyDate` in `journeyNotifications.ts` to use seconds/minutes for a quick trigger
