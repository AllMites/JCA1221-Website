import data from '@/../product/sections/contact-and-partnerships/data.json'
import { ContactView } from './components/ContactView'

export default function ContactPreview() {
  return (
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
      onSubmitDetailed={(formData) => console.log('Detailed submission:', formData)}
      onDownloadPDF={() => console.log('Download capability statement')}
      onScheduleCall={() => console.log('Schedule a call')}
    />
  )
}
