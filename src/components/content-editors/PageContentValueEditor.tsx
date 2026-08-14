import { TagPillInput } from './TagPillInput'
import { RepeatableRowEditor, type RowFieldDef } from './RepeatableRowEditor'
import { ImagePicker } from './ImagePicker'
import { inputBase, inputNormal, textareaBase } from './styles'

type KnownField = { name: string; label: string; type: 'text' | 'textarea' | 'image' }

// Known page/section/key combinations get their real field shape instead of
// the generic fallback below. Add entries here as more page_content rows
// gain a stable, documented shape (see docs/cms-json-audit.md §5).
const KNOWN_SHAPES: Record<string, KnownField[]> = {
  'home:hero:content': [
    { name: 'siteName', label: 'Site Name', type: 'text' },
    { name: 'tagline', label: 'Tagline', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'backgroundImage', label: 'Background Image', type: 'image' },
    { name: 'ctaLabel', label: 'CTA Label', type: 'text' },
    { name: 'ctaHref', label: 'CTA Link', type: 'text' },
  ],
}

function humanize(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

interface PageContentValueEditorProps {
  page: string
  section: string
  contentKey: string
  value: unknown
  onChange: (value: unknown) => void
}

/** Shape switches on the selected page+section+key. Known keys (e.g.
 *  home/hero/content) render their real field set; anything unrecognized
 *  falls back to a labeled, structural editor — never raw JSON. */
export function PageContentValueEditor({ page, section, contentKey, value, onChange }: PageContentValueEditorProps) {
  const shapeKey = `${page}:${section}:${contentKey}`
  const known = KNOWN_SHAPES[shapeKey]

  if (known) {
    const obj = (typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {}) as Record<string, string>
    return (
      <div className="space-y-3">
        {known.map((f) => (
          <div key={f.name}>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea value={obj[f.name] ?? ''} onChange={(e) => onChange({ ...obj, [f.name]: e.target.value })} rows={3} className={`${textareaBase} ${inputNormal} resize-none`} />
            ) : f.type === 'image' ? (
              <ImagePicker value={obj[f.name] || null} onChange={(url) => onChange({ ...obj, [f.name]: url ?? '' })} />
            ) : (
              <input value={obj[f.name] ?? ''} onChange={(e) => onChange({ ...obj, [f.name]: e.target.value })} className={`${inputBase} ${inputNormal}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return <DynamicValueEditor value={value} onChange={onChange} />
}

function DynamicValueEditor({ value, onChange, depth = 0 }: { value: unknown; onChange: (v: unknown) => void; depth?: number }) {
  if (value === null || value === undefined || typeof value === 'string') {
    return (
      <textarea
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`${textareaBase} ${inputNormal} resize-none`}
      />
    )
  }

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      return <TagPillInput value={value as string[]} onChange={onChange} />
    }
    const objRows = value as Record<string, string>[]
    const sampleKeys = objRows.length > 0 ? Object.keys(objRows[0]) : ['label', 'value']
    const fields: RowFieldDef[] = sampleKeys.map((k) => ({ name: k, label: humanize(k), type: 'text' }))
    return (
      <RepeatableRowEditor
        rows={objRows}
        onChange={onChange}
        fields={fields}
        emptyRow={Object.fromEntries(sampleKeys.map((k) => [k, '']))}
      />
    )
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return (
      <div className={depth > 0 ? 'pl-3 border-l border-slate-200 dark:border-white/10 space-y-3' : 'space-y-3'}>
        {Object.entries(obj).map(([k, v]) => (
          <div key={k}>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">{humanize(k)}</label>
            <DynamicValueEditor value={v} onChange={(next) => onChange({ ...obj, [k]: next })} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <input
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} ${inputNormal}`}
    />
  )
}
