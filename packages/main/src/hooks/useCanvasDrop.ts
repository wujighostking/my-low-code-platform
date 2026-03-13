import type { DragEvent } from 'react'
import { useCallback, useRef, useState } from 'react'
import editorData from '@/../public/data/data.json'
import { AddBlockCommand, MoveBlocksCommand } from '@/commands'
import { useCommandHistory } from '@/hooks/useCommandHistory'
import { registerConfig } from '@/utils/editorConfig'

export interface Block {
  top: number
  left: number
  zIndex: number
  key: string
}

interface BlockPositionUpdate {
  index: number
  top: number
  left: number
}

export function useCanvasDrop() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>(editorData.blocks)
  const canvasRef = useRef<HTMLDivElement>(null)

  const { width, height } = editorData.container

  const { executeCommand, undo, redo, canUndo, canRedo } = useCommandHistory({ setBlocks })

  /** 拖拽悬停：阻止默认行为以允许放置，设置视觉反馈 */
  function handleCanvasDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  /** 拖拽离开：重置悬停状态 */
  function handleCanvasDragLeave() {
    setIsDragOver(false)
  }

  /** 放置：解析物料 key，计算相对画布的位置，通过命令添加到 blocks */
  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)

    const key = event.dataTransfer.getData('key')
    if (!key || !registerConfig.componentMap.has(key as Parameters<typeof registerConfig.componentMap.has>[0]))
      return

    const rect = canvasRef.current!.getBoundingClientRect()

    executeCommand(new AddBlockCommand({
      top: event.clientY - rect.top,
      left: event.clientX - rect.left,
      zIndex: 1,
      key,
    }))
  }

  const updateBlockPositions = useCallback((updates: BlockPositionUpdate[]) => {
    if (updates.length === 0)
      return

    setBlocks((prev) => {
      const next = [...prev]
      let changed = false

      updates.forEach(({ index, top, left }) => {
        const current = next[index]
        if (!current)
          return

        if (current.top === top && current.left === left)
          return

        next[index] = { ...current, top, left }
        changed = true
      })

      return changed ? next : prev
    })
  }, [])

  const updateBlockPosition = useCallback((index: number, top: number, left: number) => {
    updateBlockPositions([{ index, top, left }])
  }, [updateBlockPositions])

  /** 拖拽结束时提交移动命令到历史栈 */
  const commitMoveCommand = useCallback((updates: { index: number, fromTop: number, fromLeft: number, toTop: number, toLeft: number }[]) => {
    const meaningful = updates.filter(u => u.fromTop !== u.toTop || u.fromLeft !== u.toLeft)
    if (meaningful.length === 0)
      return
    executeCommand(new MoveBlocksCommand(meaningful))
  }, [executeCommand])

  return {
    isDragOver,
    blocks,
    setBlocks,
    canvasRef,
    container: { width, height },
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
    updateBlockPositions,
    updateBlockPosition,
    commitMoveCommand,
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
