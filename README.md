# LedgerNest Mobile App

Expo + React Native client for personal budgets, categories, transactions, and receipt scanning.

## Setup

```bash
cd mobile
npm install
```

Set API base URL (optional — defaults to local network IP):

```bash
export EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Run the app:

```bash
npx expo start
```

## Main Flows

### Authentication

Full auth flow with persistent secure storage:

- Register with first/last name + email/password
- Login returns `accessToken` (15m JWT) + `refreshToken` (30d opaque)
- Both tokens stored in `expo-secure-store` via Zustand `authStore` (v2)
- Axios interceptor queues concurrent 401s, performs a single refresh, retries all queued requests
- Forgot password → deep-link email → `/reset-password?token=...` screen

### Dashboard & Budgets

Home tab shows budget overview with spending progress. Budget tab supports create, view, and delete.

### Transactions

Transactions screen fetches from `GET /transactions` and maps:
- `description` → title
- `amount` + `type` → signed amount
- `date` → relative/locale label
- `category.name/color/icon` → subtitle + icon badge
- `receiptItem.receipt` → grouped receipt sections (store / date / total)
- `receiptItemId` absent → shown under manual entries

Supports filtering by date range, category, and transaction type.

### Categories

Categories tab lists all default + custom categories. Custom categories can be created via the `/create-category` screen.

### Receipt Scan + Review

1. Tap the center FAB in the tab bar.
2. Opens `/scan` — choose camera or gallery (`expo-image-picker`).
3. Uploads image to `POST /receipts/upload`.
4. Triggers OCR via `POST /receipts/:id/process`.
5. Opens `/receipt-review?receiptId=...`.
6. Review and edit extracted items, then confirm via `POST /receipts/:id/confirm`.

Receipt status values: `pending` → `processing` → `processed` → `confirmed` | `error`

Confirm response: `{ receiptId: string, transactionsCreated: number }`

## Routes

### Auth Group `/(auth)`
- `/(auth)/login` — Login screen
- `/(auth)/register` — Registration screen
- `/(auth)/forgot-password` — Forgot password form
- `/(auth)/reset-password` — Reset password via deep-link token

### Main Tabs `/(tabs)`
- `/(tabs)/index` — Dashboard / home
- `/(tabs)/transactions` — Transactions list with filters
- `/(tabs)/budget` — Budget management
- `/(tabs)/categories` — Category list

### Additional Screens
- `/scan` — Camera / gallery receipt picker
- `/receipt-review` — OCR item review & confirmation
- `/create-category` — Custom category creation
- `/profile` — User profile management

## State Management

### Zustand Stores
- `src/store/authStore.ts` — Auth state machine (v2): holds `accessToken` + `refreshToken` in `SecureStore`, handles login/logout/refresh
- `src/store/settingsStore.ts` — App settings (currency, etc.)

### React Query Hooks
- `src/hooks/useAuth.ts`
- `src/hooks/useBudgets.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/useTransactions.ts`
- `src/hooks/useReceipts.ts`

### Custom Hooks
- `src/hooks/useFilteredTransactions.ts`
- `src/hooks/useTransactionSections.ts`
- `src/hooks/useAppCurrency.ts`

## API Clients

- `src/api/client.ts` — Axios instance with refresh token interceptor
- `src/api/endpoints/auth.ts`
- `src/api/endpoints/budgets.ts`
- `src/api/endpoints/categories.ts`
- `src/api/endpoints/transactions.ts`
- `src/api/endpoints/receipts.ts`

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Expo | 54 |
| UI | React Native | 0.81 |
| Language | TypeScript | 5.9 |
| Navigation | Expo Router | 6 |
| State | Zustand | 5 |
| Server Cache | React Query | 5 |
| HTTP | Axios | 1.13 |
| Secure Storage | expo-secure-store | 15 |
| Styling | NativeWind (Tailwind) | 4 |
| Forms | React Hook Form + Zod | — |
| Charts | react-native-gifted-charts | — |
| Image Picker | expo-image-picker | 17 |
