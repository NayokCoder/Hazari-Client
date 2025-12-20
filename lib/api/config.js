// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH_SIGNUP: "/api/auth/signup",
    AUTH_LOGIN: "/api/auth/login",
    AUTH_ME: "/api/auth/me",

    // Users
    USERS: "/api/users",
    USER_STATS: (id) => `/api/users/${id}/stats`,
    USER_PROFILE: (id) => `/api/users/${id}`,

    // Wallet
    WALLET_BALANCE: (userId) => `/api/wallet/${userId}`,
    WALLET_DEPOSIT: "/api/wallet/deposit",
    WALLET_WITHDRAW: "/api/wallet/withdraw",
    WALLET_TRANSACTIONS: (userId) => `/api/wallet/${userId}/transactions`,

    // Tables
    TABLES: "/api/tables",
    TABLE_DETAILS: (tableCode) => `/api/tables/${tableCode}`,
    TABLE_JOIN: (tableCode) => `/api/tables/${tableCode}/join`,
    TABLE_LEAVE: (tableCode) => `/api/tables/${tableCode}/leave`,
    TABLE_RESET: (tableCode) => `/api/tables/${tableCode}/reset`,

    // Games
    GAMES: "/api/games",
    GAME_DETAILS: (gameId) => `/api/games/${gameId}`,
    GAME_ROUNDS: (gameId) => `/api/games/${gameId}/rounds`,
    GAME_EDIT_ROUND: (gameId, roundNumber) => `/api/games/${gameId}/rounds/${roundNumber}`,
    GAME_COMPLETE: (gameId) => `/api/games/${gameId}/complete`,
    GAME_HISTORY: (userId) => `/api/games/history/${userId}`,
    GAME_ACTIVE: (tableCode) => `/api/games/table/${tableCode}/active`,

    // Leaderboard
    LEADERBOARD: "/api/leaderboard",
    LEADERBOARD_USER: (userId) => `/api/leaderboard/user/${userId}`,
    LEADERBOARD_RECENT: "/api/leaderboard/recent-games",

    // Invitations
    INVITATIONS: "/api/invitations",
    INVITATIONS_USER: (playerId) => `/api/invitations/user/${playerId}`,
    INVITATIONS_TABLE: (tableCode) => `/api/invitations/table/${tableCode}`,
    INVITATION_ACCEPT: (invitationId) => `/api/invitations/${invitationId}/accept`,
    INVITATION_REJECT: (invitationId) => `/api/invitations/${invitationId}/reject`,
  },
};

export default API_CONFIG;
