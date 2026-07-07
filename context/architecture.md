# Project Architecture: Mizoram Job Board Platform

## 1. Technology Stack

| Layer | Technology | Role / Responsibility |
|---|---|---|
| **Frontend UI** | Next.js (React 19) | Server-side rendering (SSR), client components, routing, and mobile-responsive viewport layouts. |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent styling, components, and layout utilities. |
| **Backend APIs** | Next.js API Routes | Serverless handlers for auth, payment callbacks, reporting, and admin operations. |
| **Database ORM** | Prisma | Type-safe schema definitions, database queries, and migration versioning. |
| **Database** | PostgreSQL | Relational store for employers, job posts, payments, reports, and configurations. |
| **Authentication** | JWT (JSON Web Tokens) | Hashed tokens stored in HTTP-only cookies to persist employer and admin login sessions. |
| **Payment Gateway** | Razorpay SDK | Processing billing for job post durations (₹299 for 15 days, ₹499 for 30 days). |
| **Media Storage** | Cloudinary | Storing, optimizing, and hosting uploaded corporate logos and advertisement banners. |
| **Localization** | Next.js custom i18n structure | Key-value JSON translation mapping files to translate the user interface into the Mizo language. |
| **Background Scheduler** | node-cron | Daemon service to run daily automated tasks (such as job post expiration checks). |

---

## 2. System Boundaries & File Responsibilities

*   **`/app/(public)`**: Manages public pages. It handles the home feed, search displays, static policy footers, individual job details, and employer public profiles. No session authentication check is active on these routes.
*   **`/app/(employer)`**: Manages authenticated employer routes. It handles the employer login, signup, dashboard, job post creator, job editor, and billing statement pages. Routes are protected by a Next.js proxy token check.
*   **`/app/(admin)`**: Manages administrative routes. It contains controls for categories, districts, tickers, banner ads, and the moderation feed. Access requires an admin token session.
*   **`/app/api`**: Exposes secure backend endpoints. Handles webhook listeners, reporting inputs, logo image upload signatures, and database mutations.
*   **`/components`**: Reusable client-side UI blocks (e.g., job cards, filters, reporting modal, map rendering wrapper).
*   **`/lib`**: Initialization wrappers and configuration files for external SDKs and helper utilities (`prisma.ts`, `razorpay.ts`, `cloudinary.ts`, `email.ts`, `cron.ts`, `auth.ts`).
*   **`/prisma`**: Holds `schema.prisma` configuration file alongside SQL seed scripts.
*   **`/messages`**: Holds Mizo UI translations in JSON files.
*   **`/public`**: Hosts the PWA manifest file, icons, and the service worker.

---

## 3. Storage Model

### Database (PostgreSQL)
*   **Employer Credentials**: Hashed passwords, usernames, and contact records.
*   **Job Post Metadata**: Job descriptions, target deadlines, categories, and location records.
*   **Transaction Logs**: Razorpay payment history IDs, amounts, and durations.
*   **Moderation Records**: Reported listings with reasons.
*   **Platform Settings**: Scrolling ticker texts, manual sidebar ad linkages, category titles, and location districts.

### File Storage (Cloudinary)
*   **Corporate Logos**: Uploaded by employers on registration.
*   **Advertisement Banners**: Uploaded manually by admins for the homepage sidebar.

### Cache (PWA Service Worker Cache)
*   **Static Shell (Cache-First)**: Next.js script bundles, CSS stylesheets, system fonts, and default icons.
*   **Active Job Lists (Network-First)**: Live job cards. If offline, the UI falls back to the last cached feed.
*   **Employer Profiles (Stale-While-Revalidate)**: Profile views load instantly from cache and refresh in the background.

---

## 4. Authentication & Access Model

### User Access Pools
The application segregates credentials into two isolated pools:
1.  **Employers**: Register and manage their own profiles and listings.
2.  **Administrators**: Access the moderation dashboard to govern listings, categories, settings, and reports.

### Session Management
*   Authentication is stateless using JWT.
*   Upon login, the server issues a cryptographically signed token and sets it as an HTTP-only, `sameSite=Strict`, secure cookie (`employer_session` or `admin_session`).
*   Client-side scripts cannot read or modify these cookies, protecting sessions against Cross-Site Scripting (XSS).

### Resource Ownership Checks
Before writing to the database:
*   Next.js proxy (`proxy.ts`) intercepts route requests on `/dashboard/*` or `/admin/*` and redirects unsigned sessions.
*   API endpoints validate the token. An employer is only allowed to edit, extend, or delete a listing if `job_posts.employer_id` matches the authenticated `employer_id` decoded from the token.

---

## 5. Background Tasks & Webhook Models

### Daily Expiry Daemon (node-cron)
Runs a daily task at midnight (`0 0 * * *`) that executes a batch SQL update:
```sql
UPDATE job_posts 
SET status = 'expired' 
WHERE status = 'live' AND expires_at <= NOW();
```
All posts matching this condition are immediately hidden from the public feed.

### Payment Webhook Listener
Endpoint `/api/payments/webhook` listens for Razorpay notifications:
1.  Validates the cryptographic signature of the webhook payload using the shared Razorpay Secret.
2.  Locates the payment entry matching the `razorpay_order_id`.
3.  Updates the transaction status to `confirmed`.
4.  Updates the target job post status from `draft` to `live` and calculates `expires_at` (current time + duration).
5.  Triggers a background email confirming listing activation.

---

## 6. Codebase Invariants

> [!IMPORTANT]
> The codebase must strictly adhere to the following rules:

1.  **Soft Delete Enforcement**: Employer accounts must never be hard-deleted via standard database queries. To delete an account, the system must set the `is_deleted` flag to `true`, hiding profiles and posts from the public view while retaining records.
2.  **Billing Record Immutability**: Verified payment entries in the `payments` table must remain read-only. No application feature or API endpoint is permitted to modify or delete a transaction once its status is marked as `confirmed`.
3.  **Payment-Gate Verification**: A job listing must never have its database status updated to `live` unless a valid Razorpay webhook transaction has successfully confirmed the receipt of corresponding funds.
4.  **Ownership Isolation**: All API endpoints handling edits, deletions, or renewals of job posts must verify that the session user ID matches the target listing's `employer_id` before committing changes to the database.
5.  **XSS Map Protection**: The system must never accept or render raw HTML input (such as `<iframe>` tags) for Google Maps. Employers provide only a location string (e.g. city/street address), which the backend sanitizes and resolves into a structured Google Maps Embed URL template.
