import type { FormConfig } from '@/../product/sections/contact-and-partnerships/types'
import data from '@/../product/sections/contact-and-partnerships/data.json'
import { ContactView } from './components/ContactView'

const teamContacts = data.teamContacts.map((c) => ({
  ...c,
  imageUrl: c.imageUrl ?? '',
}))

export default function ContactPreview() {
  return (
    <ContactView
      sectionTitle={data.sectionTitle}
      sectionSubtitle={data.sectionSubtitle}
      formConfig={data.formConfig as FormConfig}
      inquiryTypes={data.inquiryTypes}
      timelineOptions={data.timelineOptions}
      teamContacts={teamContacts}
      officeInfo={data.officeInfo}
      partnerLogos={data.partnerLogos}
      onSubmitBasic={(formData) => void formData}
      onSubmitDetailed={(formData) => void formData}
    />
  )
}
