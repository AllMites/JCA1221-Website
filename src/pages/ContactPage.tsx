import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ContactView } from '@/sections/contact-and-partnerships/components/ContactView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
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
        formConfig={data.formConfig}
        inquiryTypes={data.inquiryTypes}
        timelineOptions={data.timelineOptions}
        teamContacts={data.teamContacts}
        officeInfo={data.officeInfo}
        partnerLogos={data.partnerLogos}
        downloadableResource={data.downloadableResource}
        schedulingInfo={data.schedulingInfo}
        onSubmitBasic={(formData) => console.log('Basic submission:', formData)}
        onSubmitDetailed={(formData) =>
          console.log('Detailed submission:', formData)
        }
        onDownloadPDF={() => console.log('Download capability statement')}
        onScheduleCall={() =>
          window.open('https://calendly.com/jca1221', '_blank')
        }
        />
      </ErrorBoundary>
    </AppShell>
  )
}
