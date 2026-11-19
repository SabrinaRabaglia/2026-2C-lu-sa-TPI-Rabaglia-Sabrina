# AI Ticket It — Frontend Build Instructions (for Google Antigravity)

> Paste this whole document into Antigravity as the task brief. Ask it to **produce an implementation plan first**, wait for your approval, and then build **one phase at a time**, stopping at the end of each phase so you can run the app and check it.

---

## 0. Role and ground rules

You are a senior React Native engineer. You are building the **mobile frontend** of **AI Ticket It**, a platform where organizers publish events and buyers purchase tickets. This is a university practical assignment (TPI, 2C 2026). It must run **locally on a phone or emulator** and talk to a **Node + Express backend that keeps its data in memory**.

Rules:

1. **Make a plan before you write code.** List the files you will create and the phases. Wait for approval.
2. **Work in phases** (section 10). At the end of each phase, run the type checker and the app. Stop and report what you did.
3. Use **TypeScript in strict mode**. Do not use `any`. Every API response gets a type.
4. Do **not** add libraries that are not listed in section 1 unless you explain why and ask first.
5. **All user-facing text is in Spanish (Argentina)**, for example "Mis compras", "Comprar entradas", "Cancelar compra". Code, file names, and identifiers are in English.
6. Keep components small and in separate files. A screen file should mostly compose components.
7. Do not invent business rules. If something here is ambiguous, ask me instead of guessing.
8. Explain any non-obvious decision in a short comment. I have to present this code in a video, so it needs to be readable.

---

## 1. Tech stack (fixed)

| Concern | Choice |
|---|---|
| Framework | **Expo** (latest SDK) + React Native, created with `npx create-expo-app@latest` using the TypeScript template |
| Navigation | **Expo Router** (file-based routing, tabs + stacks) |
| Server state | **@tanstack/react-query** (caching, refetching, mutations, invalidation) |
| HTTP | Native `fetch` wrapped in a small `apiClient` |
| Forms | **react-hook-form** + **zod** (`@hookform/resolvers`) |
| Date handling | **date-fns** with the `es` locale |
| Icons | `@expo/vector-icons` (Ionicons) |
| Images | `expo-image` |
| Image picking (create event) | `expo-image-picker` |
| Local session only | `@react-native-async-storage/async-storage`, used **only** to remember the logged-in user id. It is never used for business data. |
| Styling | `StyleSheet` + a central theme file (`src/theme.ts`). No UI kit. |

Run everything with `npx expo start` and test in **Expo Go** on a physical phone or an Android or iOS emulator.

---

## 2. Connecting to the local backend (important)

The backend runs on my computer (for example port `3000`). On a phone, `localhost` points to the phone itself, not my computer. So:

- Read the base URL from `process.env.EXPO_PUBLIC_API_URL`. Add a `.env` file with `EXPO_PUBLIC_API_URL=http://<MY_LAN_IP>:3000` and a `.env.example`.
- Android emulator fallback: `http://10.0.2.2:3000`. iOS simulator fallback: `http://localhost:3000`.
- Put the logic in `src/api/config.ts` and log the chosen URL once in development.
- Remind me in your report that the backend needs `cors()` enabled and must listen on `0.0.0.0`.

### Mock mode (so the frontend is not blocked by the backend)

Create `src/api/mock/` with in-memory seed data and fake handlers that follow the **exact same contract** as section 5. A flag `EXPO_PUBLIC_USE_MOCK=true` switches `apiClient` to the mock layer, with a simulated 300 ms delay. The mock must apply the same business rules (stock limits, cancellation rules, review rules), so switching to the real backend later needs **zero changes in screens**.

---

## 3. Domain model (TypeScript types in `src/types/`)

