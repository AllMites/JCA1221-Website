import type { FormConfig } from '@/../product/sections/contact-and-partnerships/types'
import data from '@/../product/sections/contact-and-partnerships/data.json'
import { ContactView } from './components/ContactView'

export default function ContactPreview() {
  return (
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
      onSubmitBasic={(formData) => void formData}
      onSubmitDetailed={(formData) => void formData}
      onDownloadPDF={() => void 0}
      onScheduleCall={() => void 0}
    />
  )
}
