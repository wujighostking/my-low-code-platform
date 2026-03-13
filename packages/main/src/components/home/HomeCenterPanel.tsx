import type { MenuProps } from 'antd'
import { DeleteOutlined, EditOutlined, ExportOutlined, EyeOutlined, FormOutlined, ImportOutlined, RedoOutlined, UndoOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout, Space, Tooltip } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChangeZIndexCommand, DeleteBlocksCommand } from '@/commands'
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

  const { importModalOpen, openImportModal, closeImportModal, applyImport, exportModalOpen, openExportModal, closeExportModal, getExportJson, downloadAsFile, copyToClipboard } = useImportExport({ blocks, container: { width, height }, setBlocks })

  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)

  const openPreview = useCallback(() => {
    sessionStorage.setItem('preview-data', JSON.stringify({ container: { width, height }, blocks }))
    navigate('/preview')
  }, [blocks, width, height, navigate])

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

  const handleContextMenu = useCallback((event: React.MouseEvent, blockIndex?: number) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isEditing)
      return
    if (blockIndex !== undefined && !selectedBlockIndexes.includes(blockIndex))
      applySelection([blockIndex])
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect)
      return
    setContextMenu({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }, [isEditing, canvasRef, selectedBlockIndexes, applySelection])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const hasSelection = selectedBlockIndexes.length > 0

  const toolbarActions = useMemo(() => [
    { key: 'undo', label: '撤销', icon: <UndoOutlined />, shortcut: 'Ctrl+Z', disabled: !canUndo, onClick: undo },
    { key: 'redo', label: '重做', icon: <RedoOutlined />, shortcut: 'Ctrl+Y', disabled: !canRedo, onClick: redo },
    { key: 'bringToFront', label: '置顶', icon: <VerticalAlignTopOutlined />, disabled: !hasSelection, onClick: bringToFront },
    { key: 'sendToBack', label: '置底', icon: <VerticalAlignBottomOutlined />, disabled: !hasSelection, onClick: sendToBack },
    { key: 'delete', label: '删除', icon: <DeleteOutlined />, shortcut: 'Delete', disabled: !hasSelection, danger: true, onClick: deleteSelected },
  ], [canUndo, canRedo, hasSelection, undo, redo, bringToFront, sendToBack, deleteSelected])

  const contextMenuItems: MenuProps['items'] = useMemo(() => {
    const actionItems = toolbarActions.map(({ key, label, icon, shortcut, disabled, danger, onClick }) => ({
      key,
      label,
      icon,
      extra: shortcut,
      disabled,
      danger,
      onClick: () => {
        onClick()
        closeContextMenu()
      },
    }))
    return [
      actionItems[0],
      actionItems[1],
      { type: 'divider' as const },
      actionItems[2],
      actionItems[3],
      { type: 'divider' as const },
      actionItems[4],
    ]
  }, [toolbarActions, closeContextMenu])

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => {
      if (prev)
        clearSelection()
      return !prev
    })
  }, [clearSelection])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isEditing)
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
        onMouseDown={isEditing ? event => handleBlockMouseDown(event, index) : undefined}
        onContextMenu={isEditing ? event => handleContextMenu(event, index) : undefined}
        onClick={isEditing ? event => event.stopPropagation() : undefined}
        className="rounded-md select-none"
        style={{
          position: 'absolute',
          top: block.top,
          left: block.left,
          zIndex: block.zIndex,
          transform: 'translate(-50%, -50%)',
          cursor: isEditing ? (isDragging ? 'grabbing' : isSelected ? 'grab' : 'pointer') : 'default',
          boxShadow: isEditing && isSelected ? '0 0 0 2px #1677ff' : 'none',
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
            {toolbarActions.map(({ key, label, icon, shortcut, disabled, onClick }) => (
              <Tooltip key={key} title={shortcut ? `${label} (${shortcut})` : label}>
                <Button disabled={!isEditing || disabled} onClick={onClick}>
                  {icon}
                  {label}
                </Button>
              </Tooltip>
            ))}
            <Button disabled={!isEditing} onClick={openImportModal}>
              <ImportOutlined />
              导入
            </Button>
            <Button onClick={openExportModal}>
              <ExportOutlined />
              导出
            </Button>
            <Button type="primary" onClick={openPreview}>
              <EyeOutlined />
              预览
            </Button>
            <Tooltip title={isEditing ? '关闭编辑' : '启用编辑'}>
              <Button type={isEditing ? 'primary' : 'default'} onClick={toggleEditing}>
                {isEditing ? <FormOutlined /> : <EditOutlined />}
                {isEditing ? '关闭编辑' : '启用编辑'}
              </Button>
            </Tooltip>
          </Space>
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
            className={`mx-auto rounded-xl border border-dashed bg-white transition-colors ${
              isDragOver ? 'border-[#1677ff] bg-[#f0f7ff]' : 'border-[#d9d9d9]'
            }`}
            style={{ width, height, position: 'relative' }}
          >
            {blocks.map(renderBlock)}
            {renderGuideLines()}
            {contextMenu && (
              <div
                className="absolute"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                  zIndex: 9999,
                }}
              >
                <Dropdown
                  menu={{ items: contextMenuItems }}
                  open
                  onOpenChange={(open) => {
                    if (!open)
                      closeContextMenu()
                  }}
                  trigger={['contextMenu']}
                >
                  <div />
                </Dropdown>
              </div>
            )}
          </div>
        </Content>
      </Layout>
      <ImportModal open={importModalOpen} onClose={closeImportModal} onApply={applyImport} />
      <ExportModal open={exportModalOpen} onClose={closeExportModal} getJson={getExportJson} onDownload={downloadAsFile} onCopy={copyToClipboard} />
    </>
  )
}

export default HomeCenterPanel
