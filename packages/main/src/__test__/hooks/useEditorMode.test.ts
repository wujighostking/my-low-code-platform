import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEditorMode } from '@/hooks/useEditorMode'

function setup() {
  const clearSelection = vi.fn()
  let isPreviewing = false
  const setIsPreviewing = vi.fn((updater: boolean | ((prev: boolean) => boolean)) => {
    isPreviewing = typeof updater === 'function' ? updater(isPreviewing) : updater
  })
  const hook = renderHook(() => useEditorMode({ clearSelection, setIsPreviewing }))
  return { hook, clearSelection, setIsPreviewing, getIsPreviewing: () => isPreviewing }
}

describe('useEditorMode', () => {
  it('initializes with isEditing true', () => {
    const { hook } = setup()

    expect(hook.result.current.isEditing).toBe(true)
  })

  describe('toggleEditing', () => {
    it('toggles isEditing from true to false', () => {
      const { hook } = setup()

      act(() => hook.result.current.toggleEditing())

      expect(hook.result.current.isEditing).toBe(false)
    })

    it('toggles isEditing from false to true', () => {
      const { hook } = setup()

      act(() => hook.result.current.toggleEditing())
      act(() => hook.result.current.toggleEditing())

      expect(hook.result.current.isEditing).toBe(true)
    })

    it('calls clearSelection when disabling editing', () => {
      const { hook, clearSelection } = setup()

      act(() => hook.result.current.toggleEditing())

      expect(clearSelection).toHaveBeenCalledOnce()
    })

    it('does not call clearSelection when enabling editing', () => {
      const { hook, clearSelection } = setup()

      act(() => hook.result.current.toggleEditing())
      clearSelection.mockClear()

      act(() => hook.result.current.toggleEditing())

      expect(clearSelection).not.toHaveBeenCalled()
    })
  })

  describe('openPreview', () => {
    it('sets isPreviewing to true and isEditing to false', () => {
      const { hook, setIsPreviewing } = setup()

      act(() => hook.result.current.openPreview())

      expect(hook.result.current.isEditing).toBe(false)
      expect(setIsPreviewing).toHaveBeenCalledWith(true)
    })

    it('calls clearSelection when opening preview', () => {
      const { hook, clearSelection } = setup()

      act(() => hook.result.current.openPreview())

      expect(clearSelection).toHaveBeenCalledOnce()
    })
  })

  describe('closePreview', () => {
    it('sets isPreviewing to false', () => {
      const { hook, setIsPreviewing } = setup()

      act(() => hook.result.current.openPreview())
      setIsPreviewing.mockClear()

      act(() => hook.result.current.closePreview())

      expect(setIsPreviewing).toHaveBeenCalledWith(false)
    })

    it('restores isEditing to the state before preview', () => {
      const { hook } = setup()

      // isEditing starts as true, open preview saves it
      act(() => hook.result.current.openPreview())
      act(() => hook.result.current.closePreview())

      expect(hook.result.current.isEditing).toBe(true)
    })

    it('restores isEditing=false if it was false before preview', () => {
      const { hook } = setup()

      // Disable editing first
      act(() => hook.result.current.toggleEditing())
      expect(hook.result.current.isEditing).toBe(false)

      // Open and close preview
      act(() => hook.result.current.openPreview())
      act(() => hook.result.current.closePreview())

      expect(hook.result.current.isEditing).toBe(false)
    })
  })
})
