# Frontend Documentation — DocTalk

DocTalk is a PDF chat app built with React + TanStack Start + Tailwind CSS. Users upload PDFs, ask questions, and get answers with exact page citations.

---

## Root Files

### `package.json`

- **Purpose:** Project dependencies and scripts
- **Key dependencies:** React 19, TanStack Router/Start, Radix UI, Tailwind CSS 4, Recharts, Zod, Vaul, Sonner
- **Scripts:**
  - `npm run dev` — Start dev server
  - `npm run build` — Production build
  - `npm run lint` — Run ESLint
  - `npm run format` — Run Prettier

### `vite.config.ts`

- **Purpose:** Vite build config using Lovable's TanStack plugin
- **What it does:** Configures TanStack Start with server entry at `src/server.ts`

### `tsconfig.json`

- **Purpose:** TypeScript settings
- **Key points:** ES2022 target, React JSX, bundler mode, `@/*` path alias pointing to `./src/*`

### `components.json`

- **Purpose:** shadcn/ui configuration
- **Style:** New York theme, Lucide icons, no RSC (client-side only)

### `eslint.config.js`

- **Purpose:** ESLint config
- **What it does:** Enforces TypeScript + React hooks rules, integrates Prettier, ignores `dist/.output/.vinxi`

### `.prettierrc` / `.prettierignore`

- **Purpose:** Prettier code formatter settings

---

## `src/` — Main Source Code

### `src/router.tsx`

- **Purpose:** Creates the TanStack router instance
- **What it does:**
  - Creates a `QueryClient` for React Query
  - Creates a router with the auto-generated route tree
  - Enables scroll restoration
- **Exports:** `getRouter()` function

### `src/start.ts`

- **Purpose:** TanStack Start server entry with error middleware
- **What it does:**
  - Creates an error middleware that catches server errors
  - If the error has a `statusCode`, re-throws it
  - Otherwise, logs the error and returns a 500 HTML error page
- **Exports:** `startInstance`

### `src/server.ts`

- **Purpose:** Custom server entry point (replaces default TanStack server)
- **What it does:**
  - Wraps TanStack's server entry with error handling
  - Detects h3's swallowed errors (generic 500 JSON responses)
  - Replaces them with a user-friendly HTML error page
- **Key functions:**
  - `normalizeCatastrophicSsrResponse()` — Checks if a 500 response is an h3-swallowed error and replaces it with an error page
  - `isH3SwallowedErrorBody()` — Detects h3's generic `{"unhandled":true,"message":"HTTPError"}` pattern

### `src/routeTree.gen.ts`

- **Purpose:** Auto-generated route tree (DO NOT EDIT)
- **What it does:** Maps all file-based routes to the router
- **Routes defined:**
  - `/` → Landing page
  - `/login` → Login
  - `/signup` → Signup
  - `/_app/dashboard` → Dashboard
  - `/_app/recent` → Recent documents
  - `/_app/settings` → Settings
  - `/_app/starred` → Starred documents
  - `/_app/trash` → Trash
  - `/_app/upload` → Upload PDF
  - `/_app/documents/$id` → Document viewer/chat

### `src/styles.css`

