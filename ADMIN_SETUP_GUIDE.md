# 🏀 DBA League Admin Setup Guide

## 🚀 Quick Start: How to Become Admin

### Step 1: Make Yourself Admin
1. Open the file: `contexts/AuthContext.tsx`
2. Find this section around line 44:
```typescript
// Admin emails - ADD YOUR EMAIL HERE TO BECOME ADMIN
const adminEmails = [
  'admin@denlowba.com',
  'remy@denlowba.com',
  // ADD YOUR EMAIL BELOW THIS LINE:
  // 'your-email@gmail.com',
];
```
3. **Add your email** by uncommenting and replacing the example:
```typescript
const adminEmails = [
  'admin@denlowba.com',
  'remy@denlowba.com',
  'your-actual-email@gmail.com',  // ← Add your real email here
];
```
4. Save the file

### Step 2: Create Account & Login
1. Go to: http://localhost:3001/login
2. Click "Don't have an account? Sign up"
3. **Use the SAME email** you added to the admin list
4. Create a password and sign up
5. You should now see "Admin Panel" in the navigation!

### Step 3: Migrate Your Data to Firebase
1. Click "Admin Panel" in the navigation
2. Click "Data Management" (💾 icon)
3. Click "Migrate Data to Firebase"
4. Wait for migration to complete
5. Your data is now saved in Firebase!

## 🎯 What You Can Do as Admin

### Player Management (`/admin/players`)
- ✅ Add new players with complete stats
- ✅ Edit existing player information
- ✅ Transfer players between teams
- ✅ Activate/deactivate players
- ✅ View player performance analytics

### Game Management (`/admin/games`)
- ✅ Add new games with detailed stats
- ✅ Edit game scores and statistics
- ✅ View quarter-by-quarter breakdowns
- ✅ Manage player performance data
- ✅ Update game status and results

### Team Management (`/admin/teams`)
- ✅ Manage team rosters
- ✅ Update team information
- ✅ View team statistics
- ✅ Handle player transfers

### MVP Voting (`/admin/mvp`)
- ✅ Monitor real-time voting
- ✅ View vote analytics
- ✅ Manage voting system

### Data Management (`/admin/data`)
- ✅ Migrate data to Firebase
- ✅ Check database status
- ✅ Backup and restore data
- ✅ Clear data if needed

## 🔧 Technical Details

### Firebase Integration
- **Authentication**: Email/password login system
- **Database**: Firestore for all league data
- **Real-time**: Live updates for MVP voting
- **Security**: Admin-only access to management features

### Data Structure
```
Firebase Collections:
├── players/          # All player data and stats
├── teams/           # Team information and records
├── games/           # Game results and statistics
├── mvpVotes/        # MVP voting data
└── settings/        # League configuration
```

### Admin Features
- **Role-based access**: Only admins can access admin panel
- **Data persistence**: All changes saved to Firebase
- **Real-time updates**: Changes reflect immediately
- **Secure voting**: Prevents duplicate MVP votes

## 🛡️ Security Features

### Admin Protection
- Email-based admin system
- Automatic redirect for unauthorized users
- Protected admin routes
- Secure Firebase rules

### Data Safety
- All data backed up in Firebase
- Migration doesn't overwrite existing data
- Clear confirmation for destructive actions
- Real-time data validation

## 📱 Website Features

### Public Features (No Login Required)
- ✅ View all league data
- ✅ Player and team statistics
- ✅ Game results and schedules
- ✅ League standings
- ✅ MVP voting (with localStorage backup)
- ✅ League records and achievements

### Admin Features (Login Required)
- ✅ Complete data management
- ✅ Add/edit players and games
- ✅ Monitor MVP voting
- ✅ Database administration
- ✅ League configuration

## 🚨 Important Notes

### Admin Email Setup
- **MUST** use the exact same email in both:
  1. The `adminEmails` array in `AuthContext.tsx`
  2. Your Firebase account signup
- Case-sensitive email matching
- Changes require server restart

### Data Migration
- Safe to run multiple times
- Won't duplicate existing data
- Migrates all CSV data to Firebase
- Creates proper database structure

### MVP Voting
- Authenticated users: One vote per email (Firebase)
- Non-authenticated users: One vote per browser (localStorage)
- Real-time vote counting
- Admin can monitor all votes

## 🎉 You're All Set!

Once you complete the setup:
1. **Admin Panel**: Full control over league data
2. **Firebase Database**: All data safely stored
3. **MVP Voting**: Real-time voting system
4. **Public Website**: ESPN-style league site

Your DBA league website is now a fully-featured, database-backed basketball management system! 🏀

## 🆘 Need Help?

If you run into issues:
1. Check the browser console for errors
2. Verify your email is correctly added to `adminEmails`
3. Make sure you're using the same email for signup
4. Try refreshing the page after making admin changes
5. Check the Firebase console for data verification

Happy managing! 🏆
