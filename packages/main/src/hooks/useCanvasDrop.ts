import type { DragEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import editorData from '@/../public/data/data.json'
import { registerConfig } from '@/utils/editorConfig'

export interface Block {
  top: number
  left: number
  zIndex: number
  key: string
}

export function useCanvasDrop() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>(editorData.blocks)
  const canvasRef = useRef<HTMLDivElement>(null)

  const { width, height } = editorData.container

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

  /** 放置：解析物料 key，计算相对画布的位置，添加到 blocks */
  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)

    const key = event.dataTransfer.getData('key')
    if (!key || !registerConfig.componentMap.has(key as Parameters<typeof registerConfig.componentMap.has>[0]))
      return

    const rect = canvasRef.current!.getBoundingClientRect()

    setBlocks(prev => [...prev, {
      top: event.clientY - rect.top,
      left: event.clientX - rect.left,
      zIndex: 1,
      key,
    }])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const children = canvas.children
    blocks.forEach((block, index) => {
      const el = children[index] as HTMLElement | undefined
      if (!el || el.dataset.aligned)
        return
      const { offsetWidth, offsetHeight } = el
      el.style.top = `${block.top - offsetHeight / 2}px`
      el.style.left = `${block.left - offsetWidth / 2}px`
      el.dataset.aligned = '1'
    })
  }, [blocks])

  return {
    isDragOver,
    blocks,
    canvasRef,
    container: { width, height },
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
  }
}
