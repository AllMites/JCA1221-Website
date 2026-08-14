import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { ImagePicker } from './ImagePicker'
import { inputBase, inputNormal, textareaBase } from './styles'

export type RowFieldType = 'text' | 'textarea' | 'select' | 'image'

export interface RowFieldDef {
  name: string
  label: string
  type?: RowFieldType
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface RepeatableRowEditorProps {
  rows: Record<string, string>[]
  onChange: (rows: Record<string, string>[]) => void
  fields: RowFieldDef[]
  addLabel?: string
  emptyRow?: Record<string, string>
}

/** Array-of-objects editor: add/remove/reorder rows, one input per field.
 *  Backs projects.stats/impact_metrics, csr_projects.stats/timeline. */
export function RepeatableRowEditor({ rows, onChange, fields, addLabel = 'Add row', emptyRow }: RepeatableRowEditorProps) {
  const blank = emptyRow ?? Object.fromEntries(fields.map((f) => [f.name, '']))

  function updateRow(i: number, name: string, val: string) {
    const next = rows.slice()
    next[i] = { ...next[i], [name]: val }
    onChange(next)
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i))
  }
  function moveRow(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    const next = rows.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function addRow() {
    onChange([...rows, { ...blank }])
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="relative border border-slate-200 dark:border-white/10 rounded-field p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((f) => (
                <div key={f.name} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={row[f.name] ?? ''} onChange={(e) => updateRow(i, f.name, e.target.value)} className={`${inputBase} ${inputNormal}`}>
                      {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={row[f.name] ?? ''} onChange={(e) => updateRow(i, f.name, e.target.value)} rows={2} placeholder={f.placeholder} className={`${textareaBase} ${inputNormal} resize-none`} />
                  ) : f.type === 'image' ? (
                    <ImagePicker value={row[f.name] || null} onChange={(url) => updateRow(i, f.name, url ?? '')} />
                  ) : (
                    <input value={row[f.name] ?? ''} onChange={(e) => updateRow(i, f.name, e.target.value)} placeholder={f.placeholder} className={`${inputBase} ${inputNormal}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 pt-5 flex-shrink-0">
              <button type="button" onClick={() => moveRow(i, -1)} disabled={i === 0} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30" title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => moveRow(i, 1)} disabled={i === rows.length - 1} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30" title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => removeRow(i)} className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" title="Remove row"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-field border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
        <Plus className="w-3.5 h-3.5" />{addLabel}
      </button>
    </div>
  )
}