```ts
export type Role = 'BUYER' | 'ORGANIZER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;           // "Recitales", "Teatro", "Festivales", "Conferencias", "Deportes", ...
  icon: string;           // Ionicons name
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;           // "General", "Platea", "VIP"
  price: number;          // ARS, integer
  capacity: number;       // total quota
  available: number;      // capacity - sold (computed by backend)
}

export interface Event {
  id: string;
  organizerId: string;
  organizer: Pick<User, 'id' | 'name' | 'avatarUrl'> & { rating: number | null; reviewCount: number };
  categoryId: string;
  title: string;
  description: string;
  date: string;           // ISO 8601
  venue: string;
  address: string;
  images: string[];       // URLs; first one is the cover
  ticketTypes: TicketType[];
  minPrice: number;       // lowest ticket price (used for sorting/display)
  isFavorite: boolean;    // relative to the current user
}

export type PurchaseStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'USED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Purchase {
  id: string;
  buyerId: string;
  buyer: Pick<User, 'id' | 'name'>;
  event: Pick<Event, 'id' | 'title' | 'date' | 'venue' | 'images' | 'organizerId'>;
  ticketType: Pick<TicketType, 'id' | 'name' | 'price'>;
  quantity: number;
  total: number;
  status: PurchaseStatus;
  createdAt: string;
  canCancel: boolean;     // computed by backend (see rules)
  canReview: boolean;     // computed by backend (see rules)
  review?: Review;
}

export interface Message {
  id: string;
  purchaseId: string;
  senderId: string;
  senderRole: Role;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  purchaseId: string;
  eventId: string;
  organizerId: string;
  author: Pick<User, 'id' | 'name'>;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}
```

---

## 4. Business rules (the UI must respect these and show them clearly)

1. **Purchase states:** `PENDING_PAYMENT` → `CONFIRMED` → `USED`. From `PENDING_PAYMENT` the purchase can go to `CANCELLED`. From `CONFIRMED` it can go to `REFUNDED`.
2. **Cancellation:** a buyer can cancel only if the status is **not** `USED` (and not already `CANCELLED` or `REFUNDED`) **and the event date has not passed**. Cancelling a `CONFIRMED` purchase sets it to `REFUNDED`. Cancelling a `PENDING_PAYMENT` purchase sets it to `CANCELLED`. Cancelling returns the tickets to the available stock. Use `purchase.canCancel` from the backend. **Do not recompute it**, but hide or disable the button based on it.
3. **Days left:** only for `CONFIRMED` purchases, show "Faltan N días" (use "Es hoy" for 0 and "Mañana" for 1). Use `differenceInCalendarDays(eventDate, today)`.
4. **Reviews:** only when status is `USED` and the purchase has no review yet (`canReview`). Rating 1–5 (required) plus a comment (required, 10–500 chars). One review per purchase.
5. **Buying:** choose exactly one ticket type and a quantity from 1 to `min(available, 10)`. The stepper can never go above `available`. A sold-out type shows "Agotado" and cannot be selected. The total is `price × quantity`. **The backend recalculates the total. The UI value is only a preview.**
6. **Organizer reputation:** the average rating of reviews across *all* the organizer's events. It appears on event cards and the event detail page.
7. **Chat:** available on every purchase, in every status, for both the buyer and the organizer of that event.
8. **Payment** is simulated. After the purchase is created as `PENDING_PAYMENT`, show a "Pagar" button that calls the pay endpoint and sets the status to `CONFIRMED`.
9. **Organizer check-in** (so purchases can reach `USED`): on the organizer's purchase list, a "Marcar como utilizada" action for `CONFIRMED` purchases.

---

## 5. API contract (REST, JSON)

The current user is sent in every request as the header `x-user-id: <id>`. There is no password auth, because the assignment doesn't require it. Errors return `{ "error": string }` with a 4xx or 5xx status. Show `error` to the user in Spanish.

