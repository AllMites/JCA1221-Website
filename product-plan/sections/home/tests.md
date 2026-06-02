# Test Specs: Home

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Home section is a full-screen landing page with hero, project carousel, mission statements, impact stats with animated counters, and expansion plans. Tests should verify: hero renders correctly, carousel scrolls horizontally, counters animate on scroll, shell reveals on edge hover.

---

## User Flow Tests

### Flow 1: Hero Section Renders

**Scenario:** User lands on the home page

**Setup:**
- Home section renders with sample data from `sample-data.json`

**Steps:**
1. User navigates to home page route

**Expected Results:**
- [ ] Company name "JCA 1221 Holdings" is visible
- [ ] Tagline "Water Renewal for Generations" is visible
- [ ] Value statement text is visible
- [ ] Background image is loaded (water/coastal theme)

### Flow 2: Project Carousel Scrolls

**Scenario:** User scrolls below the hero to view project cards

**Steps:**
1. User scrolls down past hero
2. User sees horizontal-scrolling carousel with project cards

**Expected Results:**
- [ ] Project carousel section is visible
- [ ] At least 3 project cards are rendered
- [ ] Each card shows: project image, name, location, award badge (if present)
- [ ] Cards lift and show blue overlay on hover
- [ ] Carousel scrolls horizontally on desktop

### Flow 3: Impact Stats Animate

**Scenario:** User scrolls to impact statistics section

**Steps:**
1. User scrolls to impact stats section
2. Counters start animating from zero

**Expected Results:**
- [ ] Four stat counters are visible (water treated, races, awards, communities)
- [ ] Counters animate from 0 to target values
- [ ] Each counter has a label underneath
- [ ] Animation triggers on scroll into view (IntersectionObserver)

---

## Edge Cases

- [ ] Page renders correctly with only 1 project in carousel
- [ ] Page renders correctly with 10+ projects (no overflow issues)
- [ ] Background images gracefully degrade with fallback color
- [ ] Shell reveals within 64px of viewport top edge

---

## Sample Test Data

```typescript
const mockHero = {
  companyName: "JCA 1221 Holdings",
  tagline: "Water Renewal for Generations",
  valueStatement: "Environmental infrastructure for Philippine communities...",
  backgroundImageUrl: "/images/hero-water.jpg",
};

const mockProjects = [
  {
    id: "puerto-princesa",
    name: "Puerto Princesa Water Reclamation",
    location: "Puerto Princesa City, Palawan",
    imageUrl: "/images/projects/puerto-princesa.jpg",
    status: "operational" as const,
    keyMetric: { value: "4,000", label: "m³/day" },
    award: { title: "Asian Water Award", year: 2025 },
  },
];

const mockEmptyList: typeof mockProjects = [];
```
