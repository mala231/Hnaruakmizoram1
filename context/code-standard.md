# Code Standards

## General

*   **Single-Purpose Modules**: Keep modules small and single-purpose. Every component, helper function, or API route must focus on a single responsibility (e.g., a file handles either authentication logic, database queries, or billing operations, but never multiple).
*   **Fix Root Causes**: Address issues at the source instead of layering workarounds. Refactor the underlying logic, schema design, or API routes when bugs appear rather than writing patch scripts.
*   **Decoupled Concerns**: Do not mix unrelated concerns in one component or route. Keep API endpoints separate from page views, and ensure database operations remain decoupled from request authentication middlewares.

## TypeScript

*   **Strict Mode**: Strict mode is required throughout the project. `strict: true` must be enabled in `tsconfig.json`.
*   **Type Safety**: Avoid `any`. Use explicit interfaces, type declarations, or Prisma-generated database models to verify data structures.
*   **Boundary Validation**: Validate unknown external input at system boundaries before trusting it. All user-submitted request bodies, parameters, and Razorpay webhook payloads must be structurally parsed and validated before DB operations occur.

## Next.js

*   **Server Components by Default**: Default to Server Components for layouts, data fetching, page views, and static SEO metadata configurations.
*   **Interactivity Isolation**: Add `"use client"` only when browser interactivity is required (e.g., dropdown search filters, modal alert handlers, form inputs, or Razorpay payment initiation triggers).
*   **Focused Route Handlers**: Keep route handlers focused on a single responsibility. API routes should parse incoming payloads, perform authentication/ownership checks, delegate database work to business logic helper modules, and return consistent responses.

## Styling

*   **Tokenized Styling**: Use standard Tailwind CSS utilities or CSS variable tokens. Avoid using hardcoded inline styles, absolute positioning hacks, or custom hex color overrides.
*   **Consistent Component Design**: Leverage shadcn/ui component presets (buttons, inputs, dropdowns, dialogs) as building blocks to guarantee layout, spacing, and border-radius consistency across public and dashboard interfaces.

## API Routes

*   **Input Parsing**: Validate and parse request input before any business logic runs. Route execution must fail early if expected fields are missing, malformed, or invalid.
*   **Security & Ownership**: Enforce session authentication and record ownership validation before executing database mutations. An employer must never be allowed to run mutations on listings not owned by them.
*   **Predictable Response Shapes**: Return consistent, predictable response shapes. Every API response must return an appropriate HTTP status code and a standard JSON structure:
    *   Success: `{ success: true, data: { ... } }`
    *   Failure: `{ success: false, error: "Detailed message" }`

## Data and Storage

*   **Metadata in Database**: Structured meta-information (usernames, transaction IDs, post expirations, categories, districts, report reasons, and timestamps) belongs in the PostgreSQL database.
*   **Files in Blob Storage**: Large files, icons, logos, and advertising banner images belong in Cloudinary file storage.
*   **No Base64 in Database**: Do not store large content or binary assets directly in the database. Save only the secure Cloudinary string URLs.

## File Organization

*   `app/` — Houses Next.js pages, layouts, and serverless API route handlers.
*   `components/` — Contains modular, reusable client and server UI widgets (job cards, search filters, scrolling ticker, banner ads).
*   `lib/` — Contains third-party SDK clients, mail handlers, JWT authentication utils, and node-cron background tasks.
*   `prisma/` — Holds the `schema.prisma` database definition file and local migration/seeding scripts.
*   `messages/` — Holds translation JSON files containing Mizo UI localized text strings.
