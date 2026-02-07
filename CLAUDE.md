# CLAUDE.md - VerseAid.ai

## Project Overview

VerseAid.ai is a premium Biblical guidance web application powered by AI. It provides personalized scripture-based answers, daily verses, a prayer journal, community prayer sharing, Bible reading, and a 365-day reading plan. The app uses the Anthropic Claude API for AI-powered features and Stripe for payment processing.

## Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** React 18.2 with hooks (no class components)
- **Build Tool:** Vite 5.0 with `@vitejs/plugin-react`
- **Styling:** Tailwind CSS (loaded via CDN in `index.html`)
- **Icons:** lucide-react 0.263.1
- **Fonts:** Google Fonts — Playfair Display (headings), Inter (body)
- **AI API:** Anthropic Claude (`claude-sonnet-4-20250514`) via direct `fetch` calls
- **Payments:** Stripe (loaded via CDN script)
- **Data Persistence:** Custom `window.storage` API (external platform dependency)
- **Module System:** ES Modules (`"type": "module"` in package.json)

## Project Structure

```
Verse-Aid-app/
├── index.html          # Entry HTML — loads Tailwind CDN + Stripe.js
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite build configuration (output: dist/)
└── src/
    ├── main.jsx        # React root mount with StrictMode
    └── App.jsx         # Entire application (~1,700 lines, single component)
```

The application is a **single-component monolith** — all state, logic, and UI live in `src/App.jsx` as the `BiblicalGuidanceApp` function component.

## Build & Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server (local development)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

There are **no test, lint, or format commands** configured.

## Architecture

### State Management

All state is managed via React `useState` hooks (~30+ state variables) inside the single `BiblicalGuidanceApp` component. There is no Redux, Context, or external state library.

### Navigation / Views

The app uses a `currentView` state variable to switch between six sections:

| View | Render Function | Description |
|------|----------------|-------------|
| `home` | `renderHome()` | AI Q&A interface + daily verse |
| `saved` | `renderSaved()` | Saved AI responses |
| `journal` | `renderJournal()` | Personal prayer journal (premium) |
| `community` | `renderCommunity()` | Shared community prayers (premium) |
| `bible` | `renderBible()` | Browse/read Bible chapters |
| `reading` | `renderReadingPlan()` | 365-day reading plan (premium) |

### Key Functions

| Function | Purpose |
|----------|---------|
| `handleAuth()` | Login/signup authentication |
| `handleSubmit()` | Submit questions to Claude API |
| `checkDailyLimit()` | Enforce 3-question/day limit for free tier |
| `checkFeatureAccess()` | Gate premium features by tier |
| `fetchBibleChapter()` | Fetch Bible text via Claude API |
| `generateDailyVerse()` | Generate daily verse via Claude API |
| `loadUserData()` / `saveUserData()` | Persist/load user data via storage API |
| `addPrayerEntry()` | Add entry to prayer journal |
| `sharePrayerToCommunity()` | Share prayer to community |
| `generateReadingPlan()` | Create 365-day Bible reading schedule |

### Data Persistence

Uses a custom `window.storage` API (provided by the hosting platform, not defined in this repo):

```javascript
await window.storage.get(key, isGlobal)   // Retrieve data
await window.storage.set(key, value, isGlobal)  // Store data
```

- **User-scoped keys:** `saved_{username}`, `journal_{username}`, `completed_readings_{username}`, `user_data_{username}`
- **Global keys:** `community_prayers`, `daily_verse`

### Subscription Tiers

| Tier | Limits | Features |
|------|--------|----------|
| `free` | 3 questions/day | Home, Saved, Bible |
| `premium` | Unlimited | All features |
| `church` | Unlimited | All features (bulk pricing) |

Premium features (journal, community, reading plan) are gated via `checkFeatureAccess()`.

### External API Calls

- **Claude API:** Direct `fetch` to `https://api.anthropic.com/v1/messages` with model `claude-sonnet-4-20250514`. Used for Q&A, daily verses, and Bible chapter text.
- **Stripe:** Checkout redirect via `window.Stripe(STRIPE_PUBLISHABLE_KEY)` for premium subscriptions.

## Code Conventions

### Naming

- **State variables:** camelCase. Booleans prefixed with `is`, `show`, or `loading` (e.g., `isLoggedIn`, `showAuthModal`, `loadingBible`)
- **State setters:** `set` + PascalCase variable name (e.g., `setIsLoggedIn`)
- **Handler functions:** `handle` + action (e.g., `handleAuth`, `handleSubmit`)
- **Render functions:** `render` + view name (e.g., `renderHome`, `renderBible`)
- **Check functions:** `check` + condition (e.g., `checkDailyLimit`, `checkFeatureAccess`)

### Styling

- Tailwind CSS utility classes for all styling
- Dark theme with yellow/amber/orange gradient accents
- Consistent color palette: `gray-900` backgrounds, `yellow-500`/`amber-500` accents
- Inline `style` attributes used only for font-family declarations

### Error Handling

- Try-catch blocks around async operations
- User-facing errors shown via `alert()` or inline `error` state
- Console logging for debugging

### Patterns

- All API calls use `fetch` directly (no Axios or SDK wrapper)
- Async operations inside `useEffect` use immediately-invoked async functions
- Data is loaded on component mount via `useEffect(() => { ... }, [])`

## Important Notes for AI Assistants

1. **Single-file architecture:** The entire app is in `src/App.jsx`. Any feature changes happen in this one file.
2. **No tests exist.** There is no test framework configured. If adding tests, Vitest is the natural choice given Vite.
3. **No linting/formatting.** No ESLint or Prettier configuration exists.
4. **No CI/CD pipeline.** No GitHub Actions or deployment scripts.
5. **External storage dependency:** `window.storage` is injected by the hosting platform — it is not defined in this codebase. Do not attempt to import or define it.
6. **Stripe test keys are hardcoded** in `App.jsx` (line 29-31). These are test/publishable keys, not secret keys.
7. **No `.env` file.** The Claude API key is not in the source code — it is injected by the platform at runtime.
8. **CDN dependencies:** Tailwind CSS and Stripe.js are loaded via CDN `<script>` tags in `index.html`, not via npm.
9. **No router library.** Navigation is handled by a `currentView` state string and conditional rendering.
10. **All Bible content is AI-generated** at request time via Claude API calls, not from a static database.
