import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

interface UseEditorModeOptions {
  clearSelection: () => void
  setIsPreviewing: Dispatch<SetStateAction<boolean>>
}

export function useEditorMode({ clearSelection, setIsPreviewing }: UseEditorModeOptions) {
  const [isEditing, setIsEditing] = useState(true)
  const [editingBeforePreview, setEditingBeforePreview] = useState(true)

  const openPreview = () => {
    setEditingBeforePreview(isEditing)
    clearSelection()
    setIsEditing(false)
    setIsPreviewing(true)
  }

  const closePreview = () => {
    setIsPreviewing(false)
    setIsEditing(editingBeforePreview)
  }

  const toggleEditing = () => {
    setIsEditing((prev) => {
      if (prev)
        clearSelection()
      return !prev
    })
  }

  return { isEditing, openPreview, closePreview, toggleEditing }
}
