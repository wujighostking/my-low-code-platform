import { useCallback, useRef, useState } from 'react'

export function useCanvasSelection() {
  const [selectedBlockIndexes, setSelectedBlockIndexes] = useState<number[]>([])
  const [draggingBlockIndexes, setDraggingBlockIndexes] = useState<number[]>([])
  const blockElementsRef = useRef<Map<number, HTMLDivElement>>(new Map())

  const setBlockElement = useCallback((index: number, element: HTMLDivElement | null) => {
    if (!element) {
      blockElementsRef.current.delete(index)
      return
    }
    blockElementsRef.current.set(index, element)
  }, [])

  const getBlockElement = useCallback((index: number) => {
    return blockElementsRef.current.get(index)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedBlockIndexes([])
  }, [])

  const getNextSelectedBlockIndexes = useCallback((index: number, shiftKey: boolean) => {
    const isCurrentSelected = selectedBlockIndexes.includes(index)
    return shiftKey
      ? (isCurrentSelected ? selectedBlockIndexes : [...selectedBlockIndexes, index])
      : (isCurrentSelected ? selectedBlockIndexes : [index])
  }, [selectedBlockIndexes])

  const applySelection = useCallback((indexes: number[]) => {
    setSelectedBlockIndexes(indexes)
  }, [])

  const startDraggingSelection = useCallback((indexes: number[]) => {
    setDraggingBlockIndexes(indexes)
  }, [])

  const stopDraggingSelection = useCallback(() => {
    setDraggingBlockIndexes([])
  }, [])

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
