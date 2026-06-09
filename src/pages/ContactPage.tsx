import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ContactView } from '@/sections/contact-and-partnerships/components/ContactView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { submitContact } from '@/lib/api'
import { usePageContent, usePartners, getPageValue } from '@/hooks/use-content'
import type {
  FormConfig, InquiryType, TimelineOption, TeamContact,
  OfficeInfo, PartnerLogo, DownloadableResource, SchedulingInfo,
} from '@/../product/sections/contact-and-partnerships/types'

const FALLBACK_TITLE = "Let's Build Together"
const FALLBACK_SUBTITLE = 'Partner with JCA 1221 to bring world-class environmental infrastructure to your community. Serious inquiries only.'

interface FormConfigWithTitles extends Record<string, unknown> {
  basicFields?: FormConfig['basicFields']
  detailedFields?: FormConfig['detailedFields']
  submitButtonText?: string
  detailedToggleText?: string
  successMessage?: FormConfig['successMessage']
  sectionTitle?: string
  sectionSubtitle?: string
}

export function ContactPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { content, loading: contentLoading } = usePageContent('contact')
  const { partners, loading: partnersLoading } = usePartners()

  const loading = contentLoading || partnersLoading

  useEffect(() => {
    document.title = 'Contact — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  // Extract form config (sectionTitle/subtitle embedded inside)
  const rawConfig = getPageValue(content, 'form', 'config') as FormConfigWithTitles | null
  const sectionTitle = rawConfig?.sectionTitle ?? FALLBACK_TITLE
  const sectionSubtitle = rawConfig?.sectionSubtitle ?? FALLBACK_SUBTITLE
  const formConfig: FormConfig = {
    basicFields: rawConfig?.basicFields ?? [],
    detailedFields: rawConfig?.detailedFields ?? [],
    submitButtonText: rawConfig?.submitButtonText ?? 'Send Inquiry',
    detailedToggleText: rawConfig?.detailedToggleText ?? 'Add more details',
    successMessage: rawConfig?.successMessage ?? { title: '', body: '', nextSteps: [] },
  }

  const inquiryTypes: InquiryType[] = (getPageValue(content, 'form', 'inquiry_types') as InquiryType[]) ?? []
  const timelineOptions: TimelineOption[] = (getPageValue(content, 'form', 'timeline_options') as TimelineOption[]) ?? []
  const teamContacts: TeamContact[] = (getPageValue(content, 'team', 'contacts') as TeamContact[]) ?? []
  const officeInfo = getPageValue(content, 'office', 'info') as OfficeInfo | null
  const downloadableResource = getPageValue(content, 'resources', 'capability_statement') as DownloadableResource | null
  const schedulingInfo = getPageValue(content, 'cta', 'scheduling') as SchedulingInfo | null

  // Map partners to PartnerLogo shape
  const partnerLogos: PartnerLogo[] = partners
    .filter((p) => p.logo)
    .map((p) => ({ name: p.name, imageUrl: p.logo! }))

  const handleSubmit = (formData: { fullName: string; email: string; organization: string; message: string; phone?: string; role?: string; projectType?: string; estimatedTimeline?: string }) => {
    submitContact({
      fullName: formData.fullName,
      email: formData.email,
      organization: formData.organization,
      message: formData.message,
      phone: formData.phone,
      role: formData.role,
      projectType: formData.projectType,
      estimatedTimeline: formData.estimatedTimeline,
    }).catch((err) => console.error('[contact] submit failed:', err))
  }

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        {loading ? (
          <PageSkeleton />
        ) : (
          <ContactView
            sectionTitle={sectionTitle}
            sectionSubtitle={sectionSubtitle}
            formConfig={formConfig}
            inquiryTypes={inquiryTypes}
            timelineOptions={timelineOptions}
            teamContacts={teamContacts}
            officeInfo={officeInfo ?? {
              address: '',
              city: '',
              phone: '',
              email: '',
              mapEmbedUrl: '',
              hoursNote: '',
            }}
            partnerLogos={partnerLogos}
            downloadableResource={downloadableResource ?? {
              title: '',
              description: '',
              fileName: '',
              fileSize: '',
              fileUrl: '',
            }}
            schedulingInfo={schedulingInfo ?? {
              title: '',
              description: '',
              ctaText: '',
              calendarUrl: '',
            }}
            onSubmitBasic={handleSubmit}
            onSubmitDetailed={handleSubmit}
            onDownloadPDF={() => {
              // Download triggered by anchor href
            }}
            onScheduleCall={() =>
              window.open(schedulingInfo?.calendarUrl ?? 'https://calendly.com/jca1221/partnership-consultation', '_blank')
            }
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
