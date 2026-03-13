import type { MenuProps } from 'antd'
import type { RefObject } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { CodeOutlined, ImportOutlined } from '@ant-design/icons'
import { useCallback, useMemo, useState } from 'react'

interface UseCanvasContextMenuOptions {
  isEditing: boolean
  canvasRef: RefObject<HTMLDivElement | null>
  blocks: Block[]
  selectedBlockIndexes: number[]
  applySelection: (indexes: number[]) => void
  toolbarActions: { key: string, label: string, icon: React.ReactNode, shortcut?: string, disabled?: boolean, danger?: boolean, onClick: () => void }[]
  hasSelection: boolean
  openReplaceImportModal: () => void
}

export function useCanvasContextMenu({ isEditing, canvasRef, blocks, selectedBlockIndexes, applySelection, toolbarActions, hasSelection, openReplaceImportModal }: UseCanvasContextMenuOptions) {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)
  const [viewDataBlock, setViewDataBlock] = useState<Block | null>(null)
  const [replaceTargetBlock, setReplaceTargetBlock] = useState<Block | null>(null)
  const [replaceTargetIndexes, setReplaceTargetIndexes] = useState<number[]>([])

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

  const closeContextMenu = () => setContextMenu(null)

  const viewSelectedData = useCallback(() => {
    if (selectedBlockIndexes.length === 0)
      return
    setViewDataBlock(blocks[selectedBlockIndexes[0]])
  }, [blocks, selectedBlockIndexes])

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
        setContextMenu(null)
      },
    }))
    return [
      actionItems[0],
      actionItems[1],
      { type: 'divider' as const },
      actionItems[2],
      actionItems[3],
      { type: 'divider' as const },
      {
        key: 'viewData',
        label: '查看数据',
        icon: <CodeOutlined />,
        disabled: !hasSelection,
        onClick: () => {
          viewSelectedData()
          setContextMenu(null)
        },
      },
      {
        key: 'replaceImport',
        label: '导入替换',
        icon: <ImportOutlined />,
        disabled: !hasSelection,
        onClick: () => {
          setReplaceTargetBlock(blocks[selectedBlockIndexes[0]])
          setReplaceTargetIndexes([...selectedBlockIndexes])
          openReplaceImportModal()
          setContextMenu(null)
        },
      },
      { type: 'divider' as const },
      actionItems[4],
    ]
  }, [toolbarActions, hasSelection, viewSelectedData, openReplaceImportModal, blocks, selectedBlockIndexes])

  return {
    contextMenu,
    contextMenuItems,
    handleContextMenu,
    closeContextMenu,
    viewDataBlock,
    setViewDataBlock,
    replaceTargetBlock,
    setReplaceTargetBlock,
    replaceTargetIndexes,
    setReplaceTargetIndexes,
  }
}