| Method | Path | Purpose |
|---|---|---|
| GET | `/users` | List seeded users (for the login picker) |
| GET | `/categories` | List categories |
| GET | `/events?q=&categoryId=&sort=price\|date\|rating&order=asc\|desc` | Search, filter, sort |
| GET | `/events/:id` | Event detail |
| GET | `/events/:id/reviews` | Reviews of the event's **organizer** (all their events) |
| POST | `/events` | Create event (organizer). Body: event fields + `ticketTypes: {name, price, capacity}[]` |
| POST | `/events/:id/favorite` / DELETE same | Toggle favorite |
| GET | `/me/favorites` | My favorite events |
| GET | `/me/events` | Organizer: my events (with ticket availability) |
| GET | `/events/:id/purchases?status=` | Organizer: purchases for one event |
| POST | `/purchases` | Body `{ eventId, ticketTypeId, quantity }` → `Purchase` (`PENDING_PAYMENT`) |
| GET | `/me/purchases?status=` | Buyer: my purchases |
| GET | `/purchases/:id` | Purchase detail |
| POST | `/purchases/:id/pay` | → `CONFIRMED` |
| POST | `/purchases/:id/cancel` | → `CANCELLED` or `REFUNDED` |
| POST | `/purchases/:id/use` | Organizer → `USED` |
| GET | `/purchases/:id/messages` | Chat history |
| POST | `/purchases/:id/messages` | Body `{ text }` |
| POST | `/purchases/:id/review` | Body `{ rating, comment }` |

Put each resource in its own file in `src/api/` (`events.ts`, `purchases.ts`, ...). Wrap each one in React Query hooks in `src/hooks/` (`useEvents`, `useEvent`, `useCreatePurchase`, ...). After every mutation, **invalidate the correct query keys** (for example, after a cancel, invalidate `['purchases']`, `['purchase', id]`, and `['event', eventId]` so stock updates).

---

## 6. Folder structure

```
app/
  _layout.tsx                 # QueryClientProvider, SessionProvider, theme
  login.tsx                   # pick a seeded user
  (buyer)/
    _layout.tsx               # Tabs: Explorar, Favoritos, Mis compras, Perfil
    index.tsx                 # Explore / search
    favorites.tsx
    purchases/index.tsx
    profile.tsx
  (organizer)/
    _layout.tsx               # Tabs: Mis eventos, Crear, Perfil
    index.tsx
    create.tsx
    profile.tsx
  event/[id].tsx              # shared detail
  event/[id]/buy.tsx          # buyer checkout
  event/[id]/sales.tsx        # organizer: purchases for this event
  purchase/[id].tsx           # purchase detail (both roles)
  purchase/[id]/chat.tsx
  purchase/[id]/review.tsx
src/
  api/        config.ts, client.ts, events.ts, purchases.ts, ..., mock/
  hooks/      React Query hooks
  components/ EventCard, StatusBadge, TicketTypeSelector, QuantityStepper,
              SearchBar, CategoryChips, SortSheet, RatingStars, ReviewItem,
              MessageBubble, ChatInput, EmptyState, ErrorState, LoadingState,
              PrimaryButton, DaysLeftPill, StockBar
  context/    SessionContext.tsx
  lib/        format.ts (currency ARS, dates es-AR), purchaseStatus.ts
  types/
  theme.ts
```

Use role-based routing. After login, send buyers to `(buyer)` and organizers to `(organizer)`. Guard the groups in their `_layout.tsx`.

---

## 7. Screens and acceptance criteria (one per use case)

### Login (`/login`)
- List the users from `/users`, grouped by "Compradores" and "Organizadores". Tapping one saves the id and routes by role. Profile includes "Cerrar sesión".

### UC-3 + UC-11: Explore, search, categories, sort (buyer home)
- A sticky `SearchBar` with a **300 ms debounce** that sends `q`.
- Horizontal `CategoryChips` with "Todas" first. Tapping a selected chip clears it.
- A sort button opens a bottom sheet (a plain `Modal`) with: Precio (menor a mayor / mayor a menor), Fecha (más próximos / más lejanos), and Puntaje del organizador (mejor primero).
- Results in a `FlatList` of `EventCard`: cover image, category, title, formatted date ("sáb 12 dic · 21:00"), venue, "Desde $ 15.000", organizer name with ★ rating (or "Sin reseñas"), and a favorite heart.
- Pull-to-refresh, loading skeletons, an empty state ("No encontramos eventos para tu búsqueda"), and an error state with "Reintentar".

