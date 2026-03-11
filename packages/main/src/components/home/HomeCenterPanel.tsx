import type { MouseEvent as ReactMouseEvent } from 'react'
import { Layout } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { registerConfig } from '@/utils/editorConfig'

const { Header, Content } = Layout

interface DraggingState {
  startClientX: number
  startClientY: number
  startPositions: Array<{
    index: number
    top: number
    left: number
  }>
}

function HomeCenterPanel() {
  const [selectedBlockIndexes, setSelectedBlockIndexes] = useState<number[]>([])
  const [draggingBlockIndexes, setDraggingBlockIndexes] = useState<number[]>([])
  const draggingRef = useRef<DraggingState | null>(null)

  const {
    isDragOver,
    blocks,
    canvasRef,
    container: { width, height },
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
    updateBlockPositions,
  } = useCanvasDrop()

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const dragging = draggingRef.current
      if (!dragging)
        return

      const deltaX = event.clientX - dragging.startClientX
      const deltaY = event.clientY - dragging.startClientY
      updateBlockPositions(
        dragging.startPositions.map(({ index, top, left }) => ({
          index,
          top: top + deltaY,
          left: left + deltaX,
        })),
      )
    }

    function handleMouseUp() {
      if (!draggingRef.current)
        return

      draggingRef.current = null
      setDraggingBlockIndexes([])
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updateBlockPositions])

  function handleBlockMouseDown(event: ReactMouseEvent<HTMLDivElement>, index: number) {
    event.stopPropagation()
    if (event.button !== 0)
      return

    const isCurrentSelected = selectedBlockIndexes.includes(index)
    const nextSelectedBlockIndexes = event.shiftKey
      ? (isCurrentSelected ? selectedBlockIndexes : [...selectedBlockIndexes, index])
      : (isCurrentSelected ? selectedBlockIndexes : [index])

    const startPositions = nextSelectedBlockIndexes
      .map((selectedIndex) => {
        const selectedBlock = blocks[selectedIndex]
        if (!selectedBlock)
          return null

        return {
          index: selectedIndex,
          top: selectedBlock.top,
          left: selectedBlock.left,
        }
      })
      .filter((position): position is { index: number, top: number, left: number } => position !== null)

    event.preventDefault()
    setSelectedBlockIndexes(nextSelectedBlockIndexes)
    draggingRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPositions,
    }
    setDraggingBlockIndexes(nextSelectedBlockIndexes)
  }

  const renderBlock = (block: (typeof blocks)[number], index: number) => {
    const config = registerConfig.componentMap.get(block.key as Parameters<typeof registerConfig.componentMap.get>[0])
    if (!config)
      return null

    const isSelected = selectedBlockIndexes.includes(index)
    const isDragging = draggingBlockIndexes.includes(index)

    return (
      <div
        key={`${block.key}-${index}`}
        onMouseDown={event => handleBlockMouseDown(event, index)}
        onClick={event => event.stopPropagation()}
        className="rounded-md select-none"
        style={{
          position: 'absolute',
          top: block.top,
          left: block.left,
          zIndex: block.zIndex,
          cursor: isDragging ? 'grabbing' : isSelected ? 'grab' : 'pointer',
          boxShadow: isSelected ? '0 0 0 2px #1677ff' : 'none',
        }}
      >
        {config.render()}
      </div>
    )
  }

  return (
    <Layout>
      <Header className="bg-white border-b border-[#f0f0f0] px-4 flex items-center justify-between" />

      <Content className="p-4 overflow-auto">
        <div
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedBlockIndexes([])}
          className={`mx-auto rounded-xl border border-dashed bg-white transition-colors ${
            isDragOver ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-[#d9d9d9]'
          }`}
          style={{ width, height, position: 'relative' }}
        >
          {blocks.map(renderBlock)}
        </div>
      </Content>
    </Layout>
  )
}

export default HomeCenterPanel
