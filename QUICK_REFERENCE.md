# Quick Reference - API Hooks

## 🔐 Authentication

```jsx
import { useSignup, useLogin, useGetMe } from "@/hooks/api";

// Signup
const signup = useSignup();
signup.mutate({ name: "John", mobileNumber: "1234567890" });

// Login
const login = useLogin();
login.mutate({ mobileNumber: "1234567890" });

// Get current user
const { data } = useGetMe(userId);
```

---

## 👤 User

```jsx
import { useUserProfile, useUserStats, useUpdateProfile } from "@/hooks/api";

// Get profile
const { data } = useUserProfile(userId);

// Get stats
const { data: stats } = useUserStats(userId);

// Update profile
const update = useUpdateProfile();
update.mutate({ userId, data: { name: "New Name" } });
```

---

## 💰 Wallet

```jsx
import { useWalletBalance, useDeposit, useWithdraw, useTransactions } from "@/hooks/api";

// Get balance
const { data } = useWalletBalance(userId);

// Deposit
const deposit = useDeposit();
deposit.mutate({ userId, amount: 1000, description: "Deposit" });

// Withdraw
const withdraw = useWithdraw();
withdraw.mutate({ userId, amount: 500, description: "Withdrawal" });

// Transactions
const { data } = useTransactions(userId, { limit: 20 });
```

---

## 🎲 Tables

```jsx
import { useCreateTable, useActiveTables, useTableDetails, useJoinTable, useLeaveTable } from "@/hooks/api";

// Create table
const create = useCreateTable();
create.mutate({ userId, matchFee: 100 });

// Get active tables
const { data } = useActiveTables({ status: "waiting", limit: 20 });

// Get table details
const { data } = useTableDetails(tableCode);

// Join table
const join = useJoinTable();
join.mutate({ tableCode, userId });

// Leave table
const leave = useLeaveTable();
leave.mutate({ tableCode, userId });
```

---

## 🎮 Games

```jsx
import { useStartGame, useAddRound, useCompleteGame, useGameDetails, useGameHistory, useActiveGame } from "@/hooks/api";

// Start game
const start = useStartGame();
start.mutate({ tableCode });

// Add round
const addRound = useAddRound();
addRound.mutate({
  gameId,
  roundData: {
    players: [
      { userId: "...", name: "P1", points: 90 },
      { userId: "...", name: "P2", points: 90 },
      { userId: "...", name: "P3", points: 90 },
      { userId: "...", name: "P4", points: 90 },
    ],
  },
});

// Complete game
const complete = useCompleteGame();
complete.mutate(gameId);

// Get game details
const { data } = useGameDetails(gameId);

// Get history
const { data } = useGameHistory(userId, { limit: 10 });

// Get active game
const { data } = useActiveGame(tableCode);
```

---

## 🏆 Leaderboard

```jsx
import { useGlobalLeaderboard, useUserRank, useRecentGames } from "@/hooks/api";

// Global leaderboard
const { data } = useGlobalLeaderboard({ limit: 50, sortBy: "totalWinnings" });

// User rank
const { data } = useUserRank(userId);

// Recent games
const { data } = useRecentGames({ limit: 20 });
```

---

## 📊 Hook Response Pattern

### Queries (GET)
```jsx
const { data, isLoading, error, isError, refetch } = useQueryHook(params);

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error.message}</div>;

const result = data?.data; // Access nested data
```

### Mutations (POST/PUT)
```jsx
const mutation = useMutationHook();

mutation.mutate(data, {
  onSuccess: (response) => {
    console.log("Success:", response);
  },
  onError: (error) => {
    console.error("Error:", error);
  },
});

// Status
mutation.isPending  // true when loading
mutation.isSuccess  // true when successful
mutation.isError    // true when failed
```

---

## 🎯 Common Patterns

### Get user balance and display
```jsx
const { data, isLoading } = useWalletBalance(userId);

if (isLoading) return <span>Loading...</span>;

return <span>₹{data?.data?.balance || 0}</span>;
```

### Deposit with loading state
```jsx
const deposit = useDeposit();

<button
  onClick={() => deposit.mutate({ userId, amount: 1000 })}
  disabled={deposit.isPending}
>
  {deposit.isPending ? "Depositing..." : "Deposit ₹1000"}
</button>
```

### Create table and redirect
```jsx
const router = useRouter();
const create = useCreateTable();

const handleCreate = () => {
  create.mutate(
    { userId, matchFee: 100 },
    {
      onSuccess: (data) => {
        const tableCode = data.data.table.tableCode;
        router.push(`/table/${tableCode}`);
      },
    }
  );
};
```

---

## 🔄 Manual Refetch

```jsx
const { data, refetch } = useWalletBalance(userId);

<button onClick={() => refetch()}>
  Refresh Balance
</button>
```

---

## 🚨 Error Handling

```jsx
const mutation = useMutationHook();

mutation.mutate(data, {
  onError: (error) => {
    // error.message contains the error message
    alert(error.message || "Something went wrong");
  },
});
```

---

## ✅ That's It!

All hooks follow the same pattern. Import, use, and go! 🚀
