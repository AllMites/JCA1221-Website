import { useState } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  width?: string
}

interface ContentTableProps<T> {
  items: T[]
  columns: Column<T>[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCreate?: () => void
  createLabel?: string
  emptyMessage?: string
}

export function ContentTable<T extends { id: string; published?: boolean }>({
  items,
  columns,
  loading,
  onEdit,
  onDelete,
  onCreate,
  createLabel = 'Add New',
  emptyMessage = 'No items yet.',
}: ContentTableProps<T>) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (loading) {
    return <div className="text-center py-12 text-sm text-slate-400">Loading...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        {onCreate && (
          <button
            onClick={onCreate}
            className="px-3 py-1.5 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all"
          >
            + {createLabel}
          </button>
        )}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">{emptyMessage}</p>
          {onCreate && (
            <button onClick={onCreate} className="mt-3 text-xs text-blue-500 hover:underline">
              {createLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-2.5 font-medium text-slate-500 dark:text-slate-400" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
                <th className="w-24 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-b border-slate-100 dark:border-white/5 last:border-0 ${item.published === false ? 'opacity-50' : ''}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5 justify-end">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="px-2 py-1 text-[10px] rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">Edit</button>
                      )}
                      {onDelete && (
                        confirmDelete === item.id ? (
                          <span className="flex gap-1">
                            <button onClick={() => { onDelete(item); setConfirmDelete(null) }} className="px-2 py-1 text-[10px] rounded-md text-red-600 bg-red-50 dark:bg-red-500/10">Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 text-[10px] rounded-md text-slate-500">Cancel</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDelete(item.id)} className="px-2 py-1 text-[10px] rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5">Del</button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
