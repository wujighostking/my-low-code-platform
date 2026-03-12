import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getAlignmentPriority, getAnchors, getAxisAnchors, useCanvasSnapDrag } from '@/hooks/useCanvasSnapDrag'

describe('getAxisAnchors', () => {
  it('returns start, center, and end anchors', () => {
    const anchors = getAxisAnchors(100, 50)

    expect(anchors).toEqual([
      { type: 'start', value: 100 },
      { type: 'center', value: 125 },
      { type: 'end', value: 150 },
    ])
  })

  it('handles zero size', () => {
    const anchors = getAxisAnchors(10, 0)

    expect(anchors).toEqual([
      { type: 'start', value: 10 },
      { type: 'center', value: 10 },
      { type: 'end', value: 10 },
    ])
  })
})

describe('getAlignmentPriority', () => {
  it('returns 3 for center-to-center alignment', () => {
    expect(getAlignmentPriority(
      { type: 'center', value: 0 },
      { type: 'center', value: 0 },
    )).toBe(3)
  })

  it('returns 2 for same-type alignment (start-start)', () => {
    expect(getAlignmentPriority(
      { type: 'start', value: 0 },
      { type: 'start', value: 0 },
    )).toBe(2)
  })

  it('returns 2 for same-type alignment (end-end)', () => {
    expect(getAlignmentPriority(
      { type: 'end', value: 0 },
      { type: 'end', value: 0 },
    )).toBe(2)
  })

  it('returns 1 when source is center', () => {
    expect(getAlignmentPriority(
      { type: 'center', value: 0 },
      { type: 'start', value: 0 },
    )).toBe(1)
  })

  it('returns 1 when target is center', () => {
    expect(getAlignmentPriority(
      { type: 'end', value: 0 },
      { type: 'center', value: 0 },
    )).toBe(1)
  })

  it('returns 0 for different non-center types', () => {
    expect(getAlignmentPriority(
      { type: 'start', value: 0 },
      { type: 'end', value: 0 },
    )).toBe(0)
  })
})

describe('getAnchors', () => {
  it('returns vertical and horizontal anchors from rect', () => {
    const anchors = getAnchors({ top: 10, left: 20, width: 100, height: 50 })

    expect(anchors.vertical).toEqual([
      { type: 'start', value: 20 },
      { type: 'center', value: 70 },
      { type: 'end', value: 120 },
    ])
    expect(anchors.horizontal).toEqual([
      { type: 'start', value: 10 },
      { type: 'center', value: 35 },
      { type: 'end', value: 60 },
    ])
  })
})

describe('useCanvasSnapDrag', () => {
  function createOptions(overrides = {}) {
    return {
      blocks: [],
      canvasRef: { current: null },
      updateBlockPositions: vi.fn(),
      getBlockElement: vi.fn(),
      onDragEnd: vi.fn(),
      ...overrides,
    }
  }

  it('initializes with null guide lines', () => {
    const { result } = renderHook(() => useCanvasSnapDrag(createOptions()))

    expect(result.current.guideLines).toEqual({
      vertical: null,
      horizontal: null,
    })
  })

  it('startDrag returns false when canvasRef is null', () => {
    const { result } = renderHook(() => useCanvasSnapDrag(createOptions()))
    const event = { clientX: 100, clientY: 200, preventDefault: vi.fn() } as never

    const started = result.current.startDrag(event, [0], 0)

    expect(started).toBe(false)
  })

  it('startDrag returns false when no elements found for selected indexes', () => {
    const canvas = document.createElement('div')
    const getBlockElement = vi.fn().mockReturnValue(undefined)

    const { result } = renderHook(() => useCanvasSnapDrag(createOptions({
      canvasRef: { current: canvas },
      getBlockElement,
    })))

    const event = { clientX: 100, clientY: 200, preventDefault: vi.fn() } as never
    const started = result.current.startDrag(event, [0], 0)

    expect(started).toBe(false)
  })
})
