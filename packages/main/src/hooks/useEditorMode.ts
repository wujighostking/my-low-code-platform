import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'

interface UseEditorModeOptions {
  clearSelection: () => void
  setIsPreviewing: Dispatch<SetStateAction<boolean>>
}

export function useEditorMode({ clearSelection, setIsPreviewing }: UseEditorModeOptions) {
  const [isEditing, setIsEditing] = useState(true)
  const [editingBeforePreview, setEditingBeforePreview] = useState(true)

  const openPreview = useCallback(() => {
    setEditingBeforePreview(isEditing)
    clearSelection()
    setIsEditing(false)
    setIsPreviewing(true)
  }, [isEditing, clearSelection, setIsPreviewing])

  const closePreview = useCallback(() => {
    setIsPreviewing(false)
    setIsEditing(editingBeforePreview)
  }, [editingBeforePreview, setIsPreviewing])

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => {
      if (prev)
        clearSelection()
      return !prev
    })
  }, [clearSelection])

  return { isEditing, openPreview, closePreview, toggleEditing }
}
