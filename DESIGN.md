---
version: alpha
name: ChatGPT Clean & Power - Obsidian Glass HUD
colors:
  surface-canvas: "#07090e"
  surface-glass-subtle: "rgba(255, 255, 255, 0.03)"
  surface-glass-card: "rgba(255, 255, 255, 0.05)"
  surface-glass-elevated: "rgba(255, 255, 255, 0.08)"
  surface-glass-hover: "rgba(255, 255, 255, 0.09)"
  
  border-hairline: "rgba(255, 255, 255, 0.07)"
  border-glass: "rgba(255, 255, 255, 0.12)"
  border-highlight: "rgba(255, 255, 255, 0.22)"
  
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-tertiary: "#64748b"
  
  accent-cyan: "#38bdf8"
  accent-cyan-glow: "rgba(56, 189, 248, 0.25)"
  accent-emerald: "#10b981"
  accent-emerald-glow: "rgba(16, 185, 129, 0.25)"
  accent-amber: "#f59e0b"
  accent-amber-glow: "rgba(245, 158, 11, 0.25)"
  accent-indigo: "#818cf8"
typography:
  headline-sm:
    fontFamily: Inter, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 700
    lineHeight: 18px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-xs:
    fontFamily: Inter, -apple-system, sans-serif
    fontSize: 10px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.06em
  mono-number:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 24px
rounded:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  full: 9999px
spacing:
  base: 8px
  card-padding: 12px
  gutter: 10px
components:
  glass-card:
    backgroundColor: "{colors.surface-glass-card}"
    borderColor: "{colors.border-hairline}"
    rounded: "{rounded.md}"
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)"
  glass-btn:
    backgroundColor: "{colors.surface-glass-elevated}"
    borderColor: "{colors.border-glass}"
    rounded: "{rounded.md}"
    textColor: "{colors.text-primary}"
---

# Overview (Brand & Style)

The **ChatGPT Clean & Power** design system employs an **"Obsidian Glass HUD"** aesthetic. It moves away from generic, flat dark-mode templates by adopting the physics of frosted crystalline glass, specular edge highlights, and high-precision telemetry elements.

The visual atmosphere is understated, luxurious, and tactile. Instead of heavy opaque navy cards, components float with soft blur filters (`backdrop-filter: blur(20px)`), allowing the subtle radial gradients of the canvas to bleed through. The interface feels alive through diffuse, colored glows rather than harsh solid fills.

---

## Colors

The color palette is built on deep obsidian tones combined with varying layers of white translucency:

- **Obsidian Canvas (`#07090e`):** The deep foundation layer, complemented by subtle atmospheric radial ambient glows.
- **Glass Surfaces (`rgba(255, 255, 255, 0.03 - 0.09)`):** Transparent frosted layers that provide depth without visual heaviness.
- **Specular Hairlines (`rgba(255, 255, 255, 0.08 - 0.22)`):** 1px borders with top-lit specular highlights that give panels physical glass thickness.
- **Starlight Cyan (`#38bdf8`):** The primary interaction accent, used for active states, tab highlights, and telemetry focus.
- **Emerald Telemetry (`#10b981`):** Indicates real-time shield protection and active filters.
- **Amber Crown (`#f59e0b`):** Reserved strictly for PRO features and lifetime value badges.

---

## Typography

A dual-font strategy combines human clarity with technical precision:

- **Primary UI Font (Inter):** 
  - Brand titles and section headings use bold weights (`700`) with tight letter-spacing (`-0.02em`).
  - Micro-labels, badge keys, and category titles use uppercase styling (`10px`), medium weight, and wide letter-spacing (`0.06em` to `0.08em`) to evoke technical instrument panels.
- **Monospace Font (JetBrains Mono):**
  - Used for numerical telemetry (e.g., blocked ad counts, license keys, and timestamps).
  - Ensures clean tabular alignment and zero ambiguity between glyphs.

---

## Layout & Spacing

- **8-Point Rhythm:** Spacing strictly adheres to an 8px grid (`4px`, `8px`, `12px`, `16px`, `24px`).
- **Dense Information Density:** Standard padding is `12px` to maximize utility within a compact extension popup (`360px` width) while retaining visual breathing room.

---

## Elevation & Depth

Depth is created through light physics, not solid darkness:

1. **Level 1 (Canvas):** Dark obsidian substrate with ambient background glow.
2. **Level 2 (Standard HUD Panels):** `backdrop-filter: blur(16px)`, `background: rgba(255, 255, 255, 0.04)`, `border: 1px solid rgba(255, 255, 255, 0.08)`.
3. **Level 3 (Elevated Floating Modals):** `backdrop-filter: blur(32px)`, `background: rgba(15, 23, 42, 0.85)`, `box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6)`.
4. **Edge Specularity:** All cards feature an inner top highlight `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)`.

---

## Components

- **Tactile Switches:** Precision pill switches with soft glowing halos when active.
- **HUD Telemetry Grid:** Dual-metric boxes with monospace numbers and subtle pulse dots.
- **Glass Action Buttons:** Soft frosted buttons that depress (`scale(0.97)`) on click and lift with a subtle glow on hover.
- **Injected Floating Modal:** Appears over ChatGPT as a frosted glass HUD card.

---

## Do's and Don'ts

- **Don't** use solid opaque background boxes (e.g., `#1e293b`). Always use alpha layers with blur.
- **Don't** use default browser fonts or oversized generic round buttons.
- **Don't** use loud, saturated purple gradients. Use subtle, diffuse cyan and obsidian glows.
- **Don't** use flat 1px gray borders without a specular top-highlight (`inset 0 1px 0 rgba(...)`).
- **Do** format technical numbers in monospace (`JetBrains Mono`).
- **Do** maintain micro-labels in uppercase with tracking (`letter-spacing: 0.06em`).
- **Do** provide instant physical spring feedback on all clicks.
