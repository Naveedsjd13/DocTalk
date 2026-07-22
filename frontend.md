# Frontend Documentation — DocTalk

React + Vite SPA for chatting with PDF documents. Users upload PDFs, ask questions, and get answers with page citations.

---

## Root Files

### `package.json`

- Project dependencies and scripts
- Key deps: React 19, React Router, TanStack Query, Tailwind CSS, shadcn/ui
- Scripts: `dev` (Vite dev server), `build` (production), `lint` (ESLint), `format` (Prettier)

### `vite.config.js`

- Vite build config with `@` path alias pointing to `./src`

### `eslint.config.js`

- ESLint config for React hooks rules

### `components.json`

- shadcn/ui configuration (New York style, Lucide icons)

### `.prettierrc` / `.prettierignore`

- Prettier formatter settings

---

## `src/` — Main Source

### `main.jsx`

- React app entry point. Renders `<App />` into the DOM.

### `App.jsx`

- Root component. Sets up:
  - `QueryClientProvider` (TanStack Query for server state)
  - `ThemeProvider` (dark/light mode)
  - `BrowserRouter` + `Routes` (React Router)
  - `AuthProvider` (auth context)
- **Routes:**
  - `/` → Landing page
  - `/login` → Login
  - `/signup` → Signup
  - `/dashboard` → Dashboard (inside AppLayout)
  - `/recent` → Recent documents
  - `/starred` → Starred documents
  - `/trash` → Trashed documents
  - `/upload` → Upload PDF
  - `/settings` → User settings
  - `/documents/:id` → Document viewer + chat
  - `*` → 404 page

### `styles.css`

- Global CSS with Tailwind directives and custom theme (dark/light colors, custom fonts)

---

## `src/routes/` — Page Components

### `index.jsx`

- Landing page (public marketing page)
- Sections: Nav, Hero, PullQuote, Walkthrough (how it works), CitationsFeature, FeatureGrid, UseCases, FinalCta, Footer
- Uses `useTheme()` for dark/light toggle

### `login.jsx`

- Login form (email + password)
- Calls `useAuth().login()` to authenticate
- Redirects to `/dashboard` on success

### `signup.jsx`

- Signup form (name + email + password)
- Calls `useAuth().signup()` to register
- Redirects to `/dashboard` on success

### `AppLayout.jsx`

- Shared layout wrapper for all authenticated pages
- Shows loading spinner while checking auth
- Redirects to `/login` if not logged in
- Renders `AppSidebar` + `<Outlet />` for child routes

### `Dashboard.jsx`

- Main dashboard after login
- Shows stat cards (Documents, Storage, Questions)
- Lists recent documents using `DocCard` components
- Empty state when no documents exist
- "Upload a PDF" button

### `RecentPage.jsx`

- Lists all recent (non-trashed) documents
- Search bar to filter by title
- Sort dropdown (Last opened, Name, Size)
- Grid/List view toggle
- Uses `DocCard` components

### `StarredPage.jsx`

- Shows starred (favorited) documents
- Filters mock docs where `starred === true`
- Empty state when no starred docs

### `TrashPage.jsx`

- Shows trashed/deleted documents
- Info banner about auto-deletion after 30 days
- Uses `DocCard` with `variant="trashed"`

### `UploadPage.jsx`

- PDF upload with drag & drop
- Simulated upload progress (idle → uploading → done)
- On completion: "Open document" link + "Upload another" button

### `SettingsPage.jsx`

- User settings with tabs:
  - Profile (edit name/email)
  - Appearance (dark/light toggle)
  - Pricing & Billing (Free vs Pro plans)
  - Account (change password, export data, delete account)

### `DocumentChat.jsx`

- **Core feature page** — Split view: PDF viewer + AI chat
- PDF viewer with page navigation, zoom controls (50%-200%)
- Chat panel with:
  - Context strip showing active documents
  - Suggested starter questions
  - Message history with user/assistant messages
  - Streaming text simulation for AI responses
  - Page citation buttons that jump to cited pages
  - Textarea input with send button
- Resizable chat panel (drag divider)
- Mobile: chat as overlay

---

## `src/components/` — Reusable Components

### `app-sidebar.jsx`

- Left sidebar navigation
- Desktop: Fixed 256px sidebar
- Mobile: Hamburger menu → drawer overlay
- Nav links: Dashboard, Upload PDF, Recent, Starred, Trash, Settings
- Highlights active route

### `top-bar.jsx`

- Sticky top header with backdrop blur
- Shows page title + theme toggle + user avatar dropdown
- User menu: email, Profile, Billing, Log out

