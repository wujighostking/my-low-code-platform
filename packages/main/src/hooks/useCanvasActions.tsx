import type { Command } from '@/commands'
import type { Block } from '@/hooks/useCanvasDrop'
import { DeleteOutlined, RedoOutlined, UndoOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo } from 'react'
import { ChangeZIndexCommand, DeleteBlocksCommand } from '@/commands'

interface UseCanvasActionsOptions {
  blocks: Block[]
  selectedBlockIndexes: number[]
  executeCommand: (command: Command) => void
  clearSelection: () => void
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  isEditing: boolean
}

export function useCanvasActions({ blocks, selectedBlockIndexes, executeCommand, clearSelection, canUndo, canRedo, undo, redo, isEditing }: UseCanvasActionsOptions) {
  const hasSelection = selectedBlockIndexes.length > 0

  const bringToFront = useCallback(() => {
    if (selectedBlockIndexes.length === 0)
      return
    const maxZIndex = Math.max(...blocks.map(b => b.zIndex))
    const updates = selectedBlockIndexes.map(index => ({
      index,
      fromZIndex: blocks[index].zIndex,
      toZIndex: maxZIndex + 1,
    }))
    executeCommand(new ChangeZIndexCommand(updates))
  }, [blocks, selectedBlockIndexes, executeCommand])

  const sendToBack = useCallback(() => {
    if (selectedBlockIndexes.length === 0)
      return
    const minZIndex = Math.min(...blocks.map(b => b.zIndex))
    const updates = selectedBlockIndexes.map(index => ({
      index,
      fromZIndex: blocks[index].zIndex,
      toZIndex: minZIndex - 1,
    }))
    executeCommand(new ChangeZIndexCommand(updates))
  }, [blocks, selectedBlockIndexes, executeCommand])

  const deleteSelected = useCallback(() => {
    if (selectedBlockIndexes.length === 0)
      return
    const entries = selectedBlockIndexes.map(index => ({
      index,
      block: blocks[index],
    }))
    executeCommand(new DeleteBlocksCommand(entries))
    clearSelection()
  }, [blocks, selectedBlockIndexes, executeCommand, clearSelection])

  const toolbarActions = useMemo(() => [
    { key: 'undo', label: '撤销', icon: <UndoOutlined />, shortcut: 'Ctrl+Z', disabled: !canUndo, onClick: undo },
    { key: 'redo', label: '重做', icon: <RedoOutlined />, shortcut: 'Ctrl+Y', disabled: !canRedo, onClick: redo },
    { key: 'bringToFront', label: '置顶', icon: <VerticalAlignTopOutlined />, disabled: !hasSelection, onClick: bringToFront },
    { key: 'sendToBack', label: '置底', icon: <VerticalAlignBottomOutlined />, disabled: !hasSelection, onClick: sendToBack },
    { key: 'delete', label: '删除', icon: <DeleteOutlined />, shortcut: 'Delete', disabled: !hasSelection, danger: true, onClick: deleteSelected },
  ], [canUndo, canRedo, hasSelection, undo, redo, bringToFront, sendToBack, deleteSelected])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isEditing)
        return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return
      const key = event.key.toLowerCase()
      if (event.ctrlKey && key === 'z') {
        event.preventDefault()
        undo()
      }
      if (event.ctrlKey && key === 'y') {
        event.preventDefault()
        redo()
      }
      if (key === 'delete' || key === 'backspace') {
        event.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, undo, redo, deleteSelected])

  return { hasSelection, toolbarActions }
}
