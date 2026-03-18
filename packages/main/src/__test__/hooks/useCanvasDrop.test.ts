import type { DragEvent } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'

const INITIAL_BLOCKS: Block[] = [
  { top: 100, left: 100, zIndex: 1, key: 'text' },
  { top: 200, left: 100, zIndex: 1, key: 'button' },
  { top: 300, left: 100, zIndex: 1, key: 'input' },
]

function renderCanvasDrop() {
  const hook = renderHook(() => useCanvasDrop())
  act(() => hook.result.current.setBlocks(INITIAL_BLOCKS))
  return hook
}

function createDragEvent(overrides: Partial<DragEvent<HTMLDivElement>> = {}) {
  return {
    preventDefault: () => {},
    dataTransfer: {
      dropEffect: '',
      getData: () => '',
      ...overrides.dataTransfer,
    },
    clientX: 0,
    clientY: 0,
    ...overrides,
  } as unknown as DragEvent<HTMLDivElement>
}

describe('useCanvasDrop', () => {
  it('initializes with empty blocks and default container dimensions', () => {
    const { result } = renderHook(() => useCanvasDrop())

    expect(result.current.blocks.length).toBe(0)
    expect(result.current.container.width).toBe(800)
    expect(result.current.container.height).toBe(800)
    expect(result.current.isDragOver).toBe(false)
    expect(result.current.canvasRef.current).toBeNull()
  })

  describe('handleCanvasDragOver', () => {
    it('sets isDragOver to true and dropEffect to copy', () => {
      const { result } = renderHook(() => useCanvasDrop())
      const event = createDragEvent()

      act(() => result.current.handleCanvasDragOver(event))

      expect(result.current.isDragOver).toBe(true)
      expect(event.dataTransfer.dropEffect).toBe('copy')
    })
  })

  describe('handleCanvasDragLeave', () => {
    it('resets isDragOver to false', () => {
      const { result } = renderHook(() => useCanvasDrop())

      act(() => result.current.handleCanvasDragOver(createDragEvent()))
      expect(result.current.isDragOver).toBe(true)

      act(() => result.current.handleCanvasDragLeave())
      expect(result.current.isDragOver).toBe(false)
    })
  })

  describe('handleCanvasDrop', () => {
    it('ignores drop with empty key', () => {
      const { result } = renderHook(() => useCanvasDrop())
      const initialLength = result.current.blocks.length

      act(() => {
        result.current.handleCanvasDrop(createDragEvent({
          dataTransfer: { getData: () => '' } as never,
        }))
      })

      expect(result.current.blocks.length).toBe(initialLength)
    })

    it('ignores drop with unregistered component key', () => {
      const { result } = renderHook(() => useCanvasDrop())
      const initialLength = result.current.blocks.length

      act(() => {
        result.current.handleCanvasDrop(createDragEvent({
          dataTransfer: { getData: () => 'unknown-component' } as never,
        }))
      })

      expect(result.current.blocks.length).toBe(initialLength)
    })
  })

  describe('updateBlockPositions', () => {
    it('updates positions of specified blocks', () => {
      const { result } = renderCanvasDrop()

      act(() => {
        result.current.updateBlockPositions([
          { index: 0, top: 50, left: 60 },
        ])
      })

      expect(result.current.blocks[0].top).toBe(50)
      expect(result.current.blocks[0].left).toBe(60)
    })

    it('does not update state when positions are unchanged', () => {
      const { result } = renderCanvasDrop()
      const originalTop = result.current.blocks[0].top
      const originalLeft = result.current.blocks[0].left
      const blocksBefore = result.current.blocks

      act(() => {
        result.current.updateBlockPositions([
          { index: 0, top: originalTop, left: originalLeft },
        ])
      })

      expect(result.current.blocks).toBe(blocksBefore)
    })

    it('skips empty updates array', () => {
      const { result } = renderHook(() => useCanvasDrop())
      const blocksBefore = result.current.blocks

      act(() => result.current.updateBlockPositions([]))

      expect(result.current.blocks).toBe(blocksBefore)
    })

    it('skips invalid index', () => {
      const { result } = renderHook(() => useCanvasDrop())
      const blocksBefore = result.current.blocks

      act(() => {
        result.current.updateBlockPositions([
          { index: 999, top: 0, left: 0 },
        ])
      })

      expect(result.current.blocks).toBe(blocksBefore)
    })
  })

  describe('updateBlockPosition', () => {
    it('updates a single block position via convenience method', () => {
      const { result } = renderCanvasDrop()

      act(() => result.current.updateBlockPosition(1, 111, 222))

      expect(result.current.blocks[1].top).toBe(111)
      expect(result.current.blocks[1].left).toBe(222)
    })
  })

  describe('undo / redo', () => {
    it('initializes with canUndo and canRedo as false', () => {
      const { result } = renderHook(() => useCanvasDrop())

      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(false)
    })
  })

  describe('commitMoveCommand', () => {
    it('records move and allows undo', () => {
      const { result } = renderCanvasDrop()
      const originalTop = result.current.blocks[0].top
      const originalLeft = result.current.blocks[0].left

      act(() => {
        result.current.updateBlockPositions([{ index: 0, top: 500, left: 600 }])
      })

      act(() => {
        result.current.commitMoveCommand([{
          index: 0,
          fromTop: originalTop,
          fromLeft: originalLeft,
          toTop: 500,
          toLeft: 600,
        }])
      })

      expect(result.current.canUndo).toBe(true)

      act(() => result.current.undo())

      expect(result.current.blocks[0].top).toBe(originalTop)
      expect(result.current.blocks[0].left).toBe(originalLeft)
    })

    it('ignores commit when positions are unchanged', () => {
      const { result } = renderCanvasDrop()
      const top = result.current.blocks[0].top
      const left = result.current.blocks[0].left

      act(() => {
        result.current.commitMoveCommand([{
          index: 0,
          fromTop: top,
          fromLeft: left,
          toTop: top,
          toLeft: left,
        }])
      })

      expect(result.current.canUndo).toBe(false)
    })
  })
})
