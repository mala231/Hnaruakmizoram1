# Hnaruak Mizoram — Website Functions Overview

> **Hnaruak Mizoram** is a bilingual (English & Mizo) job board platform designed to consolidate all job vacancies across the districts of Mizoram, making job discovery easy and affordable for both employers and job seekers.

---

## 🌐 Public Features (Job Seekers)

| Function | Description |
|---|---|
| **Job Search** | Search job listings by title, location, or company using Algolia-powered full-text search. No registration required. |
| **Browse by Category** | Filter jobs by industry category (e.g., Government, Private, NGO, etc.). |
| **Browse by District** | Filter listings by Mizoram districts using an interactive map selector. |
| **View Job Details** | View full job descriptions, deadlines, interview schedules, location/address, and how to apply. |
| **Download PDF** | Download the official job circular PDF if uploaded by the employer. |
| **Share Job** | Share a job listing directly with others via social/link sharing. |
| **Report a Listing** | Flag a suspicious or fraudulent job post for admin review. |
| **Ticker / Announcements** | A live scrolling ticker displays admin-curated announcements and ads at the top of the site. |
| **Bilingual UI** | Full support for English and Mizo (Mizo tawng) language switching. |

---

## 🏢 Employer Features

| Function | Description |
|---|---|
| **Employer Registration** | Employers create an account with username, email, phone, address, and company logo. |
| **Login / Logout** | Secure employer authentication with session management. |
| **Post a Job** | Create a job listing with title, description, category, district, address, deadline, interview time, and optional PDF circular. |
| **Payment (Razorpay)** | Pay to publish listings: Rs.299 for 15 days or Rs.499 for 30 days. Listings go live immediately after payment. |
| **Dashboard** | Manage all active, expired, and draft job postings from a personal dashboard. |
| **Edit / Delete Listings** | Update or remove job posts. |
| **Extend Listings** | Pay to extend an existing listing's duration. |
| **Payment History** | View past transactions with amounts, dates, and transaction IDs. |
| **Account Settings** | Update account information. |
| **Delete Account** | Soft-delete employer account; all active listings are hidden but records are retained for audit. |

---

## 🛡️ Admin Features

| Function | Description |
|---|---|
| **Employer Moderation** | Verify, unverify, or suspend/delete employer accounts. |
| **Report Management** | Review user-submitted job reports and dismiss or act on them (e.g., delete the flagged post). |
| **Ticker Management** | Add, activate, or deactivate scrolling ticker messages shown to all visitors. |
| **Advertisement Management** | Upload sidebar ad images with target URLs and control their active status and position. |
| **Site Settings** | Manage global key-value settings for the platform. |

---

## Technical Capabilities

| Capability | Description |
|---|---|
| **Algolia Search** | Fast, real-time job search with fallback to database listing if Algolia is unavailable. |
| **PDF Upload** | Employers can upload official PDF circulars (max 5 MB) attached to a job post. |
| **Email Notifications** | Automated email sending via the platform's email service (e.g., contact form responses). |
| **Cron Jobs** | Scheduled background tasks to auto-expire listings past their deadline. |
| **PWA Support** | Progressive Web App registration for installability on mobile devices. |
| **SEO Optimized** | Each page includes proper meta tags, titles, and semantic HTML for search engine visibility. |

---

## Informational Pages

- **About Us** — Platform overview, mission, and key differentiators.
- **Privacy Policy** — How employer data is collected and used.
- **Terms of Service** — Posting rules, payment terms, and moderation rights.
- **Refund Policy** — Non-refundable payment policy with exception handling for technical failures.
- **Contact Us** — Contact form and business contact details.
