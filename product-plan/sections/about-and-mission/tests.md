# Test Specs: About & Mission

These test specs are **framework-agnostic**. Adapt them to your testing setup.

## Overview

The About section displays a founder's letter in a frosted glass panel, four value pillar sections with distinct colors, and a founder profile with quotes and timeline. Tests should verify: letter renders, value pillars display correctly with sub-points, founder profile shows quotes and milestones, CTA fires callback.

---

## User Flow Tests

### Flow 1: Founder's Letter Renders

**Scenario:** User enters About section

**Setup:**
- About section renders with sample data

**Steps:**
1. User navigates to About & Mission page

**Expected Results:**
- [ ] Dark water-gradient background is visible
- [ ] Frosted glass panel contains founder's letter text
- [ ] Letter text is legible over the translucent background
- [ ] Signature appears after em-dash split at letter end
- [ ] Atmospheric glass orbs are visible in background

### Flow 2: Value Pillars Display

**Scenario:** User scrolls through value pillar sections

**Steps:**
1. User scrolls through four color-coded sections
2. Each section has a pillar header card and sub-point cards

**Expected Results:**
- [ ] Four value pillar sections render (Integrity, Circular Economy, Service Over Profit, Track Record)
- [ ] Each section has distinct background color
- [ ] Pillar header card: icon, title, description
- [ ] Sub-point glass cards appear below each header
- [ ] Cards use glassmorphism (backdrop-blur, translucent bg, glass border)
- [ ] Sections alternate layout (even: flex-row, odd: flex-row-reverse)

### Flow 3: Founder Profile

**Scenario:** User scrolls to founder profile

**Steps:**
1. User scrolls to bottom of About section

**Expected Results:**
- [ ] Founder photo appears in glass circle
- [ ] Founder name and title are visible ("Atty. Jehremiah Asis", "Founder & Chairman")
- [ ] 2-3 pull quotes render in frosted glass cards
- [ ] Vertical timeline shows 5 career milestones with years
- [ ] Timeline has gradient vertical line and dot indicators

### Flow 4: CTA Navigates

**Scenario:** User clicks CTA button at bottom

**Steps:**
1. User scrolls to CTA section
2. User clicks CTA button

**Expected Results:**
- [ ] `onCtaClick` callback fires
- [ ] Button uses glass-tinted styling (blue-500/80, rounded-full)

---

## Edge Cases

- [ ] Letter text with long paragraphs wraps correctly in glass panel
- [ ] Value pillars render correctly with varying numbers of sub-points
- [ ] Timeline handles 1 milestone and 10+ milestones without breaking
- [ ] Layout stacks vertically on mobile (sm breakpoint)

---

## Sample Test Data

```typescript
const mockValuePillar = {
  id: "integrity",
  title: "Integrity & Zero Corruption",
  icon: "Shield",
  description: "We operate under the principle of 'Serbisyo, Hindi Negosyo'...",
  subPoints: [
    { title: "Zero tolerance", description: "No corruption, no exceptions..." },
    { title: "Transparent reporting", description: "Every project has open books..." },
  ],
  sectionColor: "amber",
  glassTint: "amber",
};

const mockFounder = {
  name: "Atty. Jehremiah Asis",
  title: "Founder & Chairman",
  imageUrl: "/images/team/jehremiah-asis.png",
  bio: "Former corporate lawyer...",
  quotes: [{ text: "Water is life...", context: "On founding JCA 1221" }],
  milestones: [{ year: 2015, title: "Founded JCA 1221", description: "..." }],
};
```
