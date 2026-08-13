---
name: Kinetic Index
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5f5b'
  on-secondary: '#ffffff'
  secondary-container: '#e1e0db'
  on-secondary-container: '#62635f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001e2b'
  on-tertiary-container: '#008ebc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e3e2de'
  secondary-fixed-dim: '#c7c7c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#464744'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#75d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: Anton
    fontSize: 120px
    fontWeight: '400'
    lineHeight: 100px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.05em
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 64px
  gutter: 20px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style

This design system establishes a high-utility, editorial-grade interface for critical minerals intelligence. It merges the urgent, information-dense aesthetic of a Bloomberg terminal with the refined layouts of a modern architectural magazine. The brand personality is authoritative, analytical, and physically grounded, treating digital data points as if they were printed on tangible index cards.

The visual style is a hybrid of **Brutalism** and **Experimental Editorial**. It rejects digital depth (gradients/blurs) in favor of **Tonal Layering** and physical metaphors. Key characteristics include:
- **Physicality:** Large-radius cards that feel like tangible objects.
- **Asymmetry:** Slight rotational offsets (+/- 1.5 degrees) on container elements to mimic cards scattered on a desk.
- **High Information Density:** Utilizing monospace fonts for raw data to emphasize precision and technical rigor.
- **Flat Depth:** Using sharp, low-opacity shadows and overlapping layers to create hierarchy without breaking the flat-color aesthetic.

## Colors

The palette is anchored by a warm, paper-like neutral and punctuated by high-contrast "commodity" colors. 

- **Ink & Paper:** The foundation is **Ink Black (#111111)** on **Warm Off-White (#EDECE7)**. This provides maximum legibility and an editorial feel.
- **The Index System:** **White Card (#FFFFFF)** is used exclusively for primary data containers to lift them off the background.
- **Data Categorization:** 
    - **Sky Blue:** Used for forecasting and future-facing data.
    - **Chartreuse:** Used for high-visibility metrics and active highlights.
    - **Mint:** Used for stability, positive trends, or "operational" statuses.
    - **Cream:** Used for secondary panels or tertiary informational buckets.
- **The Signature:** **Magenta Accent (#FF2AA1)** is strictly reserved for the logo and microscopic, high-priority UI signals (like a notification dot or a critical toggle state).

## Typography

The typographic hierarchy is designed for immediate impact and technical clarity.

- **Display & Headlines:** Use **Anton**. It should be scaled aggressively. Large headlines are the primary "hook" of the layout. Tight leading is essential to maintain the dense editorial feel.
- **Data & Indices:** Use **JetBrains Mono**. All numerical values, timestamps, and technical indices must be in monospace. This suggests "live data" and machine-read accuracy.
- **Functional UI:** Use **Inter**. Use it for labels, long-form descriptions, and interactive elements. It provides the necessary balance to the more expressive headline and data fonts.
- **Verticality:** In certain complex layouts, small labels (Inter Bold) can be rotated 90 degrees to act as margin markers.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. While the overall container can scale, the internal "index cards" maintain structured proportions.

- **The Grid:** A 12-column grid is used for desktop. However, components do not always snap to the grid lines—they can "float" or overlap slightly to reinforce the physical card aesthetic.
- **Card Spacing:** Use `lg` (32px) for internal padding within white cards to ensure data has breathing room.
- **The "Toss" Effect:** Apply a subtle `rotate(1.2deg)` or `rotate(-0.8deg)` to secondary cards to break the rigidity of the digital screen.
- **Layering:** Components should frequently overlap. A small data chip might sit 50% across the boundary of two cards.

## Elevation & Depth

This system avoids traditional material elevation (large blurs). Instead, it uses **Hard-Stacking**:

1.  **Level 0 (Base):** The #EDECE7 canvas.
2.  **Level 1 (Sub-surface):** Cream or Mint containers used for grouping related sections. No shadows.
3.  **Level 2 (Active Index Card):** White (#FFFFFF) cards. These use a "Physical Shadow": `offset-y: 4px`, `blur: 12px`, `color: rgba(0,0,0, 0.08)`. The shadow is tight and subtle.
4.  **Level 3 (Interactive/Hover):** When a card is engaged, the shadow deepens slightly (`offset-y: 8px`, `blur: 16px`) and the rotation may reset to 0 to indicate "focus."
5.  **Level 4 (Indices):** Tiny monospace chips that sit on top of cards, often positioned in the corners to act as "tab" markers for filing.

## Shapes

The shape language is dominated by **Large-Radius Geometry**.

- **Main Containers:** All primary white cards must use a **24px to 32px** corner radius. This high roundedness creates a friendly, tactile contrast against the sharp, condensed typography.
- **UI Elements:** Buttons and input fields use a smaller **8px** radius to feel more precise.
- **Data Chips:** Small indicators and status badges use a **4px** or **Pill** shape to distinguish them from structural containers.
- **The Rhombus:** The MZ logo and specific high-priority "Call to Action" buttons may use a diamond/rhombus shape to interrupt the rounded language.

## Components

- **Index Cards:** The primary container. Must have a header section (Inter Bold Caps) and a footer (JetBrains Mono index number).
- **Primary Buttons:** High-contrast Ink Black background with White or Chartreuse text. Use Anton for the label to maximize impact.
- **Data Indices:** Small, floating rectangles in the top-right of cards containing a JetBrains Mono "Index Code" (e.g., MZ-014).
- **Input Fields:** Flat, White Card background with a 2px Ink Black border. No inner shadows.
- **Status Indicators:** A solid circle (Mint for OK, Magenta for CRITICAL) accompanied by a JetBrains Mono label.
- **Charts:** Line and bar charts should use "Ink" lines—1px or 2px thick with no smoothing. Points should be solid 4px squares or circles in the accent colors.
- **The Global Header:** A persistent thin bar at the top with a status indicator ("ALL SYSTEMS OPERATIONAL") and the Diamond MZ logo centered.