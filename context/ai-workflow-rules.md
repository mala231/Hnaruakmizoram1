# AI Workflow Rules

This document defines the behavior, boundaries, and validation requirements that any AI coding agent must follow when building, modifying, or maintaining this codebase.

---

## 1. Overall Approach

*   **Spec-Driven Development**: Every code modification must align with the definitions in [project-overview.md](file:///c:/Users/masst/Desktop/Mamawh/project-overview.md), [requirements.md](file:///C:/Users/masst/.gemini/antigravity/brain/bc63ebef-0caa-4e3b-a384-04b6d5670a3a/requirements.md), and [architecture.md](file:///c:/Users/masst/Desktop/Mamawh/architecture.md). Do not invent features or business rules that are not documented.
*   **Incremental Progress**: Make small, logical code edits. Compile, run lint checks, and verify your changes before writing additional features. Do not modify multiple system layers simultaneously (e.g., avoid updating database schemas, API routes, and frontend views in a single turn).

---

## 2. Scoping Rules

*   **One Unit at a Time**: Focus on building a single component, database model, utility module, or API route before moving to the next.
*   **No Speculative Coding**: Do not write placeholder functions, inactive variables, or "future-proofing" logic for out-of-scope items (e.g., do not add messaging schemas, CV upload integrations, or billing refund triggers). Write only the exact code needed to satisfy the current phase's success criteria.

---

## 3. Splitting Work

Split complex features into distinct sequential steps:
1.  **Schema Updates**: Define database models in `prisma/schema.prisma` and run migration tasks.
2.  **Helper Utilities & Backend Services**: Write connection modules, authentication utilities, and cron jobs.
3.  **API Routes**: Implement backend route handlers, including input validation and ownership checks.
4.  **Frontend Components**: Build user interface components, layouts, and hooks.
5.  **Localization & Assembly**: Integrate JSON translation strings and wire components to page routes.

---

## 4. Handling Ambiguity

*   **Ask for Clarification**: If a requirement is missing, vague, or contradicts the documentation, **stop and ask the user for clarification**. Do not make assumptions regarding business rules (such as pricing, expiration times, email triggers, or user permissions).
*   **Document Decisions**: Once the user provides clarification, update the corresponding documentation files (`requirements.md` or `project-overview.md`) before resuming code changes.

---

## 5. Protected Files

Do not modify the following directories or files without explicit instructions:
*   **`components/ui/`**: These are generated shadcn/ui components. They must remain clean presentation layers. If styling adaptations are needed, implement them via wrapper classes or configuration files, not by editing library files.
*   **`node_modules/`**: Strictly read-only.
*   **Prisma Generated Client**: Never modify the generated code output directory from Prisma. Change only `schema.prisma`.

---

## 6. Keeping Documentation in Sync

*   **Checklist Updating**: When beginning work on a task, mark it as in progress `[/]` in the task board. Once complete, mark it as completed `[x]`.
*   **Architecture Updates**: If a new library is installed or directory structure is introduced, update the technology stack table or folder boundaries in `architecture.md` immediately.

---

## 7. Verification Checklist

Before marking a unit of work as complete or proceeding to the next item, verify that:
1.  **Compilation Check**: The project builds successfully with no compiler errors (`npm run build` executes without warnings).
2.  **Type Checks**: All TypeScript structures pass strict compile audits (no implicit `any` declarations, no unchecked type assertions).
3.  **API Route Shape**: API responses conform to the standard success/failure JSON patterns with appropriate HTTP response codes.
4.  **Resource Authentication**: All write-action APIs verify user authentication and record ownership.
5.  **Localization Validation**: UI changes utilize i18n JSON token mappings rather than hardcoded UI text strings.
6.  **Responsive Layout**: Interface layouts render correctly across both desktop and mobile viewports.
