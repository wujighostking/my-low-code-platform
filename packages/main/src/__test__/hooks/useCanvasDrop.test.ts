import type { DragEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'

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
  it('initializes with blocks from editorData and container dimensions', () => {
    const { result } = renderHook(() => useCanvasDrop())

    expect(result.current.blocks.length).toBeGreaterThan(0)
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
      const { result } = renderHook(() => useCanvasDrop())

      act(() => {
        result.current.updateBlockPositions([
          { index: 0, top: 50, left: 60 },
        ])
      })

      expect(result.current.blocks[0].top).toBe(50)
      expect(result.current.blocks[0].left).toBe(60)
    })

    it('does not update state when positions are unchanged', () => {
      const { result } = renderHook(() => useCanvasDrop())
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
      const { result } = renderHook(() => useCanvasDrop())

      act(() => result.current.updateBlockPosition(1, 111, 222))

      expect(result.current.blocks[1].top).toBe(111)
      expect(result.current.blocks[1].left).toBe(222)
    })
  })
})