### `doc-card.jsx`

- Card for displaying a document
- Shows icon, title, metadata (last opened, pages, size)
- Star indicator + context menu (Open, Rename, Star/Unstar, Delete)
- Trashed variant: restore/delete permanently options

### `auth-shell.jsx`

- Shared layout for login/signup pages
- Centers content, shows logo, card with title/subtitle/form/footer
- Exports: `AuthShell`, `FieldLabel`, `TextInput`, `PrimaryButton`

---

## `src/lib/` — Utilities & Services

### `api.js`

- API client for backend requests
- `request(path, options)` — Base fetch wrapper with auth token header
- Exports: `api.get()`, `api.post()`, `api.patch()`, `api.del()`
- Adds `Bearer` token from localStorage automatically

### `auth-context.jsx`

- React context for authentication state
- `AuthProvider` wraps app, provides: `user`, `loading`, `login()`, `signup()`, `logout()`
- Checks `/api/auth/me` on mount to restore session
- `useAuth()` hook to access auth state

### `mock-docs.js`

- Mock document data for development
- `Doc` type definition
- `mockDocs` array of 8 sample documents
- `docById(id)` — Find document by ID

### `theme.jsx`

- Dark/light theme management
- `ThemeProvider` — React context provider
- Persists to `localStorage` under `doctalk-theme`
- Adds `dark`/`light` class to `<html>` element
- `useTheme()` hook returns `{ theme, toggle }`

### `utils.js`

- `cn(...inputs)` — Merges Tailwind CSS classes using `clsx` + `tailwind-merge`

---

## `src/hooks/` — Custom React Hooks

### `use-mobile.jsx`

- Detects mobile viewport (< 768px)
- Returns boolean via `useIsMobile()` hook

---

## `src/components/ui/` — shadcn/ui Components (46 files)

All standard shadcn/ui components built on Radix UI primitives:

| Component             | Purpose                         |
| --------------------- | ------------------------------- |
| `accordion.jsx`       | Collapsible sections            |
| `alert.jsx`           | Alert banners                   |
| `alert-dialog.jsx`    | Confirmation dialogs            |
| `aspect-ratio.jsx`    | Maintain aspect ratio           |
| `avatar.jsx`          | User avatar display             |
| `badge.jsx`           | Status/label badges             |
| `breadcrumb.jsx`      | Navigation breadcrumbs          |
| `button.jsx`          | Styled button variants          |
| `calendar.jsx`        | Date picker                     |
| `card.jsx`            | Card container                  |
| `carousel.jsx`        | Image carousel                  |
| `chart.jsx`           | Chart wrapper (Recharts)        |
| `checkbox.jsx`        | Checkbox input                  |
| `collapsible.jsx`     | Collapsible content             |
| `command.jsx`         | Command palette (cmdk)          |
| `context-menu.jsx`    | Right-click menu                |
| `dialog.jsx`          | Modal dialog                    |
| `drawer.jsx`          | Bottom drawer (Vaul)            |
| `dropdown-menu.jsx`   | Dropdown menu                   |
| `form.jsx`            | Form handling (react-hook-form) |
| `hover-card.jsx`      | Hover popup card                |
| `input.jsx`           | Text input                      |
| `input-otp.jsx`       | OTP input                       |
| `label.jsx`           | Form label                      |
| `menubar.jsx`         | App menu bar                    |
| `navigation-menu.jsx` | Navigation menu                 |
| `pagination.jsx`      | Page navigation                 |
| `popover.jsx`         | Click popover                   |
| `progress.jsx`        | Progress bar                    |
| `radio-group.jsx`     | Radio buttons                   |
| `resizable.jsx`       | Resizable panels                |
| `scroll-area.jsx`     | Custom scrollbar                |
| `select.jsx`          | Dropdown select                 |
| `separator.jsx`       | Visual divider                  |
| `sheet.jsx`           | Side panel overlay              |
| `sidebar.jsx`         | Sidebar layout                  |
| `skeleton.jsx`        | Loading placeholder             |
| `slider.jsx`          | Range slider                    |
| `sonner.jsx`          | Toast notifications             |
| `switch.jsx`          | Toggle switch                   |
| `table.jsx`           | Data table                      |
| `tabs.jsx`            | Tab navigation                  |
| `textarea.jsx`        | Multi-line input                |
| `toggle.jsx`          | Toggle button                   |
| `toggle-group.jsx`    | Toggle button group             |
| `tooltip.jsx`         | Hover tooltip                   |

---

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query + React Context
- **Language:** JavaScript (JSX)
