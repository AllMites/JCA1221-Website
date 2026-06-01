import data from '@/../product/sections/about-and-mission/data.json'
import { AboutView } from './components/AboutView'

export default function AboutPreview() {
  return (
    <AboutView
      founderLetter={data.founderLetter}
      founderProfile={data.founderProfile}
      valuePillars={data.valuePillars}
      ctaText={data.ctaText}
      onCtaClick={() => console.log('CTA: Partner With Us')}
    />
  )
}
