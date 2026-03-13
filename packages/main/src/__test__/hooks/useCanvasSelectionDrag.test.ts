import type { MouseEvent as ReactMouseEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCanvasSelectionDrag } from '@/hooks/useCanvasSelectionDrag'

function createOptions(overrides = {}) {
  return {
    blocks: [
      { top: 100, left: 100, zIndex: 1, key: 'text' },
      { top: 200, left: 200, zIndex: 1, key: 'button' },
    ],
    canvasRef: { current: null } as { current: HTMLDivElement | null },
    updateBlockPositions: vi.fn(),
    commitMoveCommand: vi.fn(),
    ...overrides,
  }
}

describe('useCanvasSelectionDrag', () => {
  it('initializes with empty selection and dragging state', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    expect(result.current.selectedBlockIndexes).toEqual([])
    expect(result.current.draggingBlockIndexes).toEqual([])
    expect(result.current.guideLines).toEqual({ vertical: null, horizontal: null })
  })

  it('exposes setBlockElement and clearSelection', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    expect(typeof result.current.setBlockElement).toBe('function')
    expect(typeof result.current.clearSelection).toBe('function')
    expect(typeof result.current.handleBlockMouseDown).toBe('function')
  })

  it('clearSelection resets selectedBlockIndexes', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    const event = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      button: 0,
      shiftKey: false,
      clientX: 150,
      clientY: 150,
    } as unknown as ReactMouseEvent<HTMLDivElement>

    act(() => result.current.handleBlockMouseDown(event, 0))
    expect(result.current.selectedBlockIndexes).toEqual([0])

    act(() => result.current.clearSelection())
    expect(result.current.selectedBlockIndexes).toEqual([])
  })

  it('ignores non-left mouse button clicks', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    const event = {
      stopPropagation: vi.fn(),
      button: 2,
      shiftKey: false,
    } as unknown as ReactMouseEvent<HTMLDivElement>

    act(() => result.current.handleBlockMouseDown(event, 0))

    expect(result.current.selectedBlockIndexes).toEqual([])
  })

  it('selects block on left click', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    const event = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      button: 0,
      shiftKey: false,
      clientX: 150,
      clientY: 150,
    } as unknown as ReactMouseEvent<HTMLDivElement>

    act(() => result.current.handleBlockMouseDown(event, 1))

    expect(result.current.selectedBlockIndexes).toEqual([1])
  })

  it('adds to selection with shift key', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))

    const createEvent = (shiftKey: boolean) => ({
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      button: 0,
      shiftKey,
      clientX: 150,
      clientY: 150,
    }) as unknown as ReactMouseEvent<HTMLDivElement>

    act(() => result.current.handleBlockMouseDown(createEvent(false), 0))
    expect(result.current.selectedBlockIndexes).toEqual([0])

    act(() => result.current.handleBlockMouseDown(createEvent(true), 1))
    expect(result.current.selectedBlockIndexes).toEqual([0, 1])
  })

  it('stopPropagation is called on mouse down', () => {
    const { result } = renderHook(() => useCanvasSelectionDrag(createOptions()))
    const stopPropagation = vi.fn()

    const event = {
      stopPropagation,
      preventDefault: vi.fn(),
      button: 0,
      shiftKey: false,
      clientX: 0,
      clientY: 0,
    } as unknown as ReactMouseEvent<HTMLDivElement>

    act(() => result.current.handleBlockMouseDown(event, 0))

    expect(stopPropagation).toHaveBeenCalled()
  })
})
