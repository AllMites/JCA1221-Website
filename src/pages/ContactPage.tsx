import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ContactView } from '@/sections/contact-and-partnerships/components/ContactView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import { submitContact } from '@/lib/api'
import type { FormConfig } from '@/../product/sections/contact-and-partnerships/types'
import data from '@/../product/sections/contact-and-partnerships/data.json'

export function ContactPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Contact — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        <ContactView
        sectionTitle={data.sectionTitle}
        sectionSubtitle={data.sectionSubtitle}
        formConfig={data.formConfig as FormConfig}
        inquiryTypes={data.inquiryTypes}
        timelineOptions={data.timelineOptions}
        teamContacts={data.teamContacts}
        officeInfo={data.officeInfo}
        partnerLogos={data.partnerLogos}
        downloadableResource={data.downloadableResource}
        schedulingInfo={data.schedulingInfo}
        onSubmitBasic={(formData) => {
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
        }}
        onSubmitDetailed={(formData) => {
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
        }}
        onDownloadPDF={() => {
          // Download triggered by anchor href
        }}
        onScheduleCall={() =>
          window.open(data.schedulingInfo.calendarUrl, '_blank')
        }
        />
      </ErrorBoundary>
    </AppShell>
  )
}
