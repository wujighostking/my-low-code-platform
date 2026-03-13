import type { ReactNode } from 'react'
import { EditOutlined, ExportOutlined, EyeOutlined, FormOutlined, ImportOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip } from 'antd'

interface ToolbarAction {
  key: string
  label: string
  icon: ReactNode
  shortcut?: string
  disabled?: boolean
  onClick: () => void
}

interface EditorToolbarProps {
  toolbarActions: ToolbarAction[]
  isEditing: boolean
  isPreviewing: boolean
  onImport: () => void
  onExport: () => void
  onOpenPreview: () => void
  onClosePreview: () => void
  onToggleEditing: () => void
}

function EditorToolbar({ toolbarActions, isEditing, isPreviewing, onImport, onExport, onOpenPreview, onClosePreview, onToggleEditing }: EditorToolbarProps) {
  return (
    <Space>
      {!isPreviewing && (
        <>
          {toolbarActions.map(({ key, label, icon, shortcut, disabled, onClick }) => (
            <Tooltip key={key} title={shortcut ? `${label} (${shortcut})` : label}>
              <Button disabled={!isEditing || disabled} onClick={onClick}>
                {icon}
                {label}
              </Button>
            </Tooltip>
          ))}
          <Button disabled={!isEditing} onClick={onImport}>
            <ImportOutlined />
            导入
          </Button>
          <Button onClick={onExport}>
            <ExportOutlined />
            导出
          </Button>
        </>
      )}
      {isPreviewing
        ? (
            <Button onClick={onClosePreview}>
              <EditOutlined />
              返回编辑
            </Button>
          )
        : (
            <>
              <Button type="primary" onClick={onOpenPreview}>
                <EyeOutlined />
                预览
              </Button>
              <Tooltip title={isEditing ? '关闭编辑' : '启用编辑'}>
                <Button type={isEditing ? 'primary' : 'default'} onClick={onToggleEditing}>
                  {isEditing ? <FormOutlined /> : <EditOutlined />}
                  {isEditing ? '关闭编辑' : '启用编辑'}
                </Button>
              </Tooltip>
            </>
          )}
    </Space>
  )
}

export default EditorToolbar
