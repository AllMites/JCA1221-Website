import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { inputBase, inputNormal } from './styles'

interface TagPillInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

/** Comma-string → chip input. Backs expertise, sdg_tags, news tags. */
export function TagPillInput({ value, onChange, placeholder = 'Type and press Enter' }: TagPillInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, i) => (
            <Badge key={`${tag}-${i}`} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5" aria-label={`Remove ${tag}`}>
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder}
        className={`${inputBase} ${inputNormal}`}
      />
    </div>
  )
}
