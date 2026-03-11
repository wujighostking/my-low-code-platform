import { Layout } from 'antd'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { useCanvasSelectionDrag } from '@/hooks/useCanvasSelectionDrag'
import { registerConfig } from '@/utils/editorConfig'

const { Header, Content } = Layout

function HomeCenterPanel() {
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

  const {
    selectedBlockIndexes,
    draggingBlockIndexes,
    guideLines,
    setBlockElement,
    clearSelection,
    handleBlockMouseDown,
  } = useCanvasSelectionDrag({
    blocks,
    canvasRef,
    updateBlockPositions,
  })

  const renderBlock = (block: (typeof blocks)[number], index: number) => {
    const config = registerConfig.componentMap.get(block.key as Parameters<typeof registerConfig.componentMap.get>[0])
    if (!config)
      return null

    const isSelected = selectedBlockIndexes.includes(index)
    const isDragging = draggingBlockIndexes.includes(index)

    return (
      <div
        key={`${block.key}-${index}`}
        ref={element => setBlockElement(index, element)}
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

  const renderVerticalGuideLine = () => {
    if (guideLines.vertical === null)
      return null

    return (
      <div
        className="pointer-events-none absolute bg-[#1677ff]"
        style={{
          top: 0,
          left: guideLines.vertical,
          width: 1,
          height: '100%',
        }}
      />
    )
  }

  const renderHorizontalGuideLine = () => {
    if (guideLines.horizontal === null)
      return null

    return (
      <div
        className="pointer-events-none absolute bg-[#1677ff]"
        style={{
          top: guideLines.horizontal,
          left: 0,
          width: '100%',
          height: 1,
        }}
      />
    )
  }

  const renderGuideLines = () => (
    <>
      {renderVerticalGuideLine()}
      {renderHorizontalGuideLine()}
    </>
  )

  return (
    <Layout>
      <Header className="bg-white border-b border-[#f0f0f0] px-4 flex items-center justify-between" />

      <Content className="p-4 overflow-auto">
        <div
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
          onClick={clearSelection}
          className={`mx-auto rounded-xl border border-dashed bg-white transition-colors ${
            isDragOver ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-[#d9d9d9]'
          }`}
          style={{ width, height, position: 'relative' }}
        >
          {blocks.map(renderBlock)}
          {renderGuideLines()}
        </div>
      </Content>
    </Layout>
  )
}

export default HomeCenterPanel
