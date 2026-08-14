import type { TeamMemberLink } from '@/lib/content-types'
import { RepeatableRowEditor, type RowFieldDef } from './RepeatableRowEditor'

const FIELDS: RowFieldDef[] = [
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'email', label: 'Email' }, { value: 'linkedin', label: 'LinkedIn' }] },
  { name: 'label', label: 'Label', type: 'text', placeholder: 'LinkedIn' },
  { name: 'url', label: 'URL', type: 'text', placeholder: 'https://... or mailto:...' },
]

interface LinksEditorProps {
  value: TeamMemberLink[]
  onChange: (links: TeamMemberLink[]) => void
}

/** Repeatable {type, label, url} rows with a type dropdown. Backs team_members.links. */
export function LinksEditor({ value, onChange }: LinksEditorProps) {
  return (
    <RepeatableRowEditor
      rows={value as unknown as Record<string, string>[]}
      onChange={(rows) => onChange(rows as unknown as TeamMemberLink[])}
      fields={FIELDS}
      addLabel="Add link"
      emptyRow={{ type: 'email', label: '', url: '' }}
    />
  )
}
