import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCanvasSelection } from '@/hooks/useCanvasSelection'

describe('useCanvasSelection', () => {
  it('initializes with empty selection and dragging indexes', () => {
    const { result } = renderHook(() => useCanvasSelection())

    expect(result.current.selectedBlockIndexes).toEqual([])
    expect(result.current.draggingBlockIndexes).toEqual([])
  })

  describe('setBlockElement / getBlockElement', () => {
    it('registers and retrieves an element', () => {
      const { result } = renderHook(() => useCanvasSelection())
      const element = document.createElement('div')

      act(() => result.current.setBlockElement(0, element as HTMLDivElement))

      expect(result.current.getBlockElement(0)).toBe(element)
    })

    it('ignores null to prevent ref cleanup race condition', () => {
      const { result } = renderHook(() => useCanvasSelection())
      const element = document.createElement('div')

      act(() => result.current.setBlockElement(0, element as HTMLDivElement))
      act(() => result.current.setBlockElement(0, null))

      expect(result.current.getBlockElement(0)).toBe(element)
    })

    it('returns undefined for unregistered index', () => {
      const { result } = renderHook(() => useCanvasSelection())

      expect(result.current.getBlockElement(99)).toBeUndefined()
    })
  })

  describe('applySelection / clearSelection', () => {
    it('applies and clears selection', () => {
      const { result } = renderHook(() => useCanvasSelection())

      act(() => result.current.applySelection([1, 2, 3]))
      expect(result.current.selectedBlockIndexes).toEqual([1, 2, 3])

      act(() => result.current.clearSelection())
      expect(result.current.selectedBlockIndexes).toEqual([])
    })
  })

  describe('getNextSelectedBlockIndexes', () => {
    it('without shift: selects only the clicked block if not already selected', () => {
      const { result } = renderHook(() => useCanvasSelection())

      const next = result.current.getNextSelectedBlockIndexes(2, false)
      expect(next).toEqual([2])
    })

    it('without shift: keeps current selection if clicked block is already selected', () => {
      const { result } = renderHook(() => useCanvasSelection())

      act(() => result.current.applySelection([1, 2]))

      const next = result.current.getNextSelectedBlockIndexes(2, false)
      expect(next).toEqual([1, 2])
    })

    it('with shift: adds block to selection if not already selected', () => {
      const { result } = renderHook(() => useCanvasSelection())

      act(() => result.current.applySelection([0]))

      const next = result.current.getNextSelectedBlockIndexes(3, true)
      expect(next).toEqual([0, 3])
    })

    it('with shift: keeps selection unchanged if block already selected', () => {
      const { result } = renderHook(() => useCanvasSelection())

      act(() => result.current.applySelection([0, 3]))

      const next = result.current.getNextSelectedBlockIndexes(3, true)
      expect(next).toEqual([0, 3])
    })
  })

  describe('startDraggingSelection / stopDraggingSelection', () => {
    it('sets and clears dragging indexes', () => {
      const { result } = renderHook(() => useCanvasSelection())

      act(() => result.current.startDraggingSelection([1, 2]))
      expect(result.current.draggingBlockIndexes).toEqual([1, 2])

      act(() => result.current.stopDraggingSelection())
      expect(result.current.draggingBlockIndexes).toEqual([])
    })
  })
})
