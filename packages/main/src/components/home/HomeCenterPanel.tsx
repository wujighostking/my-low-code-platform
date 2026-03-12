import { ExportOutlined, ImportOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Layout, Space, Tooltip } from 'antd'
import { useEffect } from 'react'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { useCanvasSelectionDrag } from '@/hooks/useCanvasSelectionDrag'
import { useImportExport } from '@/hooks/useImportExport'
import { registerConfig } from '@/utils/editorConfig'
import ExportModal from './ExportModal'
import ImportModal from './ImportModal'

const { Header, Content } = Layout

function HomeCenterPanel() {
  const {
    isDragOver,
    blocks,
    setBlocks,
    canvasRef,
    container: { width, height },
    handleCanvasDragOver,
    handleCanvasDragLeave,
    handleCanvasDrop,
    updateBlockPositions,
    commitMoveCommand,
    undo,
    redo,
    canUndo,
    canRedo,
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
    commitMoveCommand,
  })

  const { importModalOpen, openImportModal, closeImportModal, applyImport, exportModalOpen, openExportModal, closeExportModal, getExportJson, downloadAsFile, copyToClipboard } = useImportExport({ blocks, container: { width, height }, setBlocks })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if (event.ctrlKey && key === 'z') {
        event.preventDefault()
        undo()
      }
      if (event.ctrlKey && key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

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
    <>
      <Layout>
        <Header className="bg-white border-b border-[#f0f0f0] px-4 flex items-center justify-between">
          <Space>
            <Tooltip title="撤销 (Ctrl+Z)">
              <Button disabled={!canUndo} onClick={undo}>
                <UndoOutlined />
                撤销
              </Button>
            </Tooltip>
            <Tooltip title="重做 (Ctrl+Y)">
              <Button disabled={!canRedo} onClick={redo}>
                <RedoOutlined />
                重做
              </Button>
            </Tooltip>
            <Button onClick={openImportModal}>
              <ImportOutlined />
              导入
            </Button>
            <Button onClick={openExportModal}>
              <ExportOutlined />
              导出
            </Button>
          </Space>
        </Header>

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
      <ImportModal open={importModalOpen} onClose={closeImportModal} onApply={applyImport} />
      <ExportModal open={exportModalOpen} onClose={closeExportModal} getJson={getExportJson} onDownload={downloadAsFile} onCopy={copyToClipboard} />
    </>
  )
}

export default HomeCenterPanel
