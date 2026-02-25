# Firebase Index Setup for Social Sanctuary

## Required Firestore Index

The Social Sanctuary feature requires a composite index for querying top reflections by chakra day and timestamp.

### Index Details

**Collection:** `social_sanctuary`

**Fields:**

1. `chakraDay` (Ascending)
2. `timestamp` (Descending)
3. `__name__` (Ascending)

### How to Create the Index

1. **Automatic Method (Recommended):**
   - When you see the error in the console, click the link provided in the error message
   - It will take you directly to the Firebase Console with the index pre-configured
   - Click "Create Index"

2. **Manual Method:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `soul-school-367ee`
   - Navigate to Firestore Database → Indexes
   - Click "Create Index"
   - Set the following:
     - Collection ID: `social_sanctuary`
     - Fields:
       - `chakraDay` - Ascending
       - `timestamp` - Descending
       - `__name__` - Ascending
   - Click "Create"

### Query That Requires This Index

```typescript
query(
  collection(db, "social_sanctuary"),
  where("chakraDay", "==", chakraDay),
  orderBy("timestamp", "desc"),
  limit(2),
)
```

### Note

The app will gracefully handle the missing index by returning an empty array until the index is created. This prevents crashes but means Community Highlights won't display until the index exists.
