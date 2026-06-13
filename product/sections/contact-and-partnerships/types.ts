export interface FormField {
  /** Field name for form data key */
  name: string
  /** Display label */
  label: string
  /** Input type */
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  /** Whether this field is required */
  required: boolean
  /** Placeholder text */
  placeholder: string
}

export interface FormConfig {
  /** Always-visible fields (tier 1) */
  basicFields: FormField[]
  /** Optional expandable fields (tier 2) */
  detailedFields: FormField[]
  /** Submit button label */
  submitButtonText: string
  /** Toggle text to reveal detailed fields */
  detailedToggleText: string
  /** Content displayed after successful submission */
  successMessage: {
    title: string
    body: string
    nextSteps: string[]
  }
}

export interface InquiryType {
  /** Value used in form submission */
  value: string
  /** Human-readable label */
  label: string
}

export interface TimelineOption {
  /** Value used in form submission */
  value: string
  /** Human-readable label */
  label: string
}

export interface TeamContact {
  /** Unique identifier */
  id: string
  /** Full name */
  name: string
  /** Job title */
  title: string
  /** Direct email */
  email: string
  /** Direct phone */
  phone: string
  /** Categories of inquiries this person handles */
  inquiryCategories: string[]
  /** Profile photo URL */
  imageUrl: string
}

export interface OfficeInfo {
  /** Street address */
  address: string
  /** City and postal info */
  city: string
  /** Main phone */
  phone: string
  /** General email */
  email: string
  /** Google Maps embed or link URL */
  mapEmbedUrl: string
  /** Operating hours note */
  hoursNote: string
}

export interface PartnerLogo {
  /** Organization name */
  name: string
  /** Logo image URL */
  imageUrl: string
}

export interface DownloadableResource {
  /** Display title */
  title: string
  /** Description of what the file contains */
  description: string
  /** Download filename */
  fileName: string
  /** Human-readable file size */
  fileSize: string
  /** Download URL */
  fileUrl: string
}

export interface SchedulingInfo {
  /** CTA card title */
  title: string
  /** Description of the consultation call */
  description: string
  /** Button text */
  ctaText: string
  /** External calendar/scheduling URL */
  calendarUrl: string
}

export interface ContactFormData {
  /** Basic tier — always collected */
  fullName: string
  email: string
  organization: string
  message: string
  /** Detailed tier — optional */
  phone?: string
  role?: string
  projectType?: string
  estimatedTimeline?: string
}

export interface ContactAndPartnershipsProps {
  /** Section title */
  sectionTitle: string
  /** Section subtitle */
  sectionSubtitle: string
  /** Form field configuration */
  formConfig: FormConfig
  /** Inquiry type dropdown options */
  inquiryTypes: InquiryType[]
  /** Timeline dropdown options */
  timelineOptions: TimelineOption[]
  /** Team contact cards */
  teamContacts: TeamContact[]
  /** Office location info */
  officeInfo: OfficeInfo
  /** Partner and certifier logos */
  partnerLogos: PartnerLogo[]
  /** Called when user submits basic form (tier 1 only) */
  onSubmitBasic?: (data: ContactFormData) => void
  /** Called when user submits with detailed fields (tier 2) */
  onSubmitDetailed?: (data: ContactFormData) => void
}
