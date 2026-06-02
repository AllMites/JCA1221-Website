# Test Specs: Projects & Track Record

These test specs are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The Projects section has two views: a listing page with portfolio stats and a filterable grid, and a detail page with full-bleed hero, stats, technology, impact, awards, and partners. Tests should verify: summary stats render, filter pills work, cards navigate to detail, detail renders all sections, empty states display correctly.

---

## User Flow Tests

### Flow 1: Portfolio Summary

**Scenario:** User lands on projects listing page

**Setup:**
- ProjectList renders with sample data (3 projects)

**Steps:**
1. User navigates to Projects page

**Expected Results:**
- [ ] Portfolio summary bar renders with 4 stat counters
- [ ] Counters animate from 0 on scroll into view
- [ ] Stats show: total water treated, projects operational, awards won, communities served
- [ ] Each counter has a glass icon circle

### Flow 2: Filter Projects

**Scenario:** User filters project grid by status

**Steps:**
1. User sees 3 project cards (all statuses)
2. User clicks "Operational" filter pill
3. Grid shows only 1 project (Puerto Princesa)
4. User clicks "Development" filter pill
5. Grid shows only Gingoog
6. User clicks "All" to reset

**Expected Results:**
- [ ] Filter pills: All (default active), Operational, In Development, Planning
- [ ] Active filter pill shows inset neumorphic pressed state
- [ ] Grid updates to show only matching projects
- [ ] "All" resets to full grid

### Flow 3: Empty Filter Result

**Setup:**
- Project list with only operational projects
- User clicks "Planning" filter

**Expected Results:**
- [ ] Grid shows empty state message instead of cards
- [ ] Empty state text provides guidance

### Flow 4: Project Detail — Full Section

**Scenario:** User views Puerto Princesa project detail (has awards, partners, full data)

**Steps:**
1. User clicks Puerto Princesa card
2. Detail view renders

**Expected Results:**
- [ ] Full-bleed dark gradient hero with project image background
- [ ] Project name "Puerto Princesa Water Reclamation & Learning Center" in hero
- [ ] Location "Puerto Princesa City, Palawan" with MapPin icon
- [ ] Status badge "Operational" visible
- [ ] Glass bridge panel (-mt-8) with hero description
- [ ] 4-column stat grid (Daily Capacity, Water Treated/Year, Project Cost, Communities Served)
- [ ] Blue-tinted technology section with description and tag pills
- [ ] Emerald-tinted impact section with before/after metrics
- [ ] Amber-tinted awards section with "Asian Water Award 2025" card
- [ ] Partners section with type badges
- [ ] Back button calls `onBack`

### Flow 5: Project Detail — Empty Awards

**Scenario:** User views Gingoog project detail (no awards)

**Setup:**
- Gingoog project has `awards: []`

**Expected Results:**
- [ ] Awards section renders empty state ("No awards yet — project in development")
- [ ] Other sections still render correctly

---

## Component Interaction Tests

### PortfolioSummaryBar
- [ ] Renders 4 stat items
- [ ] Icons render in glass circles
- [ ] Counters animate on IntersectionObserver trigger

### ProjectCard
- [ ] Renders image area with gradient overlay
- [ ] Shows status badge with correct color (Operational=green, Development=amber, Planning=slate)
- [ ] Shows location with MapPin icon
- [ ] Shows key metric in bottom section
- [ ] Hover reveals blue overlay with "View Project Details" text

---

## Edge Cases

- [ ] Project with null `yearStarted` renders without crashing
- [ ] Project with null `yearCompleted` renders without crashing
- [ ] Project with empty awards array shows empty state
- [ ] Only 1 project — grid renders single column correctly
- [ ] 10+ projects — grid handles pagination or scroll
- [ ] Very long project names truncate or wrap correctly
- [ ] Filter to a status with 0 projects shows empty state

---

## Sample Test Data

```typescript
const mockProjectCard = {
  id: "puerto-princesa",
  name: "Puerto Princesa Water Reclamation & Learning Center",
  location: "Puerto Princesa City, Palawan",
  status: "operational" as const,
  imageUrl: "/images/projects/puerto-princesa.jpg",
  shortDescription: "The Philippines' first integrated septage and sewage treatment plant...",
  keyMetric: { value: "4,000", label: "m³/day" },
  award: { title: "Asian Water Award", year: 2025, organization: "Asian Water Council" },
};

const mockProjectDetail = {
  id: "puerto-princesa",
  name: "Puerto Princesa Water Reclamation & Learning Center",
  location: "Puerto Princesa City, Palawan",
  status: "operational" as const,
  imageUrl: "/images/projects/puerto-princesa.jpg",
  heroDescription: "The Philippines' first integrated septage and sewage treatment plant...",
  yearStarted: 2020,
  yearCompleted: 2023,
  stats: [
    { value: "4,000", label: "Daily Capacity", unit: "m³/day" },
    { value: "1.46M", label: "Treated Annually", unit: "m³/year" },
  ],
  technology: { description: "Sequential Batch Reactor...", tags: ["SBR", "UV Disinfection"] },
  impact: [{ label: "Water Quality", before: "Untreated effluent", after: "98.7% clean", improvement: "+98.7%" }],
  awards: [{ title: "Asian Water Award", organization: "Asian Water Council", year: 2025 }],
  partners: [{ name: "City Government of Puerto Princesa", type: "LGU" }],
};

const mockEmptyAwards = { ...mockProjectDetail, awards: [] };
```
