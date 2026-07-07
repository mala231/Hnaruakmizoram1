# Build Sequence: Mizoram Job Board Platform

This document outlines the sequential build order of the project. Each unit is self-contained, introduces dependencies just-in-time, and results in a verifiable, visible output.

---

## Numbered Build Units

### 1. Basic App Shell & Static Pages
*   **What it builds**: Initial Next.js structure, Tailwind styling configurations, global Layout (Header, Footer, and navigation skeleton), and static public views (About Us, Contact Us, Privacy Policy, Terms & Conditions, Cancellation/Refund Policy).
*   **Dependencies**: None.
*   **Verifiable Output**: Running `npm run dev` displays the homepage layout with working navigation links and readable text for all static policy pages.

### 2. Database Schema & Seeds
*   **What it builds**: Installation of Prisma ORM, creation of `prisma/schema.prisma` (defining tables: `employers`, `job_posts`, `payments`, `categories`, `locations`, `reports`, `ticker_items`, `advertisements`, `admins`), and a database seed script (`prisma/seed.ts`) to populate the default 11 districts of Mizoram, default categories, and a default administrator account.
*   **Dependencies**: Unit 1.
*   **Verifiable Output**: Running the Prisma seed script successfully populates local PostgreSQL tables, verifiable via Prisma Studio.

### 3. Employer Portal: Registration & Session Auth
*   **What it builds**: Hashing helpers (`bcrypt`), JWT handler utilities, Next.js Route Proxy (`proxy.ts`) protection rules, Cloudinary integration, and the registration/login page components for employers.
*   **Dependencies**: Unit 2.
*   **Verifiable Output**: A user can register a new employer account (uploading a profile logo to Cloudinary), log in securely, and access a protected `/dashboard` landing area while unauthenticated access is blocked.

### 4. Admin Portal: Auth & Master Options Manager
*   **What it builds**: Admin login interface, admin token session proxy checks, and the category/district master-list editors within the admin dashboard.
*   **Dependencies**: Unit 3.
*   **Verifiable Output**: Logging into the admin account grants access to `/admin` page views, allowing the administrator to add, edit, or delete categories and location districts.

### 5. Job Discovery: Homepage Feed, Details, & Reporting
*   **What it builds**: Home page feed (fetching active listings), keyword search bar, category/location dropdown filters, the individual Job Detail page (dynamic slug routing), static Google Maps string-address to embed URL conversion, social share triggers, and the "Report Employer" modal form.
*   **Dependencies**: Unit 4.
*   **Verifiable Output**: The landing page displays a searchable card grid of job listings. Clicking a card opens the detailed view, renders a map embed, exposes working WhatsApp/Facebook share links, and logs a submitted user report to the database.

### 6. Billing: Job Creation & Razorpay checkout
*   **What it builds**: Employer "Post a Job" form, Razorpay SDK checkout integration, payment request handler API, and the secure payment webhook listener route `/api/payments/webhook`.
*   **Dependencies**: Unit 5.
*   **Verifiable Output**: Employers fill out job descriptions, select a listing duration (15 or 30 days), proceed through a test Razorpay checkout transaction, and see the job listing automatically set to `live` and visible on the home page feed.

### 7. Employer Portal: Listing Management (CRUD) & Deletion
*   **What it builds**: Dashboard dashboard listings (active vs expired lists), edit-active-listing form, early deletion button, extend-listing payment checkout, billing history log table, and the soft-delete account options.
*   **Dependencies**: Unit 6.
*   **Verifiable Output**: Employers can edit details of their live posts, pay to extend listing durations, review past billing receipt records, and soft-delete their account (which immediately hides their active listings from public views).

### 8. Admin Portal: Content Moderation & Banner Ads
*   **What it builds**: Admin scrolling ticker editor, manual sidebar banner ad uploader, user report dashboard manager (resolution switches), list moderation (ban listings or suspend employers), and the financial transaction overview log.
*   **Dependencies**: Unit 7.
*   **Verifiable Output**: Admin can add scrolling ticker entries, upload homepage sidebar ad images, review submitted reports, ban listings, toggle verification badges on employers, and audit the platform's transactions.

### 9. Expiry Automation, Emails, & PWA Offline Caching
*   **What it builds**: Node-cron daily task checks, transactional email templates and transporters (activation alerts and pre-expiry warnings), next-pwa manifest assets, custom service worker caching, and final localization strings integration.
*   **Dependencies**: Unit 8.
*   **Verifiable Output**: The compiler successfully outputs a PWA-ready Next.js build. Expired listings are automatically marked as `expired` at midnight, warning emails trigger in console logs, and the app shell works offline.
