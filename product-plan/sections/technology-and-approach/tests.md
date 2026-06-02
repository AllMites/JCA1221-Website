# Test Specs: Technology & Approach

These test specs are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Four color-coded sections: emerald process flow (5 animated steps), amber comparison (JCA vs Traditional rows), blue technology grid (4 pillars in 2×2 layout), and slate live dashboard (auto-scrolling metric cards with CSS charts and live counters). Tests should verify: process steps animate in, comparison rows render with correct indicators, tech grid displays all pillars, dashboard auto-scrolls with live counters.

---

## User Flow Tests

### Flow 1: Process Flow Renders

**Scenario:** User views the emerald process flow section

**Setup:**
- TechnologyView renders with sample data

**Steps:**
1. User scrolls to process flow section

**Expected Results:**
- [ ] Section header "How It Works" is visible
- [ ] Subtitle mentions "From Waste to Resource" (mono label)
- [ ] 5 process steps render: Collection & Screening, Biological Treatment, Clarification, UV Disinfection, Clean Water Release
- [ ] Each step has: icon (Filter, Microscope, Beaker, Sun, Droplets), step number badge, title, description
- [ ] Steps render horizontally on desktop (lg breakpoint)
- [ ] Steps render vertically on mobile
- [ ] Steps stagger-fade-in on scroll (IntersectionObserver)
- [ ] Connector line renders between steps

### Flow 2: Comparison Table

**Scenario:** User scrolls to amber comparison section

**Steps:**
1. User scrolls to "A Different Approach" section

**Expected Results:**
- [ ] Section header "A Different Approach" is visible
- [ ] Subtitle explains why JCA's model works where traditional fails
- [ ] Desktop: column headers show "JCA 1221" (blue, Check icon) and "Traditional" (slate, X icon)
- [ ] 6 comparison rows render
- [ ] All 6 rows show `jcaIsBetter: true` — JCA column has Check, Traditional has X
- [ ] Each row has a label (left column)
- [ ] Rows stagger in on scroll

### Flow 3: Technology Grid

**Scenario:** User scrolls to blue technology pillar section

**Steps:**
1. User scrolls to "Four Pillars of Our Systems"

**Expected Results:**
- [ ] 2×2 grid on desktop, stacked on mobile
- [ ] Four pillars: Biological Nutrient Removal, Modular Phased Design, Solar-Assisted & IoT Connected, Scalable from City to Island
- [ ] Each pillar card: icon (Microscope, Blocks, Zap, Globe), title, description paragraph, technology tag pills
- [ ] Cards lift on hover with blue glow shadow
- [ ] Tag pills use mono font, rounded-full, blue-tinted

### Flow 4: Live Dashboard

**Scenario:** User scrolls to slate live dashboard section

**Steps:**
1. User scrolls to "Live Impact Dashboard"

**Expected Results:**
- [ ] Section header "Live Impact Dashboard" is visible
- [ ] Green pulse dot with "— since January 2024" text
- [ ] Metric cards auto-scroll horizontally (infinite wraparound)
- [ ] 4 metric cards: Total Water Treated, Daily Treatment Volume, Water Quality Index, Solar Energy Contribution
- [ ] Each card shows: live pulse indicator ("Live" badge), current value with unit, context sentence, CSS chart
- [ ] Counters increment based on system time
- [ ] Charts render: line (cumulative treated), bar (daily volume), area (water quality), bar (solar energy)
- [ ] No scrollbar visible (overflow-x: hidden)
- [ ] Gradient fade edges on carousel sides
- [ ] Dot indicators below carousel

---

## Edge Cases

- [ ] Process flow handles 2 steps and 10+ steps without breaking
- [ ] Comparison handles rows with very long text
- [ ] Tech grid handles 1-6 pillars (layout adjusts)
- [ ] Dashboard handles 1-10 metric cards (scroll adjusts)
- [ ] SVG charts render correctly with 1 data point
- [ ] Missing icon names fall back gracefully (no crash)
- [ ] Live counters continue incrementing while tab is open

---

## Sample Test Data

```typescript
const mockProcessSteps = [
  { step: 1, title: "Collection & Screening", icon: "Filter", description: "Raw wastewater arrives..." },
  { step: 2, title: "Biological Treatment", icon: "Microscope", description: "Microorganisms consume pollutants..." },
];

const mockComparisonPoint = {
  label: "Treatment method",
  jca: "Biological — microorganisms do the work",
  traditional: "Chemical-heavy, energy-intensive",
  jcaIsBetter: true,
};

const mockLiveMetric = {
  id: "cumulative-treated",
  label: "Total Water Treated Since Commissioning",
  currentValue: "2,920,000",
  unit: "m³",
  context: "Equivalent to 1,168 Olympic swimming pools",
  chartType: "line" as const,
  dataPoints: [
    { label: "Jan 2024", value: 120000 },
    { label: "Apr 2024", value: 360000 },
  ],
};
```