### Event detail (`/event/[id]`)
- An image carousel (horizontal paging `FlatList`), title, date, venue + address, and description.
- The ticket types list shows the name, price, and "Quedan N" or "Agotado".
- An organizer block with average rating and review count. Below it, the **UC-10 reviews list** (`RatingStars`, author, date, comment). Show 3 and add "Ver todas".
- Buyer: a sticky "Comprar entradas" button. Organizer who owns the event: a "Ver ventas" button instead.

### UC-12: Buy (`/event/[id]/buy`)
- `TicketTypeSelector` (radio cards) and a `QuantityStepper` that stops at `min(available, 10)`. Show a hint like "Máximo disponible: N".
- A live total. A confirm button creates the purchase, then navigates to `/purchase/[id]`, where the "Pagar" button lives.
- If the backend rejects the purchase because of stock (a race condition), show the error and refetch the event.

### UC-1: My purchases (buyer)
- Segmented filter: Todas / Pendientes / Confirmadas / Utilizadas / Canceladas-Reembolsadas.
- Each row shows the event cover, title, date, ticket type × quantity, total, a **`StatusBadge`** (color + icon + label, see section 8), and for `CONFIRMED` a **`DaysLeftPill`** ("Faltan 5 días").
- Sort upcoming events first.

### Purchase detail (`/purchase/[id]`), shared
- Summary, a status timeline, and actions based on role and flags:
  - Buyer: "Pagar" (`PENDING_PAYMENT`), "Cancelar compra" (if `canCancel`, with a confirmation `Alert` that explains whether a refund applies), "Calificar evento" (if `canReview`), and the existing review if there is one.
  - Organizer: "Marcar como utilizada" (`CONFIRMED`).
  - Both: "Abrir chat".

### UC-5 + UC-6: Chat (`/purchase/[id]/chat`)
- An inverted `FlatList` of `MessageBubble`. My messages go on the right with the primary color, the other party's go on the left, with time and the sender role ("Organizador" / "Comprador").
- `ChatInput` inside `KeyboardAvoidingView`. Send is disabled when the input is empty.
- **Optimistic update** when sending.
- Poll every 5 s with React Query `refetchInterval` while the screen is focused (`useFocusEffect` / `useIsFocused`). WebSockets aren't required.
- **Enter-to-send must ignore IME composition** (`nativeEvent.isComposing`).

### UC-9: Review (`/purchase/[id]/review`)
- Tappable 1–5 stars and a multiline comment, validated with zod. On success, go back and invalidate the purchase and event reviews.

### UC-4: Create event (organizer, `create.tsx`)
- A react-hook-form + zod form with: title, description, category (picker), date + time, venue, address, and images (`expo-image-picker`, up to 5, with thumbnails and remove). Images can be sent as URLs or base64. Ask me which format the backend expects.
- A dynamic **ticket types** list (`useFieldArray`) with at least 1. Each has a name, price (> 0), and capacity (integer > 0). Add / remove rows. Duplicate names aren't allowed.
- The date must be in the future.
- On submit, POST, then navigate to the new event's detail.

### UC-2: Organizer sales per event (`/event/[id]/sales`)
- Header: for each ticket type, a **`StockBar`** showing sold vs capacity, with "Quedan N de M".
- Status counters (chips with counts per status) that also act as filters.
- A list of purchases: buyer name, ticket type × quantity, total, `StatusBadge`, date, a chat shortcut, and "Marcar como utilizada" for confirmed ones.

### Organizer home (`(organizer)/index.tsx`)
- A list of my events with date, total sold / total capacity, and a tap to go to sales.

### Favorites (buyer)
- Same `EventCard` list, sourced from `/me/favorites`. The heart toggle uses an optimistic update.

