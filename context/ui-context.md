# UI Design System: Sizzle & Snap

## 1. Color Palette & Semantic Tokens

| Token Category | Token Name | Hex Value | Intended Usage / Description |
|---|---|---|---|
| **Core Brand** | `primary` | `#a20000` | Primary brand red. Main interactive buttons and key branding. |
| | `on-primary` | `#ffffff` | High-contrast text on primary background. |
| | `primary-container` | `#d00000` | Darker red container. Accent highlights, pricing text, and warning tags. |
| | `on-primary-container`| `#ffded9` | Warm tint text on primary-container color. |
| | `secondary` | `#904d00` | Bold orange. Promotions, status indicators, and secondary tags. |
| | `on-secondary` | `#ffffff` | High-contrast text on secondary background. |
| | `secondary-container` | `#fd8b00` | Secondary orange container background. Secondary interactive buttons. |
| | `on-secondary-container`| `#603100` | Deep brown text on secondary-container background. |
| | `tertiary` | `#705d00` | Accent yellow. Used for job ratings, badges, and trust signals. |
| | `on-tertiary` | `#ffffff` | High-contrast text on tertiary background. |
| | `tertiary-container` | `#c9a900` | Tertiary container. Special category tabs or attention badges. |
| | `on-tertiary-container`| `#4c3e00` | Dark olive-yellow text on tertiary-container background. |
| **Surfaces** | `background` | `#fcf9f8` | Base screen floor background. |
| | `on-background` | `#1c1b1b` | Main body copy text. |
| | `surface` | `#fcf9f8` | Default surface background (cards, bars). |
| | `on-surface` | `#1c1b1b` | Text on default surface backgrounds. |
| | `surface-dim` | `#dcd9d9` | Slightly dimmed surface (inactive state backgrounds). |
| | `surface-bright` | `#fcf9f8` | Bright elevated surface view. |
| | `surface-container-lowest` | `#ffffff` | Pure white background for high-contrast card elevation level 0. |
| | `surface-container-low` | `#f6f3f2` | Low-elevation container card background. |
| | `surface-container` | `#f0edec` | Default background container. |
| | `surface-container-high`| `#ebe7e7` | High-elevation container card background. |
| | `surface-container-highest`| `#e5e2e1` | Highest elevation container card background. |
| | `surface-variant` | `#e5e2e1` | Alternate surface tint for tables/dividers. |
| | `on-surface-variant` | `#5e3f3a` | Muted subtitle text on surface components. |
| **Outlines** | `outline` | `#936e69` | Standard divider border lines and input container lines. |
| | `outline-variant` | `#e8bdb6` | Muted divider borders. |
| **Inverse** | `inverse-surface` | `#313030` | Dark Mode background simulation for toggle overrides. |
| | `inverse-on-surface` | `#f3f0ef` | Inverse text on dark surface override. |
| | `inverse-primary` | `#ffb4a8` | Inverse accent red color. |
| **Feedback** | `error` | `#ba1a1a` | Warning status background and delete alerts. |
| | `on-error` | `#ffffff` | High-contrast text on error backgrounds. |
| | `error-container` | `#ffdad6` | Soft red background for input validation errors. |
| | `on-error-container` | `#93000a` | Deep red text for input validation error labels. |
| **Accent Fixed** | `primary-fixed` | `#ffdad4` | Fixed primary container color (ignores theme switches). |
| | `primary-fixed-dim` | `#ffb4a8` | Dimmed fixed primary container. |
| | `on-primary-fixed` | `#410000` | Fixed primary text color. |
| | `secondary-fixed` | `#ffdcc3` | Fixed secondary container. |
| | `secondary-fixed-dim` | `#ffb77d` | Dimmed fixed secondary container. |
| | `on-secondary-fixed` | `#2f1500` | Fixed secondary text. |
| | `tertiary-fixed` | `#ffe16d` | Fixed tertiary container. |
| | `tertiary-fixed-dim` | `#e9c400` | Dimmed fixed tertiary container. |
| | `on-tertiary-fixed` | `#221b00` | Fixed tertiary text. |

---

## 2. Typography

| Token Name | Font Family | Font Size (px) | Font Weight | Line Height (px) | Letter Spacing | Mobile View Target (if scaled) |
|---|---|---|---|---|---|---|
| `display-lg` | Plus Jakarta Sans | 48px | 800 | 56px | -0.02em | `fontSize: 36px`, `lineHeight: 44px` |
| `headline-lg` | Plus Jakarta Sans | 32px | 700 | 40px | Normal | `fontSize: 24px`, `lineHeight: 32px` |
| `title-md` | Plus Jakarta Sans | 20px | 600 | 28px | Normal | Remains constant |
| `body-lg` | Inter | 18px | 400 | 28px | Normal | Remains constant |
| `body-md` | Inter | 16px | 400 | 24px | Normal | Remains constant |
| `label-md` | Inter | 14px | 600 | 20px | Normal | Remains constant |
| `label-sm` | Inter | 12px | 500 | 16px | Normal | Remains constant |

---

## 3. Border Radius Scale

| Token | CSS Value | Rem Value | Example Component Target |
|---|---|---|---|
| `sm` | `4px` | `0.25rem` | Mini badges, checkboxes, checkbox indicators, and tooltip boxes. |
| `DEFAULT` | `8px` | `0.5rem` | Input text fields, normal buttons, and dashboard small widgets. |
| `md` | `12px` | `0.75rem` | Category selection selectors and normal admin tables. |
| `lg` | `16px` | `1.0rem` | Navigation top/bottom bars and popover panels. |
| `xl` | `24px` | `1.5rem` | Core landing elements (job search cards, action buttons, featured containers). |
| `full` | `9999px` | — | Circle status indicators, user avatar badges, and tags. |

---

## 4. Spacing Scale

| Token Name | Value (px) | Multiplier | Usage Context |
|---|---|---|---|
| `xs` | 4px | 1x | Inner divider gaps, checkbox padding, mini item spacing. |
| `sm` | 8px | 2x | Input form item margin gaps and small button padding. |
| `md` | 16px | 4x | General grid gaps, list gaps, and general card inner margins. |
| `lg` | 24px | 6x | Job card internal padding and card block margins. |
| `xl` | 32px | 8x | Main homepage section headers and form separations. |
| `2xl` | 48px | 12x | Landing page padding blocks. |
| `3xl` | 64px | 16x | Large layout hero margins. |
| `gutter` | 20px | — | Grid spacing column separations. |
| `container-margin-mobile` | 16px | — | Viewport left/right safe zone on mobile. |
| `container-margin-desktop` | 40px | — | Viewport left/right safe zone on desktop screens. |
