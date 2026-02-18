# LedgerNest Mobile App

Expo + React Native client for personal budgets, categories, transactions, and receipt scanning.

## Setup

```bash
cd mobile
npm install
```

Set API base URL:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Run the app:

```bash
npx expo start
```

## Main Flows

### Transactions (Live API)

Transactions screen now uses backend data from `GET /transactions` (no mock rows).

It maps:
- `description` -> title
- `amount` + `type` -> signed amount
- `date` -> relative/locale label
- `category.name/color/icon` -> subtitle + icon badge
- `receiptItem.receipt` -> grouped receipt sections (store/date/total)
- `receiptItemId` absent -> shown under manual entries

### Receipt Scan + Review

1. Tap center FAB in tab bar.
2. Opens `/scan` screen.
3. Choose camera or gallery (`expo-image-picker`).
4. App uploads to `/receipts/upload`.
5. App attempts OCR via `/receipts/:id/process`.
6. Opens `/receipt-review?receiptId=...`.
7. User reviews/edits items and confirms via `/receipts/:id/confirm`.

## Routes

- `/(tabs)/index`
- `/(tabs)/transactions`
- `/(tabs)/budget`
- `/(tabs)/categories`
- `/create-category`
- `/scan`
- `/receipt-review`

## Key Mobile Data Hooks

- `src/hooks/useTransactions.ts`
- `src/hooks/useReceipts.ts`
- `src/hooks/useCategories.ts`

## Key API Clients

- `src/api/endpoints/transactions.ts`
- `src/api/endpoints/receipts.ts`
- `src/api/endpoints/categories.ts`

## Notes

- `expo-image-picker` is required for camera/gallery upload.
- Receipt confirm response shape is:
  - `{ receiptId: string, transactionsCreated: number }`
- Receipt status values handled in mobile:
  - `pending`, `processing`, `processed`, `confirmed`, `error`
