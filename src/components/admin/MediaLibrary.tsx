import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'media'

interface MediaFile {
  name: string
  url: string
  size: number
  created_at: string
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: listError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list()

    if (listError) {
      if (listError.message?.includes('not found') || listError.message?.includes('does not exist')) {
        setFiles([])
        setError('Storage bucket not configured. Create a "media" bucket in Supabase dashboard (Storage → New Bucket → Name: media, Public: yes).')
      } else {
        setError(listError.message)
      }
      setLoading(false)
      return
    }

    const mapped: MediaFile[] = (data || [])
      .filter((f) => f.id)
      .map((f) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(f.name)

        return {
          name: f.name,
          url: publicUrl,
          size: f.metadata?.size || 0,
          created_at: f.created_at || '',
        }
      })

    setFiles(mapped)
    setLoading(false)
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum 5MB.')
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPEG, WebP, GIF, or SVG.')
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(uniqueName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
    await fetchFiles()
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete ${name}?`)) return

    const { error: deleteError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([name])

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await fetchFiles()
  }

  async function copyUrl(url: string, name: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(name)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(name)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">Media Library</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchFiles}
            className="px-3 py-1.5 text-[11px] font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Refresh
          </button>
          <label className={`px-4 py-1.5 text-[11px] font-medium rounded-full cursor-pointer transition-all ${
            uploading
              ? 'bg-slate-100 dark:bg-white/5 text-slate-400'
              : 'text-white bg-blue-500/80 hover:bg-blue-500/90 border border-blue-400/30'
          }`}>
            {uploading ? 'Uploading…' : 'Upload'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className={`p-4 mb-4 rounded-lg border text-xs ${
          error.includes('not configured') || error.includes('Create')
            ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
            : 'bg-red-50 dark:bg-red-500/5 border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-200/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No media files yet</p>
          <p className="text-xs text-slate-300 mt-1">Click Upload to add images</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="group relative aspect-square rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 overflow-hidden"
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(file.url, file.name)}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-full bg-white/90 text-slate-700 hover:bg-white transition-all"
                >
                  {copied === file.name ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all"
                >
                  Delete
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[10px] text-white/80 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[9px] text-white/50">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
