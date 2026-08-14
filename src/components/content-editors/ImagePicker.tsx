import { useRef, useState } from 'react'
import { ImageOff, Upload, X, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { inputBase, inputNormal } from './styles'

const BUCKET_NAME = 'media'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']

async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_SIZE) throw new Error('File too large. Maximum 5MB.')
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Unsupported file type. Use PNG, JPEG, WebP, GIF, or SVG.')
  const ext = file.name.split('.').pop()
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(uniqueName, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueName)
  return data.publicUrl
}

interface SingleImageFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

// ponytail: upload-only, no "browse existing library" modal — that's the
// Phase 4 MediaLibrary-picker wiring, explicitly out of scope for this pass.
function SingleImageField({ value, onChange, label }: SingleImageFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] font-medium text-slate-500">{label}</label>}
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 flex-shrink-0 rounded-field border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageOff className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="https://... or /images/..."
            className={`${inputBase} ${inputNormal}`}
          />
          <div className="flex items-center gap-2">
            <label className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-field border border-slate-200 dark:border-white/10 cursor-pointer transition-all ${uploading ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
              <Upload className="w-3 h-3" />{uploading ? 'Uploading…' : 'Upload'}
              <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleFile} disabled={uploading} className="hidden" />
            </label>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="text-[11px] text-slate-400 hover:text-red-500">Clear</button>
            )}
          </div>
          {error && <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}

interface ImagePickerSingleProps {
  multiple?: false
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

interface ImagePickerMultiProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
  label?: string
}

export type ImagePickerProps = ImagePickerSingleProps | ImagePickerMultiProps

/** Thumbnail preview + direct upload + URL fallback. Backs every `*_image`/
 *  `photo`/`logo` field (single mode) and gallery arrays (multiple mode). */
export function ImagePicker(props: ImagePickerProps) {
  if (!props.multiple) {
    const { value, onChange, label } = props
    return <SingleImageField value={value} onChange={onChange} label={label} />
  }

  const { value, onChange, label } = props

  function updateAt(i: number, url: string | null) {
    const next = value.slice()
    next[i] = url ?? ''
    onChange(next)
  }
  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  function moveAt(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = value.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] font-medium text-slate-500">{label}</label>}
      {value.map((url, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <SingleImageField value={url || null} onChange={(v) => updateAt(i, v)} />
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <button type="button" onClick={() => moveAt(i, -1)} disabled={i === 0} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30" title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => moveAt(i, 1)} disabled={i === value.length - 1} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30" title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => removeAt(i)} className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" title="Remove"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-field border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
        <Plus className="w-3.5 h-3.5" />Add image
      </button>
    </div>
  )
}
