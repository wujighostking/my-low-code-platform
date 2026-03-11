import type { MouseEvent as ReactMouseEvent, MutableRefObject } from 'react'
import { useCallback } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { useCanvasSelection } from '@/hooks/useCanvasSelection'
import { useCanvasSnapDrag } from '@/hooks/useCanvasSnapDrag'

interface BlockPositionUpdate {
  index: number
  top: number
  left: number
}

interface UseCanvasSelectionDragOptions {
  blocks: Block[]
  canvasRef: MutableRefObject<HTMLDivElement | null>
  updateBlockPositions: (updates: BlockPositionUpdate[]) => void
}

export function useCanvasSelectionDrag(options: UseCanvasSelectionDragOptions) {
  const { blocks, canvasRef, updateBlockPositions } = options
  const {
    selectedBlockIndexes,
    draggingBlockIndexes,
    setBlockElement,
    getBlockElement,
    clearSelection,
    getNextSelectedBlockIndexes,
    applySelection,
    startDraggingSelection,
    stopDraggingSelection,
  } = useCanvasSelection()

  const { guideLines, startDrag } = useCanvasSnapDrag({
    blocks,
    canvasRef,
    updateBlockPositions,
    getBlockElement,
    onDragEnd: stopDraggingSelection,
  })

  const handleBlockMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>, index: number) => {
    event.stopPropagation()
    if (event.button !== 0)
      return

    const nextSelectedBlockIndexes = getNextSelectedBlockIndexes(index, event.shiftKey)
    applySelection(nextSelectedBlockIndexes)
    const referenceIndex = nextSelectedBlockIndexes.at(-1) ?? index
    const isStarted = startDrag(event, nextSelectedBlockIndexes, referenceIndex)
    if (!isStarted)
      return
    startDraggingSelection(nextSelectedBlockIndexes)
  }, [applySelection, getNextSelectedBlockIndexes, startDrag, startDraggingSelection])

  return {
    selectedBlockIndexes,
    draggingBlockIndexes,
    guideLines,
    setBlockElement,
    clearSelection,
    handleBlockMouseDown,
  }
}
