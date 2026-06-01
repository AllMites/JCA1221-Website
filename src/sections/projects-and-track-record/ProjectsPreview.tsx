import data from '@/../product/sections/projects-and-track-record/data.json'
import { ProjectList } from './components/ProjectList'

export default function ProjectsPreview() {
  return (
    <ProjectList
      portfolioSummary={data.portfolioSummary}
      projects={data.projects}
      onProjectClick={(id) => console.log('Navigate to project:', id)}
      onFilterChange={(status) => console.log('Filter changed:', status)}
    />
  )
}
