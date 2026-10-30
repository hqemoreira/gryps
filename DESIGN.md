---
name: GRYPS Polar Console
description: Dark ops-console identity for a Nordic/Arctic connectivity resilience research prototype
colors:
  primary: "#4FA8FF"
  secondary: "#64748B"
  tertiary: "#6EE7F9"
  neutral: "#070B12"
  surface: "#0B1220"
  surface2: "#111827"
  text: "#F7FAFC"
  success: "#2ED47A"
  warning: "#F5B84A"
  critical: "#F25555"
  on-primary: "#070B12"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: 700
    letterSpacing: -0.02em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.625rem
    fontWeight: 500
    letterSpacing: 0.1em
rounded:
  sm: 6px
  md: 12px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
---

## Overview

Polar ops console: deep night canvas, ice-blue signal, monospace data chrome. One job owns the Advisor — generate a Resilience Signature. Atmosphere comes from aurora/grid, not purple SaaS kits.

## Colors

- **Primary (#4FA8FF):** CTA and interactive emphasis
- **Tertiary (#6EE7F9):** secondary signal / gradient end
- **Neutral (#070B12):** page foundation
- **Surfaces:** elevated panels for forms and Signature cards
- Accents for grade/status only (green / amber / red) — scarce

## Typography

Space Grotesk for UI; JetBrains Mono for scores, labels, hashes. Reading measure ~65ch on Advisor support copy.

## Layout

Narrow content for Advisor (`--content-narrow`). Hero can breathe; Advisor is Operate mode — quiet panels, task-first. Mobile: sticky CTA to `#advisor`.

## Elevation & Depth

Flat dark panels with light borders; soft card shadow sparingly. Prefer border hierarchy over heavy shadows.

## Shapes

12px default radius on forms/cards; sharper chips for grade badges.

## Components

Primary CTA full-width on Advisor form; focus-visible retained; loading uses spinner + muted surface. Signature teaser shows two-layer bars (Conditions / Mitigation).

## Do's and Don'ts

- Do: deterministic score authority; non-commercial research framing
- Do: show Model v0.4 layers on Initial Assessment
- Don't: invent live RF, SLAs, or compliance claims
- Don't: purple-indigo AI defaults, eyebrow spam above every heading, nested marketing cards in the Advisor job

## Known Gaps

- Exact aurora gradient stops vs marketing hero photography may still drift between themes
- Finnish copy parity for new error “Next:” strings — present; verify in UI smoke
- Fonts load via next/font or CSS — confirm production FOIT/FOUT [TBD]
