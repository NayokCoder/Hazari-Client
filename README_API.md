# Hazari Client - API Integration

## ✅ Setup Complete!

Your Next.js client is now fully integrated with:
- **Axios** - HTTP client
- **TanStack Query (React Query)** - Data fetching & caching

---

## 📦 What's Included

### API Services (7 files)
- `lib/api/authService.js` - Authentication
- `lib/api/userService.js` - User management
- `lib/api/walletService.js` - Wallet operations
- `lib/api/tableService.js` - Game tables
- `lib/api/gameService.js` - Game logic
- `lib/api/leaderboardService.js` - Rankings
- `lib/api/axios.js` - Configured Axios instance

### React Hooks (6 files)
- `hooks/api/useAuth.js` - Auth hooks
- `hooks/api/useUser.js` - User hooks
- `hooks/api/useWallet.js` - Wallet hooks
- `hooks/api/useTable.js` - Table hooks
- `hooks/api/useGame.js` - Game hooks
- `hooks/api/useLeaderboard.js` - Leaderboard hooks

### Configuration
- `lib/api/config.js` - API endpoints & base URL
- `.env.local` - Environment variables
- `providers/ReactQueryProvider.jsx` - TanStack Query setup

---

## 🚀 Quick Start

### 1. Make sure the server is running:
```bash
cd Server
npm start
```

### 2. Start the client:
```bash
cd Client
npm run dev
```

### 3. Use hooks in your components:

```jsx
"use client";

import { useSignup, useWalletBalance, useCreateTable } from "@/hooks/api";

export default function MyComponent() {
  const signup = useSignup();
  const { data: balance } = useWalletBalance(userId);
  const createTable = useCreateTable();

  // Use the hooks...
}
```

---

## 📖 Documentation

- **INTEGRATION_GUIDE.md** - Complete usage guide with examples
- **components/examples/ExampleUsage.jsx** - Working demo component

---

## 🎯 Available Hooks

### Queries (GET)
```jsx
useGetMe(userId)
useUserProfile(userId)
useUserStats(userId)
useWalletBalance(userId)
useTransactions(userId, params)
useActiveTables(params)
useTableDetails(tableCode)
useGameDetails(gameId)
useGameHistory(userId, params)
useActiveGame(tableCode)
useGlobalLeaderboard(params)
useUserRank(userId)
useRecentGames(params)
```

### Mutations (POST/PUT)
```jsx
useSignup()
useLogin()
useUpdateProfile()
useDeposit()
useWithdraw()
useCreateTable()
useJoinTable()
useLeaveTable()
useStartGame()
useAddRound()
useCompleteGame()
```

---

## 🔥 Example Usage

```jsx
// Signup
const signup = useSignup();
signup.mutate({ name: "John", mobileNumber: "1234567890" });

// Get balance
const { data } = useWalletBalance(userId);
const balance = data?.data?.balance;

// Deposit money
const deposit = useDeposit();
deposit.mutate({ userId, amount: 1000 });

// Create table
const createTable = useCreateTable();
createTable.mutate({ userId, matchFee: 100 });
```

---

## 🌐 API Base URL

Configured in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Change this for production deployment.

---

## 🎨 Features

✅ Auto-caching with TanStack Query
✅ Automatic refetching on mutations
✅ Loading & error states built-in
✅ Request/Response interceptors
✅ Console logging for debugging
✅ Type-safe API calls

---

## 📝 Next Steps

1. Replace localStorage logic with API calls
2. Update existing components to use hooks
3. Test all flows (signup → deposit → create table → play)
4. Handle loading/error states in UI
5. Deploy backend and update `NEXT_PUBLIC_API_URL`

---

## 🐛 Troubleshooting

**Hook not working?**
- Check if server is running on port 5000
- Check browser console for errors
- Verify `.env.local` has correct API URL

**CORS errors?**
- Server has CORS enabled, should work
- Check server logs for errors

**Data not updating?**
- Mutations auto-invalidate related queries
- Or manually call `refetch()`

---

## 📚 Learn More

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- See `INTEGRATION_GUIDE.md` for detailed examples

---

## 🎉 You're Ready!

Start building with the API integration. All hooks are ready to use!
