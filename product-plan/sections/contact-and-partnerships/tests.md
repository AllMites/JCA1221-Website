# Test Specs: Contact & Partnerships

These test specs are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Split-panel layout with two-tier contact form (left 60%) and trust-signal content (right 40%). Tests should verify: form validates and submits, detailed fields expand/collapse, success state displays, right panel renders all trust content, all CTAs fire correct callbacks.

---

## User Flow Tests

### Flow 1: Submit Basic Form — Success Path

**Scenario:** User fills required fields and submits

**Setup:**
- ContactView renders with sample data

**Steps:**
1. User fills "Full Name" with "Juan dela Cruz"
2. User fills "Email Address" with "juan@lgu.gov.ph"
3. User fills "Organization / LGU" with "Municipality of Taytay"
4. User fills "What would you like to discuss?" with "We need a wastewater treatment facility for our growing municipality of 50,000 residents."
5. User clicks "Send Inquiry"

**Expected Results:**
- [ ] Form submits without validation errors
- [ ] Button shows loading spinner with "Sending..." text
- [ ] After ~800ms, form transitions to success state
- [ ] Success state: green checkmark circle, "Thank you for reaching out." title
- [ ] Body text explains 2-business-day response time
- [ ] Three numbered next steps are displayed
- [ ] `onSubmitBasic` callback fires with form data

### Flow 2: Form Validation — Failure Paths

**Scenario:** User submits with missing or invalid fields

**Steps:**
1. User leaves all fields empty, clicks "Send Inquiry"
2. User fills invalid email "notanemail", fills name, organization, message, clicks submit

**Expected Results:**
- [ ] Empty fields: error messages appear ("Name is required", "Email is required", "Organization is required", "Please tell us about your needs")
- [ ] Each error field shows red border and alert icon with message
- [ ] Form is not submitted (callbacks not called)
- [ ] Invalid email: error "Please enter a valid email" appears
- [ ] Short message (<20 chars): error "Please provide at least 20 characters"
- [ ] Fixing a field clears its error

### Flow 3: Expand Detailed Fields

**Scenario:** User toggles detailed form fields

**Steps:**
1. User clicks "Add more details (helps us prepare)" toggle

**Expected Results:**
- [ ] Detailed fields expand with animation (max-h transition)
- [ ] Chevron icon rotates 180°
- [ ] Toggle border highlights blue
- [ ] Fields revealed: Phone, Role, Project Type (dropdown), Estimated Timeline (dropdown)
- [ ] Project Type dropdown shows 6 options (Wastewater Treatment, Solid Waste, Septage, Learning Center, Investment, Other)
- [ ] Timeline dropdown shows 5 options (ASAP, 3 months, 6 months, 1 year, Exploratory)
- [ ] All detailed fields marked "(optional)"
- [ ] Clicking toggle again collapses the fields

### Flow 4: Submit With Detailed Fields

**Steps:**
1. User fills all basic fields
2. User expands detailed fields
3. User fills phone, role, selects project type "Wastewater Treatment Facility", selects timeline "Within 6 months"
4. User clicks "Send Inquiry"

**Expected Results:**
- [ ] `onSubmitDetailed` callback fires with complete form data including detailed fields

### Flow 5: Download Capability Statement

**Scenario:** User clicks PDF download

**Steps:**
1. User scrolls right panel to "JCA 1221 Capability Statement" card
2. User clicks the card

**Expected Results:**
- [ ] `onDownloadPDF` callback fires
- [ ] Card shows file name, file size "4.2 MB", and description
- [ ] Card has download icon and hover effect

### Flow 6: Schedule a Call

**Scenario:** User clicks schedule CTA

**Steps:**
1. User sees "Schedule a Consultation" card at top of right panel
2. User clicks "Book a Call"

**Expected Results:**
- [ ] `onScheduleCall` callback fires
- [ ] Button uses glass-tinted styling (blue-500/80, rounded-full)

---

## Component Interaction Tests

### ContactForm
- [ ] Labels with asterisk (*) for required fields
- [ ] Inputs use glassmorphic styling (rounded-xl, backdrop-blur, white border)
- [ ] Textarea resizes vertically only (resize-none)
- [ ] Dropdowns show ChevronDown icon
- [ ] Submit button: glass-tinted blue with Send icon
- [ ] Button disabled during submission

### ContactInfoPanel
- [ ] Schedule CTA card renders at top with gradient background
- [ ] Office card: address, city, phone (tel: link), email (mailto: link), hours
- [ ] Map placeholder with "View on Google Maps" text
- [ ] 3 team contact cards: Founder, Gov Partnerships Head, Investor Relations
- [ ] Each team card: avatar circle, name, title, email, phone, inquiry category tags
- [ ] Partner logo grid: 6 logos, grayscale default, color on hover
- [ ] Download card with Paperclip icon and file details

---

## Edge Cases

- [ ] Form preserves data when toggling detailed fields
- [ ] Error clears when user starts typing in a field
- [ ] Success state persists (no accidental re-submit)
- [ ] Multiple rapid submits are prevented (button disabled)
- [ ] Very long message text wraps correctly
- [ ] Mobile: split panel stacks vertically (form above info)
- [ ] Right panel scrolls independently on desktop (sticky)

---

## Sample Test Data

```typescript
const mockFormData = {
  fullName: "Juan dela Cruz",
  email: "juan@lgu.gov.ph",
  organization: "Municipality of Taytay",
  message: "We need a wastewater treatment facility for our growing municipality.",
  phone: "+63 912 345 6789",
  role: "Municipal Planning Officer",
  projectType: "wastewater-treatment",
  estimatedTimeline: "6-months",
};

const mockEmptyFormData = {
  fullName: "",
  email: "",
  organization: "",
  message: "",
};

const mockTeamContact = {
  id: "partnerships",
  name: "Maria Clara Santos",
  title: "Head of Government Partnerships",
  email: "mc.santos@jca1221.com",
  phone: "+63 2 8123 4568",
  inquiryCategories: ["LGU Partnerships", "National Government Agency Inquiries"],
};
```
