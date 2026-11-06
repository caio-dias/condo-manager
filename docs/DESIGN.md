---
name: Civic Horizon
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#42474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#532800'
  on-tertiary: '#ffffff'
  tertiary-container: '#743b00'
  on-tertiary-container: '#f9a767'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for the complex ecosystem of modern property management, bridging the gap between administrative efficiency and resident comfort. The brand personality is **Trustworthy, Efficient, and Accessible**. It evokes a sense of organized community and reliable oversight.

The visual style is **Corporate Modern**, prioritizing clarity and functional aesthetics. It avoids decorative excess in favor of high-legibility layouts and a systematic hierarchy. The UI uses generous whitespace to reduce cognitive load during administrative tasks, while utilizing soft shadows and subtle transitions to feel approachable for residents. The goal is to transform "management software" into a frictionless utility.

## Colors

This design system utilizes a palette rooted in "Institutional Blue" to reinforce stability and authority. 

- **Primary (#0F4C81):** A deep, reliable blue used for primary actions, active navigation states, and brand-critical elements.
- **Secondary/Neutral (#4A5568):** A cool slate gray used for body text, icons, and secondary information to maintain a neutral professional tone.
- **Surface & Backgrounds:** The interface relies on a range of grays (`#F7FAFC` to `#EDF2F7`) to differentiate content zones without the harshness of pure white.
- **Semantic Status:** 
    - **Success (Green):** Used for "Resolved" tickets and paid invoices.
    - **Warning (Yellow/Amber):** Used for "Under Analysis" or "Expiring Soon" notifications.
    - **Error (Red):** Reserved for "Pending" payments, urgent maintenance, or overdue tasks.

## Typography

The typography strategy balances the geometric modernity of **Manrope** for headings with the systematic legibility of **Inter** for data-heavy interfaces.

- **Headlines:** Use Manrope with tighter letter-spacing for a confident, architectural feel.
- **Body:** Inter is used for all functional text. Line heights are kept generous (1.5x+) to ensure readability in long-form reports or community announcements.
- **Data Display:** For financial tables and unit numbers, use `body-sm` with tabular lining figures if available, ensuring columns of numbers align perfectly.
- **Mobile Scaling:** Headlines downscale significantly on mobile to prevent awkward line breaks in narrow containers.

## Layout & Spacing

The layout utilizes a **Fixed-Fluid Hybrid** grid. 
- **Administrative Dashboard:** Employs a sidebar navigation (240px) with a fluid content area that expands to a max-width of 1440px.
- **Resident View:** Primarily mobile-first, utilizing a single column fluid layout with 16px side margins.

Spacing follows a strict 4px base unit. 
- Use **16px (md)** for internal card padding and element grouping.
- Use **24px (lg)** for vertical section spacing.
- Gutters between grid items are fixed at **20px** to provide clear separation of distinct management modules (e.g., Financial Summary vs. Recent Visitors).

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a structured hierarchy without visual clutter.

- **Level 0 (Background):** Neutral light gray (`#F7FAFC`). Used for the main application canvas.
- **Level 1 (Cards/Surface):** Pure white (`#FFFFFF`) with a very soft, diffused shadow (`0px 2px 4px rgba(0,0,0,0.05)`). Used for the primary content containers.
- **Level 2 (Interactive/Floating):** White with a more pronounced shadow (`0px 10px 15px rgba(0,0,0,0.1)`). Used for dropdowns, modals, and active "hover" states for clickable cards.
- **Dividers:** Use 1px borders in a light gray (`#E2E8F0`) instead of shadows to separate line items within lists.

## Shapes

The shape language is **Rounded**, reflecting a modern and friendly approach.
- **Standard Elements:** 0.5rem (8px) corner radius for buttons, input fields, and small UI components.
- **Large Containers:** 1rem (16px) corner radius for main dashboard cards and modals to create a "soft-professional" appearance.
- **Chips/Badges:** Fully pill-shaped for status indicators (Resolved, Pending) to distinguish them clearly from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Institutional Blue with white text. Secondary buttons use a light gray ghost style. Buttons have a minimum height of 44px for touch-friendliness on mobile.
- **Cards:** The central component of the design. Cards must have a 1px subtle border (`#EDF2F7`) and the Level 1 shadow. Header areas within cards should be separated by a light divider.
- **Status Chips:** High-contrast background with dark text for maximum legibility. Green/Yellow/Red backgrounds should be desaturated to ensure text remains readable.
- **Inputs:** Fields use a 1px border that thickens and changes to Primary Blue on focus. Labels are always positioned above the field using `label-md`.
- **Data Tables:** Row-based with alternating subtle backgrounds or clear dividers. Actions (Edit/View) should be grouped on the far right.
- **Resident Features:** Use "Action Cards" for common tasks (e.g., "Reserve Ballroom", "Authorize Guest") featuring an icon, a title, and a clear chevron to indicate clickability.