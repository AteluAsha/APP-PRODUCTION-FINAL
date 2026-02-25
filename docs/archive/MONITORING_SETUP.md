# Monitoring & Debugging Setup Guide

## 🎯 Overview

This guide outlines what to monitor for long-term app health and how to set up debugging tools.

---

## 📊 What to Monitor

### 1. **App Crashes & Errors**

- **Tool**: Sentry (recommended)
- **Metrics**:
  - Crash-free rate (target: >99.5%)
  - Error frequency by feature
  - Error trends over time
  - User impact (how many users affected)

### 2. **Performance Metrics**

- **Screen Load Times**: Track how long each screen takes to load
- **Audio Loading**: Success rate and load times
- **Image Loading**: Load times for Firebase images
- **API Response Times**: Gemini, ElevenLabs, Firebase

### 3. **User Engagement**

- **Daily Active Users (DAU)**
- **Session Length**
- **Feature Usage**: Which features are most used
- **Completion Rates**: How many users complete the 7-day journey

### 4. **Technical Health**

- **Firebase Costs**: Storage bandwidth, Firestore reads/writes
- **API Costs**: Gemini API usage, ElevenLabs usage
- **Bundle Size**: Track over time to prevent bloat
- **Memory Usage**: Monitor for memory leaks

### 5. **Business Metrics**

- **Revenue**: RevenueCat subscription conversions
- **Trial Completion**: How many users finish trials
- **Churn Rate**: Users who don't return

---

## 🔧 Setup Instructions

### Sentry Error Tracking (Recommended)

1. **Install Sentry**:

```bash
npx expo install @sentry/react-native
```

2. **Initialize in `app/_layout.tsx`**:

```typescript
import * as Sentry from "@sentry/react-native"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
})
```

3. **Add to `.env`**:

```
SENTRY_DSN=your_sentry_dsn_here
```

### Firebase Analytics (Optional)

Firebase Analytics can track:

- Screen views
- User actions
- Custom events
- User properties

**Note**: Currently excluded for React Native compatibility, but can be added if needed.

---

## 🐛 Debugging Tools

### Development Mode

- ✅ `__DEV__` checks throughout codebase
- ✅ Console logging for development
- ✅ React Native DevTools support

### Production Debugging

- ⚠️ **Need**: Sentry for error tracking
- ⚠️ **Need**: Performance monitoring
- ⚠️ **Need**: User session replay (optional)

---

## 📈 Key Performance Indicators (KPIs)

### Must Track

1. **Crash-Free Rate**: >99.5%
2. **Average Screen Load**: <2 seconds
3. **Audio Load Success**: >99%
4. **API Error Rate**: <1%

### Should Track

1. **User Retention**: Day 1, Day 7, Day 30
2. **Feature Adoption**: % of users using each feature
3. **Completion Rate**: % completing 7-day journey
4. **Cost per User**: Firebase + API costs

---

## 🔍 What to Watch For

### Red Flags

- ❌ Crash-free rate dropping below 99%
- ❌ Screen load times >5 seconds
- ❌ API error rate >5%
- ❌ Bundle size increasing >10MB/month
- ❌ Firebase costs spiking unexpectedly

### Success Indicators

- ✅ Crash-free rate >99.5%
- ✅ Screen loads <2 seconds
- ✅ High user retention
- ✅ Low API costs per user
- ✅ Stable bundle size

---

## 📝 Monitoring Checklist

### Daily

- [ ] Check Sentry for new errors
- [ ] Review crash reports
- [ ] Check API usage/costs

### Weekly

- [ ] Review performance metrics
- [ ] Check user engagement trends
- [ ] Review Firebase costs

### Monthly

- [ ] Bundle size audit
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Cost optimization review

---

## 🚨 Alert Thresholds

Set up alerts for:

1. **Crash Rate**: >1% in 24 hours
2. **API Errors**: >5% error rate
3. **Cost Spike**: >20% increase in Firebase costs
4. **Performance**: Screen load >5 seconds for >10% of users

---

## 💡 Best Practices

1. **Log Context**: Always include user ID, screen, and action in error logs
2. **User Privacy**: Don't log sensitive user data
3. **Performance**: Monitor in production, not just dev
4. **Costs**: Set up billing alerts in Firebase
5. **Updates**: Review monitoring setup quarterly
