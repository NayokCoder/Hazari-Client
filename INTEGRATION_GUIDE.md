# API Integration Guide

## Setup Complete! ✅

Your client is now fully integrated with Axios and TanStack Query.

---

## 📂 Project Structure

```
Client/
├── lib/api/
│   ├── config.js              # API base URL and endpoints
│   ├── axios.js               # Axios instance with interceptors
│   ├── authService.js         # Auth API calls
│   ├── userService.js         # User API calls
│   ├── walletService.js       # Wallet API calls
│   ├── tableService.js        # Table API calls
│   ├── gameService.js         # Game API calls
│   ├── leaderboardService.js  # Leaderboard API calls
│   └── index.js               # Export all services
├── hooks/api/
│   ├── useAuth.js             # Auth hooks (signup, login)
│   ├── useUser.js             # User hooks (profile, stats)
│   ├── useWallet.js           # Wallet hooks (deposit, withdraw)
│   ├── useTable.js            # Table hooks (create, join)
│   ├── useGame.js             # Game hooks (start, rounds)
│   ├── useLeaderboard.js      # Leaderboard hooks
│   └── index.js               # Export all hooks
├── providers/
│   └── ReactQueryProvider.jsx # TanStack Query setup
└── .env.local                 # Environment variables
```

---

## 🚀 How to Use

### 1. Environment Setup

Your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Make sure the server is running on port 5000!

---

### 2. Using Hooks in Components

#### Authentication Example

```jsx
"use client";

import { useSignup, useLogin } from "@/hooks/api";

export default function AuthPage() {
  const signup = useSignup();
  const login = useLogin();

  const handleSignup = () => {
    signup.mutate(
      {
        name: "John Doe",
        mobileNumber: "1234567890",
      },
      {
        onSuccess: (data) => {
          console.log("User created:", data.data.user);
          // Redirect to dashboard
        },
        onError: (error) => {
          alert(error.message);
        },
      }
    );
  };

  return (
    <button onClick={handleSignup} disabled={signup.isPending}>
      {signup.isPending ? "Creating account..." : "Sign Up"}
    </button>
  );
}
```

#### Wallet Example

```jsx
"use client";

import { useWalletBalance, useDeposit } from "@/hooks/api";

export default function WalletPage({ userId }) {
  const { data: balanceData, isLoading } = useWalletBalance(userId);
  const deposit = useDeposit();

  const handleDeposit = () => {
    deposit.mutate({
      userId,
      amount: 1000,
      description: "Initial deposit",
    });
  };

  if (isLoading) return <div>Loading balance...</div>;

  return (
    <div>
      <h2>Balance: ₹{balanceData?.data?.balance || 0}</h2>
      <button onClick={handleDeposit} disabled={deposit.isPending}>
        {deposit.isPending ? "Depositing..." : "Deposit ₹1000"}
      </button>
    </div>
  );
}
```

#### Create Table Example

```jsx
"use client";

import { useCreateTable } from "@/hooks/api";
import { useRouter } from "next/navigation";

export default function CreateTableButton({ userId }) {
  const router = useRouter();
  const createTable = useCreateTable();

  const handleCreate = () => {
    createTable.mutate(
      {
        userId,
        matchFee: 100,
      },
      {
        onSuccess: (data) => {
          const tableCode = data.data.table.tableCode;
          router.push(`/table/${tableCode}`);
        },
      }
    );
  };

  return (
    <button onClick={handleCreate} disabled={createTable.isPending}>
      {createTable.isPending ? "Creating..." : "Create Table (₹100)"}
    </button>
  );
}
```

#### User Stats Example

```jsx
"use client";

import { useUserStats } from "@/hooks/api";

export default function UserStatsCard({ userId }) {
  const { data, isLoading, error } = useUserStats(userId);

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error loading stats</div>;

  const stats = data?.data?.stats;

  return (
    <div>
      <p>Balance: ₹{stats.balance}</p>
      <p>Games Won: {stats.gamesWon}</p>
      <p>Games Played: {stats.gamesPlayed}</p>
      <p>Win Rate: {stats.winRate}%</p>
    </div>
  );
}
```

#### Leaderboard Example

