import type { ValuePillar } from '@/../product/sections/about-and-mission/types'
import data from '@/../product/sections/about-and-mission/data.json'
import { AboutView } from './components/AboutView'

export default function AboutPreview() {
  return (
    <AboutView
      founderLetter={data.founderLetter}
      founderProfile={data.founderProfile}
      valuePillars={data.valuePillars as ValuePillar[]}
      ctaText={data.ctaText}
      onCtaClick={() => void 0}
    />
  )
}
