import type { ProjectCard } from '@/../product/sections/projects-and-track-record/types'
import data from '@/../product/sections/projects-and-track-record/data.json'
import { ProjectList } from './components/ProjectList'

export default function ProjectsPreview() {
  return (
    <ProjectList
      portfolioSummary={data.portfolioSummary}
      projects={data.projects as unknown as ProjectCard[]}
      onProjectClick={(id) => void id}
      onFilterChange={(status) => void status}
    />
  )
}
