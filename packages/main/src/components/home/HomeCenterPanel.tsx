import type { Dispatch, SetStateAction } from 'react'
import { Layout, Modal } from 'antd'
import { useCanvasActions } from '@/hooks/useCanvasActions'
import { useCanvasContextMenu } from '@/hooks/useCanvasContextMenu'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { useCanvasSelectionDrag } from '@/hooks/useCanvasSelectionDrag'
import { useEditorMode } from '@/hooks/useEditorMode'
import { useImportExport } from '@/hooks/useImportExport'
import CanvasBlock from './CanvasBlock'
import CanvasContextMenu from './CanvasContextMenu'
import CanvasGuideLines from './CanvasGuideLines'
import EditorToolbar from './EditorToolbar'
import ExportModal from './ExportModal'
import ImportModal from './ImportModal'

const { Header, Content } = Layout

interface HomeCenterPanelProps {
  isPreviewing: boolean
  setIsPreviewing: Dispatch<SetStateAction<boolean>>
}

function HomeCenterPanel({ isPreviewing, setIsPreviewing }: HomeCenterPanelProps) {
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
    executeCommand,
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
    applySelection,
    handleBlockMouseDown,
  } = useCanvasSelectionDrag({
    blocks,
    canvasRef,
    updateBlockPositions,
    commitMoveCommand,
  })

  const { importModalOpen, openImportModal, closeImportModal, applyImport, replaceImportModalOpen, openReplaceImportModal, closeReplaceImportModal, applyReplaceImport, exportModalOpen, openExportModal, closeExportModal, getExportJson, downloadAsFile, copyToClipboard } = useImportExport({ blocks, container: { width, height }, setBlocks })

  const { isEditing, openPreview, closePreview, toggleEditing } = useEditorMode({ clearSelection, setIsPreviewing })

  const { hasSelection, toolbarActions } = useCanvasActions({
    blocks,
    selectedBlockIndexes,
    executeCommand,
    clearSelection,
    canUndo,
    canRedo,
    undo,
    redo,
    isEditing,
  })

  const { contextMenu, contextMenuItems, handleContextMenu, closeContextMenu, viewDataBlock, setViewDataBlock, replaceTargetBlock, setReplaceTargetBlock, replaceTargetIndexes, setReplaceTargetIndexes } = useCanvasContextMenu({
    isEditing,
    canvasRef,
    blocks,
    selectedBlockIndexes,
    applySelection,
    toolbarActions,
    hasSelection,
    openReplaceImportModal,
  })

  return (
    <>
      <Layout>
        <Header className="bg-white border-b border-[#f0f0f0] px-4 flex items-center justify-between">
          <EditorToolbar
            toolbarActions={toolbarActions}
            isEditing={isEditing}
            isPreviewing={isPreviewing}
            onImport={openImportModal}
            onExport={openExportModal}
            onOpenPreview={openPreview}
            onClosePreview={closePreview}
            onToggleEditing={toggleEditing}
          />
        </Header>

        <Content className="p-4 overflow-auto">
          <div
            ref={canvasRef}
            onDragOver={isEditing ? handleCanvasDragOver : undefined}
            onDragLeave={isEditing ? handleCanvasDragLeave : undefined}
            onDrop={isEditing ? handleCanvasDrop : undefined}
            onContextMenu={isEditing ? handleContextMenu : undefined}
            onClick={isEditing
              ? () => {
                  clearSelection()
                  closeContextMenu()
                }
              : undefined}
            className={`mx-auto rounded-xl bg-white transition-colors ${
              isPreviewing ? 'shadow-lg' : `border border-dashed ${isDragOver ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-[#d9d9d9]'}`
            }`}
            style={{ width, height, position: 'relative' }}
          >
            {blocks.map((block, index) => (
              <CanvasBlock
                key={block.key}
                block={block}
                index={index}
                isEditing={isEditing}
                isSelected={selectedBlockIndexes.includes(index)}
                isDragging={draggingBlockIndexes.includes(index)}
                setBlockElement={setBlockElement}
                onMouseDown={handleBlockMouseDown}
                onContextMenu={handleContextMenu}
              />
            ))}
            <CanvasGuideLines vertical={guideLines.vertical} horizontal={guideLines.horizontal} />
            {contextMenu && (
              <CanvasContextMenu
                position={contextMenu}
                items={contextMenuItems}
                onClose={closeContextMenu}
              />
            )}
          </div>
        </Content>
      </Layout>
      <ImportModal open={importModalOpen} onClose={closeImportModal} onApply={applyImport} />
      <ImportModal
        open={replaceImportModalOpen}
        onClose={() => {
          closeReplaceImportModal()
          setReplaceTargetBlock(null)
          setReplaceTargetIndexes([])
        }}
        onApply={jsonStr => applyReplaceImport(jsonStr, replaceTargetIndexes)}
        title="导入替换组件"
        placeholder={'粘贴组件 JSON 数据，例如：\n{\n  "key": "button",\n  "top": 0,\n  "left": 0,\n  "zIndex": 1\n}'}
        defaultTextValue={replaceTargetBlock ? JSON.stringify(replaceTargetBlock, null, 2) : undefined}
      />
      <ExportModal open={exportModalOpen} onClose={closeExportModal} getJson={getExportJson} onDownload={downloadAsFile} onCopy={copyToClipboard} />
      <Modal
        title="组件数据"
        open={viewDataBlock !== null}
        onCancel={() => setViewDataBlock(null)}
        footer={null}
        width={600}
      >
        <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 13 }}>
          {JSON.stringify(viewDataBlock, null, 2)}
        </pre>
      </Modal>
    </>
  )
}

export default HomeCenterPanel
