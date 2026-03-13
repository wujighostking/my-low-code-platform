import type { MouseEvent as ReactMouseEvent, RefObject } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { useCallback } from 'react'
import { useCanvasSelection } from '@/hooks/useCanvasSelection'
import { useCanvasSnapDrag } from '@/hooks/useCanvasSnapDrag'

interface BlockPositionUpdate {
  index: number
  top: number
  left: number
}

interface UseCanvasSelectionDragOptions {
  blocks: Block[]
  canvasRef: RefObject<HTMLDivElement | null>
  updateBlockPositions: (updates: BlockPositionUpdate[]) => void
  commitMoveCommand: (updates: { index: number, fromTop: number, fromLeft: number, toTop: number, toLeft: number }[]) => void
}

export function useCanvasSelectionDrag(options: UseCanvasSelectionDragOptions) {
  const { blocks, canvasRef, updateBlockPositions, commitMoveCommand } = options
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

  const handleDragEnd = useCallback((startPositions: { index: number, top: number, left: number }[]) => {
    stopDraggingSelection()
    commitMoveCommand(startPositions.map(({ index, top, left }) => ({
      index,
      fromTop: top,
      fromLeft: left,
      toTop: blocks[index]?.top ?? top,
      toLeft: blocks[index]?.left ?? left,
    })))
  }, [blocks, commitMoveCommand, stopDraggingSelection])

  const { guideLines, startDrag } = useCanvasSnapDrag({
    blocks,
    canvasRef,
    updateBlockPositions,
    getBlockElement,
    onDragEnd: handleDragEnd,
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
    applySelection,
    handleBlockMouseDown,
  }
}
