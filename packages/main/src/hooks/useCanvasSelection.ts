import { useCallback, useRef, useState } from 'react'

export function useCanvasSelection() {
  const [selectedBlockIndexes, setSelectedBlockIndexes] = useState<number[]>([])
  const [draggingBlockIndexes, setDraggingBlockIndexes] = useState<number[]>([])
  const blockElementsRef = useRef<Map<number, HTMLDivElement>>(new Map())

  function setBlockElement(index: number, element: HTMLDivElement | null) {
    if (element) {
      blockElementsRef.current.set(index, element)
    }
  }

  function getBlockElement(index: number) {
    return blockElementsRef.current.get(index)
  }

  function clearSelection() {
    setSelectedBlockIndexes([])
  }

  const getNextSelectedBlockIndexes = useCallback((index: number, shiftKey: boolean) => {
    const isCurrentSelected = selectedBlockIndexes.includes(index)
    return shiftKey
      ? (isCurrentSelected ? selectedBlockIndexes : [...selectedBlockIndexes, index])
      : (isCurrentSelected ? selectedBlockIndexes : [index])
  }, [selectedBlockIndexes])

  function applySelection(indexes: number[]) {
    setSelectedBlockIndexes(indexes)
  }

  function startDraggingSelection(indexes: number[]) {
    setDraggingBlockIndexes(indexes)
  }

  function stopDraggingSelection() {
    setDraggingBlockIndexes([])
  }

  return {
    selectedBlockIndexes,
    draggingBlockIndexes,
    setBlockElement,
    getBlockElement,
    clearSelection,
    getNextSelectedBlockIndexes,
    applySelection,
    startDraggingSelection,
    stopDraggingSelection,
  }
}