---

## 8. Visual design

- **Mood:** modern, clean, nightlife or event energy without being loud. Use a light background with one strong accent.
- **Palette** (defined in `theme.ts`, never hardcoded in components):
  - `primary` `#5B2EFF` (electric violet), `primaryText` `#FFFFFF`
  - `background` `#F7F7FA`, `surface` `#FFFFFF`, `border` `#E6E6EE`
  - `text` `#14141F`, `textMuted` `#6B6B7B`
  - `accent` `#FF4D6D` (favorites, highlights)
- **Status colors** (always shown with **icon + text**, never color alone):
  - `PENDING_PAYMENT`: amber `#B45309` on `#FEF3C7`, icon `time-outline`, "Pendiente de pago"
  - `CONFIRMED`: green `#047857` on `#D1FAE5`, `checkmark-circle-outline`, "Confirmada"
  - `USED`: blue `#1D4ED8` on `#DBEAFE`, `ticket-outline`, "Utilizada"
  - `CANCELLED`: gray `#4B5563` on `#F3F4F6`, `close-circle-outline`, "Cancelada"
  - `REFUNDED`: violet `#6D28D9` on `#EDE9FE`, `return-down-back-outline`, "Reembolsada"
  - Keep these in `src/lib/purchaseStatus.ts` as the single source of truth.
- **Typography:** the system font. Sizes 12 / 14 / 16 / 20 / 28, with weights 400 / 600 / 700.
- **Spacing scale:** 4, 8, 12, 16, 24, 32. Card radius 16, button radius 12.
- Cards have subtle shadows (`elevation: 2` on Android).
- **Currency:** `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })`.
- Support **safe areas** (`react-native-safe-area-context`) and both small (360 px) and large phones.

## 9. Accessibility and quality

- Every touchable has `accessibilityRole` and `accessibilityLabel` (for example "Agregar a favoritos", "Aumentar cantidad").
- Minimum touch target is 44×44. Text contrast is at least 4.5:1.
- Every data screen has **loading, empty, and error** states.
- Disable buttons while a mutation is pending, and show an `ActivityIndicator` inside them.
- Never trust client-side totals or availability. Always refetch after mutations.
- There must be no warnings in the Metro console. `npx tsc --noEmit` must pass.

---

## 10. Phases (stop after each one)

1. **Setup:** Expo + TS + Expo Router, theme, API client, config with LAN URL, mock layer with seed data (2 organizers, 3 buyers, 6 categories, 8–10 events with 2–3 ticket types each, purchases in every status, some messages and reviews), session + login + role-based tabs.
2. **Explore:** search, categories, sort, event cards, event detail with reviews, favorites.
3. **Buy flow:** ticket selection, quantity stepper with stock limit, create purchase, pay, purchase detail.
4. **My purchases:** list with status badges, days left, filters, cancellation with rules.
5. **Chat:** for both roles, with polling and optimistic send.
6. **Reviews:** create a review after `USED`, and show it on the event and organizer.
7. **Organizer:** create event with dynamic ticket types, my events, sales per event with stock bars, status counters, mark as used.
8. **Switch to real backend:** set `EXPO_PUBLIC_USE_MOCK=false`, test every flow against the Express server, and fix contract mismatches by **adapting the API layer only**.

At the end of each phase, report: files created or changed, how to test the phase manually (the steps to tap through), and any open questions.

---

## 11. Definition of done

- All 12 use cases in section 7 can be shown end-to-end on a phone.
- The app switches between mock and real backend with only an env variable.
- Buyer test flow: login as a buyer → search "rock" → filter "Recitales" → sort by price → open an event → buy 2 "Platea" → pay → see "Faltan N días" in Mis compras → chat with the organizer → cancel → see "Reembolsada" and the stock restored.
- Organizer test flow: login as an organizer → create an event with 3 ticket types → see sales → reply in chat → mark a purchase as used → the buyer reviews it → the rating appears on the event.
