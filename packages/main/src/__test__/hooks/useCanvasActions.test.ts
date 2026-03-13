import type { Command } from '@/commands'
import type { Block } from '@/hooks/useCanvasDrop'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChangeZIndexCommand, DeleteBlocksCommand } from '@/commands'
import { useCanvasActions } from '@/hooks/useCanvasActions'

const blocks: Block[] = [
  { top: 0, left: 0, zIndex: 1, key: 'text' },
  { top: 100, left: 100, zIndex: 2, key: 'button' },
  { top: 200, left: 200, zIndex: 3, key: 'input' },
]

function setup(overrides: Partial<Parameters<typeof useCanvasActions>[0]> = {}) {
  const options = {
    blocks,
    selectedBlockIndexes: [] as number[],
    executeCommand: vi.fn(),
    clearSelection: vi.fn(),
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
    isEditing: true,
    ...overrides,
  }
  const hook = renderHook(() => useCanvasActions(options))
  return { hook, ...options }
}

describe('useCanvasActions', () => {
  describe('hasSelection', () => {
    it('returns false when no blocks are selected', () => {
      const { hook } = setup({ selectedBlockIndexes: [] })

      expect(hook.result.current.hasSelection).toBe(false)
    })

    it('returns true when blocks are selected', () => {
      const { hook } = setup({ selectedBlockIndexes: [0] })

      expect(hook.result.current.hasSelection).toBe(true)
    })
  })

  describe('toolbarActions', () => {
    it('returns 5 toolbar actions', () => {
      const { hook } = setup()

      expect(hook.result.current.toolbarActions).toHaveLength(5)
    })

    it('has correct action keys', () => {
      const { hook } = setup()
      const keys = hook.result.current.toolbarActions.map(a => a.key)

      expect(keys).toEqual(['undo', 'redo', 'bringToFront', 'sendToBack', 'delete'])
    })

    it('disables undo/redo when canUndo/canRedo are false', () => {
      const { hook } = setup({ canUndo: false, canRedo: false })
      const actions = hook.result.current.toolbarActions

      expect(actions.find(a => a.key === 'undo')!.disabled).toBe(true)
      expect(actions.find(a => a.key === 'redo')!.disabled).toBe(true)
    })

    it('enables undo when canUndo is true', () => {
      const { hook } = setup({ canUndo: true })
      const actions = hook.result.current.toolbarActions

      expect(actions.find(a => a.key === 'undo')!.disabled).toBe(false)
    })

    it('disables selection-dependent actions when no selection', () => {
      const { hook } = setup({ selectedBlockIndexes: [] })
      const actions = hook.result.current.toolbarActions

      expect(actions.find(a => a.key === 'bringToFront')!.disabled).toBe(true)
      expect(actions.find(a => a.key === 'sendToBack')!.disabled).toBe(true)
      expect(actions.find(a => a.key === 'delete')!.disabled).toBe(true)
    })

    it('enables selection-dependent actions when selection exists', () => {
      const { hook } = setup({ selectedBlockIndexes: [0] })
      const actions = hook.result.current.toolbarActions

      expect(actions.find(a => a.key === 'bringToFront')!.disabled).toBe(false)
      expect(actions.find(a => a.key === 'sendToBack')!.disabled).toBe(false)
      expect(actions.find(a => a.key === 'delete')!.disabled).toBe(false)
    })
  })

  describe('bringToFront', () => {
    it('executes ChangeZIndexCommand with max zIndex + 1', () => {
      const executeCommand = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [0], executeCommand })
      const bringToFront = hook.result.current.toolbarActions.find(a => a.key === 'bringToFront')!

      act(() => bringToFront.onClick())

      expect(executeCommand).toHaveBeenCalledOnce()
      const command = executeCommand.mock.calls[0][0] as ChangeZIndexCommand
      expect(command).toBeInstanceOf(ChangeZIndexCommand)
    })

    it('does nothing when no selection', () => {
      const executeCommand = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [], executeCommand })
      const bringToFront = hook.result.current.toolbarActions.find(a => a.key === 'bringToFront')!

      act(() => bringToFront.onClick())

      expect(executeCommand).not.toHaveBeenCalled()
    })
  })

  describe('sendToBack', () => {
    it('executes ChangeZIndexCommand with min zIndex - 1', () => {
      const executeCommand = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [2], executeCommand })
      const sendToBack = hook.result.current.toolbarActions.find(a => a.key === 'sendToBack')!

      act(() => sendToBack.onClick())

      expect(executeCommand).toHaveBeenCalledOnce()
      const command = executeCommand.mock.calls[0][0] as ChangeZIndexCommand
      expect(command).toBeInstanceOf(ChangeZIndexCommand)
    })
  })

  describe('deleteSelected', () => {
    it('executes DeleteBlocksCommand and clears selection', () => {
      const executeCommand = vi.fn()
      const clearSelection = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [1], executeCommand, clearSelection })
      const deleteAction = hook.result.current.toolbarActions.find(a => a.key === 'delete')!

      act(() => deleteAction.onClick())

      expect(executeCommand).toHaveBeenCalledOnce()
      const command = executeCommand.mock.calls[0][0] as DeleteBlocksCommand
      expect(command).toBeInstanceOf(DeleteBlocksCommand)
      expect(clearSelection).toHaveBeenCalledOnce()
    })

    it('does nothing when no selection', () => {
      const executeCommand = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [], executeCommand })
      const deleteAction = hook.result.current.toolbarActions.find(a => a.key === 'delete')!

      act(() => deleteAction.onClick())

      expect(executeCommand).not.toHaveBeenCalled()
    })
  })

  describe('keyboard shortcuts', () => {
    function fireKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options })
      window.dispatchEvent(event)
    }

    it('calls undo on Ctrl+Z', () => {
      const undo = vi.fn()
      setup({ isEditing: true, undo })

      act(() => fireKeyDown('z', { ctrlKey: true }))

      expect(undo).toHaveBeenCalledOnce()
    })

    it('calls redo on Ctrl+Y', () => {
      const redo = vi.fn()
      setup({ isEditing: true, redo })

      act(() => fireKeyDown('y', { ctrlKey: true }))

      expect(redo).toHaveBeenCalledOnce()
    })

    it('calls deleteSelected on Delete key', () => {
      const executeCommand = vi.fn()
      const clearSelection = vi.fn()
      setup({ isEditing: true, selectedBlockIndexes: [0], executeCommand, clearSelection })

      act(() => fireKeyDown('Delete'))

      expect(executeCommand).toHaveBeenCalledOnce()
    })

    it('calls deleteSelected on Backspace key', () => {
      const executeCommand = vi.fn()
      const clearSelection = vi.fn()
      setup({ isEditing: true, selectedBlockIndexes: [0], executeCommand, clearSelection })

      act(() => fireKeyDown('Backspace'))

      expect(executeCommand).toHaveBeenCalledOnce()
    })

    it('ignores keyboard shortcuts when not editing', () => {
      const undo = vi.fn()
      const redo = vi.fn()
      setup({ isEditing: false, undo, redo })

      act(() => fireKeyDown('z', { ctrlKey: true }))
      act(() => fireKeyDown('y', { ctrlKey: true }))

      expect(undo).not.toHaveBeenCalled()
      expect(redo).not.toHaveBeenCalled()
    })
  })
})
