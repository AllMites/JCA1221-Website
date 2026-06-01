import type { ProjectDetail as ProjectDetailType } from '@/../product/sections/projects-and-track-record/types'
import data from '@/../product/sections/projects-and-track-record/data.json'
import { ProjectDetail } from './components/ProjectDetail'

export default function ProjectDetailPreview() {
  // Show the first project (Puerto Princesa — has awards, partners, full data)
  const project = data.projects[0]

  return (
    <ProjectDetail
      project={project as ProjectDetailType}
      onBack={() => void 0}
    />
  )
}
