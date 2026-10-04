import { useMemo, useState } from 'react'

export interface SearchableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  /** Plain text used for column search; defaults to header if omitted and render is string-only */
  searchText?: (row: T) => string
}

interface SearchableTableProps<T> {
  rows: T[]
  columns: SearchableColumn<T>[]
  rowKey: (row: T) => string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  tableClassName?: string
}

function cellSearchText<T>(row: T, col: SearchableColumn<T>): string {
  if (col.searchText) {
    return col.searchText(row)
  }
  const rendered = col.render(row)
  if (typeof rendered === 'string' || typeof rendered === 'number') {
    return String(rendered)
  }
  return ''
}

export function SearchableTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = 'Search all columns…',
  emptyMessage = 'No rows match your search.',
  className = '',
  tableClassName = 'admin-table',
}: SearchableTableProps<T>) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return rows
    }
    return rows.filter((row) =>
      columns.some((col) => cellSearchText(row, col).toLowerCase().includes(q)),
    )
  }, [rows, columns, query])

  return (
    <div className={`searchable-table ${className}`.trim()}>
      <label className="searchable-table__search">
        <span className="visually-hidden">Search table</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="searchable-table__input"
        />
      </label>
      <div className="admin-table-wrap">
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
