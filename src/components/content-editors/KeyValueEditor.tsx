import type { ProjectTechnology } from '@/lib/content-types'
import { TagPillInput } from './TagPillInput'
import { inputNormal, textareaBase } from './styles'

interface KeyValueEditorProps {
  value: ProjectTechnology
  onChange: (value: ProjectTechnology) => void
}

/** One description field + one TagPillInput. Backs projects.technology. */
export function KeyValueEditor({ value, onChange }: KeyValueEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Description</label>
        <textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={2}
          className={`${textareaBase} ${inputNormal} resize-none`}
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">Tags</label>
        <TagPillInput value={value.tags} onChange={(tags) => onChange({ ...value, tags })} placeholder="Add a technology tag…" />
      </div>
    </div>
  )
}
