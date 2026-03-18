import type { DragEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { getProjectById } from '@/api/projects'
import { AddBlockCommand, MoveBlocksCommand } from '@/commands'
import { useCommandHistory } from '@/hooks/useCommandHistory'
import { validateEditorData } from '@/hooks/useImportExport'
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

const DEFAULT_CONTAINER = { width: 800, height: 800 }

export function useCanvasDrop(projectId?: number, onLoadingChange?: (loading: boolean) => void) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [container, setContainer] = useState(DEFAULT_CONTAINER)
  const canvasRef = useRef<HTMLDivElement>(null)
  const onLoadingChangeRef = useRef(onLoadingChange)
  onLoadingChangeRef.current = onLoadingChange

  useEffect(() => {
    if (projectId == null)
      return
    onLoadingChangeRef.current?.(true)
    getProjectById(projectId)
      .then((project) => {
        if (!project.content)
          return
        try {
          const data = JSON.parse(project.content)
          if (!validateEditorData(data))
            return
          setContainer(data.container)
          setBlocks(data.blocks)
        }
        catch { /* ignore invalid JSON */ }
      })
      .finally(() => onLoadingChangeRef.current?.(false))
  }, [projectId])

  const { width, height } = container

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

  const updateBlockPositions = (updates: BlockPositionUpdate[]) => {
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
  }

  const updateBlockPosition = (index: number, top: number, left: number) => {
    updateBlockPositions([{ index, top, left }])
  }

  /** 拖拽结束时提交移动命令到历史栈 */
  const commitMoveCommand = (updates: { index: number, fromTop: number, fromLeft: number, toTop: number, toLeft: number }[]) => {
    const meaningful = updates.filter(u => u.fromTop !== u.toTop || u.fromLeft !== u.toLeft)
    if (meaningful.length === 0)
      return
    executeCommand(new MoveBlocksCommand(meaningful))
  }

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
