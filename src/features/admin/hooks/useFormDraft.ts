import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

function readDraft<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as T) }
  } catch {
    return fallback
  }
}

function writeDraft<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

export function clearFormDraft(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/**
 * Persists form fields in sessionStorage while the tab is open (survives in-app navigation).
 */
export function useFormDraft<T extends Record<string, unknown>>(
  storageKey: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [values, setValues] = useState<T>(() => readDraft(storageKey, initial))
  const initialRef = useRef(initial)

  useEffect(() => {
    writeDraft(storageKey, values)
  }, [storageKey, values])

  useEffect(() => {
    const onHide = () => writeDraft(storageKey, values)
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [storageKey, values])

  const reset = () => {
    clearFormDraft(storageKey)
    setValues(initialRef.current)
  }

  return [values, setValues, reset]
}
