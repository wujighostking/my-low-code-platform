import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { useCallback, useEffect, useRef, useState } from 'react'

const SNAP_THRESHOLD = 5

type AnchorType = 'start' | 'center' | 'end'

interface AxisAnchor {
  type: AnchorType
  value: number
}

interface DraggingItemPosition {
  index: number
  top: number
  left: number
  width: number
  height: number
}

interface SnapTarget {
  vertical: AxisAnchor[]
  horizontal: AxisAnchor[]
}

interface DraggingState {
  startClientX: number
  startClientY: number
  referenceIndex: number
  startPositions: DraggingItemPosition[]
  snapTargets: SnapTarget[]
}

interface BlockRect {
  top: number
  left: number
  width: number
  height: number
}

interface BlockPositionUpdate {
  index: number
  top: number
  left: number
}

interface UseCanvasSnapDragOptions {
  blocks: Block[]
  canvasRef: RefObject<HTMLDivElement | null>
  updateBlockPositions: (updates: BlockPositionUpdate[]) => void
  getBlockElement: (index: number) => HTMLDivElement | undefined
  onDragEnd: (startPositions: { index: number, top: number, left: number }[]) => void
}

export interface GuideLines {
  vertical: number | null
  horizontal: number | null
}

export function getAxisAnchors(start: number, size: number): AxisAnchor[] {
  return [
    { type: 'start', value: start },
    { type: 'center', value: start + size / 2 },
    { type: 'end', value: start + size },
  ]
}

export function getAlignmentPriority(source: AxisAnchor, target: AxisAnchor): number {
  if (source.type === 'center' && target.type === 'center')
    return 3
  if (source.type === target.type)
    return 2
  if (source.type === 'center' || target.type === 'center')
    return 1
  return 0
}

export function getAnchors(rect: BlockRect) {
  return {
    vertical: getAxisAnchors(rect.left, rect.width),
    horizontal: getAxisAnchors(rect.top, rect.height),
  }
}

export function toCanvasRect(element: HTMLElement, canvasRect: DOMRect): BlockRect {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top - canvasRect.top,
    left: rect.left - canvasRect.left,
    width: rect.width,
    height: rect.height,
  }
}

export function useCanvasSnapDrag(options: UseCanvasSnapDragOptions) {
  const { blocks, canvasRef, updateBlockPositions, getBlockElement, onDragEnd } = options
  const [guideLines, setGuideLines] = useState<GuideLines>({ vertical: null, horizontal: null })
  const draggingRef = useRef<DraggingState | null>(null)

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const dragging = draggingRef.current
      if (!dragging)
        return

      const rawDeltaX = event.clientX - dragging.startClientX
      const rawDeltaY = event.clientY - dragging.startClientY
      const nextPositions = dragging.startPositions.map(position => ({
        ...position,
        top: position.top + rawDeltaY,
        left: position.left + rawDeltaX,
      }))

      const reference = nextPositions.find(position => position.index === dragging.referenceIndex)
      if (!reference)
        return

      const referenceAnchors = getAnchors(reference)
      let minDeltaX = Number.POSITIVE_INFINITY
      let minDeltaY = Number.POSITIVE_INFINITY
      let snappedOffsetX = 0
      let snappedOffsetY = 0
      let snappedVertical: number | null = null
      let snappedHorizontal: number | null = null
      let bestHorizontalPriority = -1

      dragging.snapTargets.forEach((target) => {
        referenceAnchors.vertical.forEach((source) => {
          target.vertical.forEach((targetAnchor) => {
            const delta = targetAnchor.value - source.value
            const absDelta = Math.abs(delta)
            if (absDelta > SNAP_THRESHOLD || absDelta >= minDeltaX)
              return

            minDeltaX = absDelta
            snappedOffsetX = delta
            snappedVertical = targetAnchor.value
          })
        })

        referenceAnchors.horizontal.forEach((source) => {
          target.horizontal.forEach((targetAnchor) => {
            const delta = targetAnchor.value - source.value
            const absDelta = Math.abs(delta)
            const priority = getAlignmentPriority(source, targetAnchor)
            const isBetterDistance = absDelta < minDeltaY
            const isSameDistance = Math.abs(absDelta - minDeltaY) < 0.001
            const isBetterPriority = isSameDistance && priority > bestHorizontalPriority
            if (absDelta > SNAP_THRESHOLD || (!isBetterDistance && !isBetterPriority))
              return

            minDeltaY = absDelta
            bestHorizontalPriority = priority
            snappedOffsetY = delta
            snappedHorizontal = targetAnchor.value
          })
        })
      })

      const nextGuideLines = {
        vertical: snappedVertical,
        horizontal: snappedHorizontal,
      }
      setGuideLines((prev) => {
        if (prev.vertical === nextGuideLines.vertical && prev.horizontal === nextGuideLines.horizontal)
          return prev
        return nextGuideLines
      })

      updateBlockPositions(
        nextPositions.map(({ index, top, left, height, width }) => ({
          index,
          top: top + snappedOffsetY + height / 2,
          left: left + snappedOffsetX + width / 2,
        })),
      )
    }

    function handleMouseUp() {
      if (!draggingRef.current)
        return

      const startPositions = draggingRef.current.startPositions.map(({ index, top, left, height, width }) => ({ index, top: top + height / 2, left: left + width / 2 }))
      draggingRef.current = null
      setGuideLines({ vertical: null, horizontal: null })
      onDragEnd(startPositions)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onDragEnd, updateBlockPositions])

  const startDrag = useCallback((
    event: ReactMouseEvent<HTMLDivElement>,
    selectedBlockIndexes: number[],
    referenceIndex: number,
  ) => {
    const canvas = canvasRef.current
    if (!canvas)
      return false

    const canvasRect = canvas.getBoundingClientRect()
    const startPositions = selectedBlockIndexes
      .map((selectedIndex) => {
        const element = getBlockElement(selectedIndex)
        if (!element)
          return null

        const rect = toCanvasRect(element, canvasRect)
        return {
          index: selectedIndex,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }
      })
      .filter((position): position is DraggingItemPosition => position !== null)

    if (startPositions.length === 0)
      return false

    const snapTargets = blocks
      .map((_, blockIndex) => blockIndex)
      .filter(blockIndex => !selectedBlockIndexes.includes(blockIndex))
      .map((blockIndex) => {
        const element = getBlockElement(blockIndex)
        if (!element)
          return null
        return getAnchors(toCanvasRect(element, canvasRect))
      })
      .filter((target): target is SnapTarget => target !== null)

    event.preventDefault()
    draggingRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      referenceIndex,
      startPositions,
      snapTargets,
    }
    return true
  }, [blocks, canvasRef, getBlockElement])

  return {
    guideLines,
    startDrag,
  }
}
