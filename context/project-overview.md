# Project Overview: Mizoram Job Board Platform

## 1. Overview
The Mizoram Job Board is a hyper-local, mobile-responsive directory platform designed for the Mizoram market, featuring a user interface written entirely in the Mizo language. The application allows employers to register accounts, upload business logos, and pay a duration-based fee via Razorpay to publish job vacancies with specific off-platform application instructions. Job seekers can browse, search, and filter these listings by district or category without creating an account, eventually applying directly to employers via the offline or external channels specified in each post.

---

## 2. Project Goals
1. Establish a lightweight, accessible repository of local employment listings throughout Mizoram.
2. Minimize accessibility barriers for local job seekers and small business employers through a native Mizo UI.
3. Secure a self-serve, duration-based monetization stream for the platform using Razorpay payment collections.
4. Provide platform administrators with moderation capabilities to remove problematic listings and manage manual local ads.

---

## 3. Core User Flow
1. **Employer Registration**: The employer registers an account by providing a username, email address, phone number, physical address, and uploading a corporate logo.
2. **Job Post Creation**: The employer logs in, accesses their dashboard, fills out the job posting form (specifying title, short description, rich text full description, category dropdown, district dropdown, exact address, application deadline, and interview time), and chooses a duration (15 days or 30 days).
3. **Checkout & Payment**: The employer is redirected to the Razorpay payment gateway to pay either ₹299 (for a 15-day listing) or ₹499 (for a 30-day listing). The job post is saved as a `draft` during this transaction.
4. **Publishing**: Upon receipt of the successful Razorpay webhook response, the system updates the job post status to `live` and calculates the `expires_at` timestamp. The post immediately becomes visible in the public job feed.
5. **Job Discovery**: A job seeker visits the homepage, browses the chronological feed, inputs search keywords, or selects specific category/district filters to locate relevant vacancies.
6. **Off-Platform Application**: The job seeker clicks on a job card, reviews the job details, and follows the employer's specific instructions (e.g., calling the phone number, emailing a resume, or visiting a physical address) to apply.
7. **Expiration & Cron cleanup**: The system runs a daily automated task at midnight. Any listing whose `expires_at` timestamp has passed is updated to `expired` status and hidden from the public feed.

---

## 4. Features by Category

### Employer Portal
*   **Authentication**: Account registration, secure password login (JWT-based session), and logout.
*   **Profile Management**: Upload/update logo (stored via Cloudinary) and edit address or contact info.
*   **Job Post Panel**: Interface to write, edit, renew/extend, or manually delete active job listings.
*   **Transaction Log**: A read-only historical list of payments made by the employer, displaying receipt IDs and dates.

### Job Seeker Experience
*   **Homepage Job Feed**: A chronological list of active cards displaying the company logo, title, category, and deadline.
*   **Search & Filtering**: Search bar querying titles/short descriptions, alongside dropdown selectors for job categories and Mizoram districts.
*   **Job Detail View**: Rich text job descriptions, location details, social sharing triggers (WhatsApp, Facebook), and a "Report Employer" button.
*   **Legal & Static Pages**: Accessible footer links displaying About, Contact, Privacy, Terms, and Refund policies.

### Admin Dashboard
*   **Moderation Panel**: A grid displaying all active listings and registered employers with actions to delete posts, soft-delete employers, or flag them as "verified."
*   **Report Log**: A dashboard showcasing user-reported listings with reported reasons, letting admins dismiss reports or delete the offending listing.
*   **Ticker Controller**: A simple text editor to update, add, or toggle the live scrolling ticker displayed on the homepage.
*   **Ad Space Manager**: A form allowing the admin to manually upload image banners and direct URLs for the homepage sidebar slots.
*   **Filter Options Editor**: A control panel to add, edit, or remove entries from the master category and district lists.

---

## 5. In-Scope (Version 1)
*   Next.js (App Router) frontend and Next.js serverless API routes.
*   PostgreSQL database hosted on Railway, managed using Prisma ORM.
*   Razorpay payment gateway checkout integration.
*   Mizo UI translation files using key-value JSON localization structures.
*   Cloudinary SDK implementation for media uploads (logos and sidebar banners).
*   Node-cron task scheduler for daily automated post expiration.
*   PWA assets (Web App Manifest, custom service worker caching).
*   Standard SEO Open Graph tags generation for job posting detail pages.

---

## 6. Out-of-Scope (Version 1)
*   In-platform application forms, resume parsing, or document uploads.
*   Chat messaging or communication portals between employers and seekers.
*   Job seeker profiles, accounts, or saved job bookmarks.
*   Self-serve banner ad purchase portal (advertisers must contact the admin manually off-platform).
*   Radius-based geographical map searches (filtering is strictly limited to district dropdown lists).
*   A bilingual toggle switch (the UI is strictly Mizo-only; listing descriptions can be submitted in any language).

---

## 7. Success Criteria
*   An employer can register an account, upload a logo, submit a listing, complete a mock Razorpay transaction, and see the listing appear immediately on the homepage.
*   A job seeker can search by keyword and filter listings by category and district, receiving immediate filtered results.
*   The automated cron checker updates active posts to `expired` status exactly when their duration ends, removing them from the homepage.
*   The admin can log in, view submitted reports, delete listings, update the scrolling ticker, and manually assign sidebar banners.
*   The application operates with full mobile responsiveness and displays all UI menus, alerts, and forms in Mizo.