- **Purpose:** Global CSS with Tailwind + custom theme
- **What it does:**
  - Imports Tailwind CSS and `tw-animate-css`
  - Defines CSS custom properties for dark and light themes
  - Uses `oklch` color format for precise colors
  - Primary color: electric purple (#782AFF)
  - Custom fonts: Inter, Space Grotesk, Fraunces, JetBrains Mono
  - Custom utilities: `gradient-primary`, `shadow-glow`, `shadow-soft`

---

## `src/routes/` — Page Components

### `src/routes/__root.tsx`

- **Purpose:** Root layout that wraps all pages
- **What it does:**
  - Sets up HTML shell with dark mode class
  - Loads Google Fonts (Inter, Space Grotesk, Fraunces, JetBrains Mono)
  - Provides `QueryClientProvider` and `ThemeProvider` to all routes
  - Sets meta tags (title, description, Open Graph)
- **Key components:**
  - `RootShell` — HTML `<html>` wrapper
  - `RootComponent` — React providers
  - `NotFoundComponent` — 404 page
  - `ErrorComponent` — Runtime error boundary page

### `src/routes/index.tsx`

- **Purpose:** Landing page (public, no auth required)
- **What it does:** Marketing page explaining what DocTalk does
- **Sections:**
  - `Nav` — Sticky header with logo, nav links, theme toggle, login/signup buttons
  - `Hero` — Main headline, CTA buttons, citation demo
  - `PullQuote` — Testimonial quote
  - `Walkthrough` — 3-step how-it-works guide
  - `CitationsFeature` — Shows how citations work with page references
  - `FeatureGrid` — Two feature cards (streaming answers, exact citations)
  - `UseCases` — Students, Researchers, Professionals
  - `FinalCta` — Call to action signup
  - `Footer` — Simple footer with logo and GitHub link

### `src/routes/login.tsx`

- **Purpose:** Login page
- **What it does:**
  - Simple email/password form
  - Client-side validation (valid email, min 6 char password)
  - On success, navigates to `/dashboard` (TODO: wire to auth backend)
- **Exports:** `LoginPage` component
- **Uses:** `AuthShell`, `FieldLabel`, `TextInput`, `PrimaryButton` from auth-shell

### `src/routes/signup.tsx`

- **Purpose:** Signup/registration page
- **What it does:**
  - Name, email, password form
  - Client-side validation (name min 2 chars, valid email, password min 8 chars)
  - On success, navigates to `/dashboard` (TODO: wire to auth backend)
- **Exports:** `SignupPage` component

### `src/routes/_app.tsx`

- **Purpose:** Layout wrapper for all authenticated app pages
- **What it does:**
  - Renders `AppSidebar` on the left
  - Renders child routes via `<Outlet />` in the main content area
  - Full-height flex layout

### `src/routes/_app.dashboard.tsx`

- **Purpose:** Main dashboard/home page after login
- **What it does:**
  - Shows welcome message
  - Displays stat cards: Documents (24), Storage (128 MB), Questions (312)
  - Shows recent documents (up to 6) using `DocCard`
  - "Upload a PDF" button links to upload page
  - Empty state when no documents exist
- **Key components:**
  - `StatCard` — Displays a stat with icon, label, and value
  - `Dashboard` — Main dashboard layout
  - `EmptyDashboard` — Shown when user has no documents

### `src/routes/_app.recent.tsx`

- **Purpose:** List of all recent (non-trashed) documents
- **What it does:**
  - Search bar to filter documents by title
  - Sort dropdown: Last opened, Name, Size
  - Toggle between Grid and List views
  - Grid view uses `DocCard` components
  - List view shows documents in a table with columns: Name, Last opened, Size
- **State:** `q` (search query), `sort` (sort option), `view` (grid/list)

### `src/routes/_app.starred.tsx`

- **Purpose:** Shows starred (favorited) documents
- **What it does:**
  - Filters mock docs where `starred === true` and `trashed === false`
  - Displays as grid of `DocCard` components
  - Empty state with star icon when no starred docs

### `src/routes/_app.trash.tsx`

- **Purpose:** Shows trashed/deleted documents
- **What it does:**
  - Filters mock docs where `trashed === true`
  - Shows info banner: "Items in trash are automatically deleted after 30 days"
  - Displays as grid of `DocCard` with `variant="trashed"`
  - Empty state when trash is empty

### `src/routes/_app.settings.tsx`

- **Purpose:** User settings page with tabs
- **Tabs:**
  - `Profile` — Edit name and email fields, save button
  - `Appearance` — Dark/light mode toggle switch
  - `Pricing & Billing` — Free ($0) and Pro ($5/month) plan cards
  - `Account` — Change password, export data, delete account buttons
- **Key components:**
  - `Section` — Card wrapper for each tab's content
  - `Field` — Labeled input field
  - `ProfileTab` — Profile editing
  - `AppearanceTab` — Theme toggle
  - `BillingTab` — Pricing plans
  - `AccountTab` — Account management
  - `PlanCard` — Individual pricing plan display

### `src/routes/_app.upload.tsx`

- **Purpose:** PDF upload page
- **What it does:**
  - Drag & drop zone for PDFs
  - Click to browse files
  - Simulated upload progress (random increments)
  - Three states: `idle` → `uploading` → `done`
  - On completion, shows "Open document" link and "Upload another" button
- **State:** `state` (idle/uploading/done), `progress` (0-100), `dragOver`, `fileName`

### `src/routes/_app.documents.$id.tsx`

- **Purpose:** Document viewer + AI chat (the core feature)
- **What it does:**
  - Split view: PDF viewer on left, chat panel on right
  - PDF viewer with page navigation (prev/next), zoom controls (50%-200%)
  - Chat panel with:
    - Context strip showing which documents are in context
    - "Add document" button for multi-doc chat
    - Suggested starter questions
    - Message history with user/assistant messages
    - Streaming text simulation for AI responses
    - Page citation buttons that jump to the cited page
    - Textarea input with send button
  - Resizable chat panel (drag divider)
  - Mobile: chat appears as overlay
- **Key types:**
  - `Msg` — Chat message with id, role, text, streaming flag, and page citations
- **Key functions:**
  - `ask(q)` — Sends a question, simulates AI response with streaming
  - `jumpToPage(p)` — Navigates to a specific page with flash animation
- **Key components:**
  - `DocumentChat` — Main document view with PDF viewer and chat
  - `ChatPanel` — The chat interface (context strip, messages, input)

---

## `src/components/` — Reusable Components

### `src/components/app-sidebar.tsx`

- **Purpose:** Left sidebar navigation for the app
- **What it does:**
  - Desktop: Fixed 256px wide sidebar
  - Mobile: Hamburger menu that opens a drawer overlay
  - Shows DocTalk logo at top
  - Navigation links: Dashboard, Upload PDF, Recent, Starred, Trash
  - Settings link at bottom (separated by border)
  - Highlights active route
- **Key components:**
  - `NavItems` — Individual navigation links
  - `SidebarInner` — The actual sidebar content (used in both desktop and mobile)
  - `AppSidebar` — Main export, handles desktop/mobile views

### `src/components/top-bar.tsx`

- **Purpose:** Top header bar for app pages
- **What it does:**
  - Sticky header with backdrop blur
  - Shows page title on left
  - Theme toggle button (sun/moon icon)
  - User avatar dropdown menu with: email, Profile, Billing, Log out options
- **Props:** `title` (page title), `right` (optional right-side content)

### `src/components/doc-card.tsx`

- **Purpose:** Card component for displaying a document
- **What it does:**
  - Shows document icon, title, metadata (last opened, pages, size)
  - Star icon if document is starred
  - Three-dot menu with context menu (Open, Rename, Star/Unstar, Delete)
  - Trashed variant shows restore/delete permanently options
  - Hover effect: slight lift and border color change
- **Props:** `doc` (Doc object), `variant` ("default" or "trashed")

### `src/components/auth-shell.tsx`

- **Purpose:** Shared layout for login/signup pages
- **What it does:**
  - Centers content vertically and horizontally
  - Shows DocTalk logo
  - Card with title, subtitle, children (form), and footer
- **Exports:**
  - `AuthShell` — Main wrapper component
  - `FieldLabel` — Label for form fields
  - `TextInput` — Styled input with error state support
  - `PrimaryButton` — Styled submit button

---

## `src/lib/` — Utilities and Helpers

### `src/lib/utils.ts`

- **Purpose:** General utility functions
- **Exports:**
  - `cn(...inputs)` — Merges Tailwind CSS classes using `clsx` and `tailwind-merge`

### `src/lib/theme.tsx`

- **Purpose:** Dark/light theme management
- **What it does:**
  - Uses React Context to provide theme state
  - Persists theme choice to `localStorage` under key `doctalk-theme`
  - Adds `dark` or `light` class to `<html>` element
- **Exports:**
  - `ThemeProvider` — Wraps app to provide theme context
  - `useTheme()` — Hook returning `{ theme, toggle }`

### `src/lib/mock-docs.ts`

- **Purpose:** Mock document data for development
- **What it does:** Provides sample documents with id, title, size, lastOpened, pages, starred, trashed
- **Exports:**
  - `Doc` type — Document shape
  - `mockDocs` — Array of 8 sample documents
  - `docById(id)` — Find a document by its ID

### `src/lib/error-page.ts`

- **Purpose:** Renders a static HTML error page
- **What it does:** Returns an HTML string for server-side error responses
- **Exports:**
  - `renderErrorPage()` — Returns HTML string with styled error message and retry/home buttons

### `src/lib/error-capture.ts`

- **Purpose:** Captures runtime errors for server-side recovery
- **What it does:**
  - Listens for `error` and `unhandledrejection` events globally
  - Stores the last error with a 5-second TTL
  - Allows `server.ts` to recover the original error when h3 swallows it
- **Exports:**
  - `consumeLastCapturedError()` — Returns the last captured error (or undefined if expired/not found)

### `src/lib/lovable-error-reporting.ts`

- **Purpose:** Error reporting to Lovable's error tracking system
- **What it does:** Sends errors to `window.__lovableEvents?.captureException()` if available
- **Exports:**
  - `reportLovableError(error, context)` — Reports an error with context info (route, boundary, severity)

---

## `src/hooks/` — Custom React Hooks

### `src/hooks/use-mobile.tsx`

- **Purpose:** Detects if viewport is mobile-sized
- **What it does:** Listens to `matchMedia` for `max-width: 767px` and returns boolean
- **Exports:**
  - `useIsMobile()` — Returns `true` if screen width < 768px

---

## `src/components/ui/` — shadcn/ui Components

These are pre-built UI components from the shadcn/ui library. All use Radix UI primitives underneath.

| Component             | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `accordion.tsx`       | Collapsible content sections                           |
| `alert.tsx`           | Alert messages (info, warning, error)                  |
| `alert-dialog.tsx`    | Modal confirmation dialogs                             |
| `aspect-ratio.tsx`    | Maintains aspect ratio for content                     |
| `avatar.tsx`          | User avatar with fallback initials                     |
| `badge.tsx`           | Small status/label badges                              |
| `breadcrumb.tsx`      | Navigation breadcrumb trail                            |
| `button.tsx`          | Styled button variants (default, outline, ghost, etc.) |
| `calendar.tsx`        | Date picker calendar                                   |
| `card.tsx`            | Card container with header/content/footer              |
| `carousel.tsx`        | Image/content carousel (uses Embla)                    |
| `chart.tsx`           | Chart wrapper (uses Recharts)                          |
| `checkbox.tsx`        | Toggle checkbox                                        |
| `collapsible.tsx`     | Collapsible content area                               |
| `command.tsx`         | Command palette (uses cmdk)                            |
| `context-menu.tsx`    | Right-click context menu                               |
| `dialog.tsx`          | Modal dialog                                           |
| `drawer.tsx`          | Bottom drawer (uses Vaul)                              |
| `dropdown-menu.tsx`   | Dropdown menu                                          |
| `form.tsx`            | Form handling with react-hook-form                     |
| `hover-card.tsx`      | Tooltip-like hover card                                |
| `input.tsx`           | Styled text input                                      |
| `input-otp.tsx`       | OTP/PIN input (uses input-otp)                         |
| `label.tsx`           | Form field label                                       |
| `menubar.tsx`         | Application menubar                                    |
| `navigation-menu.tsx` | Navigation menu                                        |
| `pagination.tsx`      | Page navigation                                        |
| `popover.tsx`         | Popover content                                        |
| `progress.tsx`        | Progress bar                                           |
| `radio-group.tsx`     | Radio button group                                     |
| `resizable.tsx`       | Resizable panels (uses react-resizable-panels)         |
| `scroll-area.tsx`     | Custom scrollbar container                             |
| `select.tsx`          | Dropdown select                                        |
| `separator.tsx`       | Visual divider                                         |
| `sheet.tsx`           | Slide-out panel                                        |
| `sidebar.tsx`         | Sidebar layout utilities                               |
| `skeleton.tsx`        | Loading skeleton placeholder                           |
| `slider.tsx`          | Range slider                                           |
| `sonner.tsx`          | Toast notifications (uses Sonner)                      |
| `switch.tsx`          | Toggle switch                                          |
| `table.tsx`           | Data table                                             |
| `tabs.tsx`            | Tab navigation                                         |
| `textarea.tsx`        | Multi-line text input                                  |
| `toggle.tsx`          | Toggle button                                          |
| `toggle-group.tsx`    | Group of toggle buttons                                |
| `tooltip.tsx`         | Tooltip on hover                                       |

---

## `public/` — Static Assets

### `public/favicon.ico`

- Browser tab icon for the app

---

## Project Structure Summary

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui primitives (35+ components)
│   │   ├── app-sidebar   # Left navigation
│   │   ├── top-bar       # Top header with user menu
│   │   ├── doc-card      # Document card
│   │   └── auth-shell    # Login/signup layout
│   ├── routes/            # Page components (file-based routing)
│   │   ├── __root.tsx    # Root layout (HTML shell, providers)
│   │   ├── index.tsx     # Landing page
│   │   ├── login.tsx     # Login
│   │   ├── signup.tsx    # Signup
│   │   └── _app/         # Authenticated routes
│   │       ├── dashboard # Home dashboard
│   │       ├── recent    # Document list
│   │       ├── starred   # Starred docs
│   │       ├── trash     # Deleted docs
│   │       ├── upload    # PDF upload
│   │       ├── settings  # User settings
│   │       └── documents/$id # Document viewer + chat
│   ├── lib/               # Utilities & helpers
│   │   ├── utils.ts      # cn() class merger
│   │   ├── theme.tsx     # Dark/light theme
│   │   ├── mock-docs.ts  # Sample data
│   │   ├── error-*.ts    # Error handling
│   │   └── lovable-*.ts  # Error reporting
│   ├── hooks/             # Custom React hooks
│   │   └── use-mobile.tsx # Mobile detection
│   ├── router.tsx         # TanStack router setup
│   ├── start.ts          # TanStack Start entry
│   ├── server.ts         # Custom server entry
│   ├── routeTree.gen.ts  # Auto-generated routes
│   └── styles.css        # Global styles + theme
├── public/               # Static assets (favicon)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
├── components.json       # shadcn/ui config
└── eslint.config.js      # ESLint config
```

---

## Tech Stack

- **Framework:** React 19 + TanStack Start (SSR)
- **Routing:** TanStack Router (file-based)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI
- **State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Build:** Vite 8
- **Language:** TypeScript 5.8
