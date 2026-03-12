import type { Command } from '@/commands'
import type { Block } from '@/hooks/useCanvasDrop'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCommandHistory } from '@/hooks/useCommandHistory'

function createMockCommand(delta: number): Command {
  return {
    execute: (blocks: Block[]) => blocks.map(b => ({ ...b, top: b.top + delta })),
    undo: (blocks: Block[]) => blocks.map(b => ({ ...b, top: b.top - delta })),
  }
}

function setup() {
  let blocks: Block[] = [{ top: 0, left: 0, zIndex: 1, key: 'text' }]
  const setBlocks = (updater: Block[] | ((prev: Block[]) => Block[])) => {
    blocks = typeof updater === 'function' ? updater(blocks) : updater
  }
  const hook = renderHook(() => useCommandHistory({ setBlocks }))
  return { hook, getBlocks: () => blocks }
}

describe('useCommandHistory', () => {
  it('initializes with canUndo and canRedo as false', () => {
    const { hook } = setup()

    expect(hook.result.current.canUndo).toBe(false)
    expect(hook.result.current.canRedo).toBe(false)
  })

  describe('executeCommand', () => {
    it('executes command and updates canUndo', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))

      expect(getBlocks()[0].top).toBe(10)
      expect(hook.result.current.canUndo).toBe(true)
      expect(hook.result.current.canRedo).toBe(false)
    })

    it('clears redo stack on new command', () => {
      const { hook } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))
      act(() => hook.result.current.undo())
      expect(hook.result.current.canRedo).toBe(true)

      act(() => hook.result.current.executeCommand(createMockCommand(20)))
      expect(hook.result.current.canRedo).toBe(false)
    })
  })

  describe('undo', () => {
    it('reverses the last command', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))
      act(() => hook.result.current.undo())

      expect(getBlocks()[0].top).toBe(0)
      expect(hook.result.current.canUndo).toBe(false)
      expect(hook.result.current.canRedo).toBe(true)
    })

    it('does nothing when stack is empty', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.undo())

      expect(getBlocks()[0].top).toBe(0)
      expect(hook.result.current.canUndo).toBe(false)
    })

    it('supports multiple undo steps', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))
      act(() => hook.result.current.executeCommand(createMockCommand(20)))
      expect(getBlocks()[0].top).toBe(30)

      act(() => hook.result.current.undo())
      expect(getBlocks()[0].top).toBe(10)

      act(() => hook.result.current.undo())
      expect(getBlocks()[0].top).toBe(0)
    })
  })

  describe('redo', () => {
    it('re-applies the last undone command', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))
      act(() => hook.result.current.undo())
      act(() => hook.result.current.redo())

      expect(getBlocks()[0].top).toBe(10)
      expect(hook.result.current.canUndo).toBe(true)
      expect(hook.result.current.canRedo).toBe(false)
    })

    it('does nothing when redo stack is empty', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.redo())

      expect(getBlocks()[0].top).toBe(0)
      expect(hook.result.current.canRedo).toBe(false)
    })

    it('supports multiple redo steps', () => {
      const { hook, getBlocks } = setup()

      act(() => hook.result.current.executeCommand(createMockCommand(10)))
      act(() => hook.result.current.executeCommand(createMockCommand(20)))
      act(() => hook.result.current.undo())
      act(() => hook.result.current.undo())

      act(() => hook.result.current.redo())
      expect(getBlocks()[0].top).toBe(10)

      act(() => hook.result.current.redo())
      expect(getBlocks()[0].top).toBe(30)
    })
  })

  describe('history limit', () => {
    it('limits undo stack to 50 entries', () => {
      const { hook } = setup()

      for (let i = 0; i < 55; i++)
        act(() => hook.result.current.executeCommand(createMockCommand(1)))

      let undoCount = 0
      while (hook.result.current.canUndo) {
        act(() => hook.result.current.undo())
        undoCount++
      }

      expect(undoCount).toBe(50)
    })
  })
})