```jsx
"use client";

import { useGlobalLeaderboard } from "@/hooks/api";

export default function LeaderboardPage() {
  const { data, isLoading } = useGlobalLeaderboard({
    limit: 50,
    sortBy: "totalWinnings",
  });

  if (isLoading) return <div>Loading leaderboard...</div>;

  const leaderboard = data?.data?.leaderboard || [];

  return (
    <div>
      <h1>Leaderboard</h1>
      {leaderboard.map((player) => (
        <div key={player.userId}>
          <span>#{player.rank}</span>
          <span>{player.name}</span>
          <span>₹{player.totalWinnings}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔥 Available Hooks

### Authentication
- `useSignup()` - Register new user
- `useLogin()` - Login user
- `useGetMe(userId)` - Get current user

### User
- `useUserProfile(userId)` - Get user profile
- `useUserStats(userId)` - Get user statistics
- `useUpdateProfile()` - Update profile

### Wallet
- `useWalletBalance(userId)` - Get wallet balance
- `useDeposit()` - Deposit money
- `useWithdraw()` - Withdraw money
- `useTransactions(userId, params)` - Get transaction history

### Table
- `useCreateTable()` - Create new table
- `useActiveTables(params)` - Get active tables
- `useTableDetails(tableCode)` - Get table details
- `useJoinTable()` - Join table
- `useLeaveTable()` - Leave table

### Game
- `useStartGame()` - Start game
- `useGameDetails(gameId)` - Get game details
- `useAddRound()` - Add round
- `useCompleteGame()` - Complete game
- `useGameHistory(userId, params)` - Get game history
- `useActiveGame(tableCode)` - Get active game

### Leaderboard
- `useGlobalLeaderboard(params)` - Get leaderboard
- `useUserRank(userId)` - Get user rank
- `useRecentGames(params)` - Get recent games

---

## 📊 Hook Patterns

### Queries (GET requests)
```jsx
const { data, isLoading, error, refetch } = useHookName(params);
```

### Mutations (POST/PUT requests)
```jsx
const mutation = useMutationHook();

mutation.mutate(data, {
  onSuccess: (data) => { /* ... */ },
  onError: (error) => { /* ... */ }
});

// Check status
mutation.isPending
mutation.isSuccess
mutation.isError
```

---

## 🎯 Migration from localStorage

### Before (localStorage):
```jsx
const user = JSON.parse(localStorage.getItem("hazari-current-user"));
```

### After (API):
```jsx
const { data } = useUserProfile(userId);
const user = data?.data?.user;
```

---

## 🔄 Auto-Refetching

TanStack Query automatically refetches data when:
- Component mounts
- Window refocuses (disabled in our config)
- Network reconnects
- You call `refetch()`

Manual refetch:
```jsx
const { data, refetch } = useWalletBalance(userId);

// Refetch manually
<button onClick={() => refetch()}>Refresh Balance</button>
```

---

## 🎨 Loading & Error States

```jsx
const { data, isLoading, error, isError } = useHookName();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <div>{/* Render data */}</div>;
```

---

## 🚨 Error Handling

All errors are automatically logged in the console. You can also handle them:

```jsx
const mutation = useMutationHook();

mutation.mutate(data, {
  onError: (error) => {
    alert(error.message || "Something went wrong");
  }
});
```

---

## 🔐 Important Notes

1. **User ID Storage**: Store user ID in localStorage after login/signup:
   ```jsx
   localStorage.setItem("hazari-current-user", JSON.stringify(user));
   ```

2. **Server Must Be Running**: Make sure the backend is running on `http://localhost:5000`

3. **Query Keys**: Each query has a unique key for caching:
   - `["user", "profile", userId]`
   - `["wallet", "balance", userId]`
   - `["table", tableCode]`

4. **Automatic Cache Invalidation**: After mutations, related queries are automatically refetched

---

## 🧪 Testing the Integration

1. **Start the server:**
   ```bash
   cd Server
   npm start
   ```

2. **Start the client:**
   ```bash
   cd Client
   npm run dev
   ```

3. **Test signup:**
   - Use `useSignup()` hook
   - Check if user is created in MongoDB
   - Verify localStorage is updated

4. **Test wallet:**
   - Use `useDeposit()` to add money
   - Check `useWalletBalance()` updates automatically

---

## 📚 Example Component

See `components/examples/` for full working examples of:
- Authentication flow
- Wallet operations
- Table creation & joining
- Game management

---

## 🎉 You're All Set!

Your client is now fully integrated with the backend API. Start replacing localStorage calls with these hooks!

**Happy Coding! 🚀**
