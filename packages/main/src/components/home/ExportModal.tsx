import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Segmented, Space } from 'antd'
import { useState } from 'react'

const { TextArea } = Input

type ExportMode = '文件' | '文本'

interface ExportModalProps {
  open: boolean
  onClose: () => void
  getJson: () => string
  onDownload: () => void
  onCopy: () => void
}

function ExportModal({ open, onClose, getJson, onDownload, onCopy }: ExportModalProps) {
  const [mode, setMode] = useState<ExportMode>('文件')

  return (
    <Modal
      title="导出配置"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Segmented
        block
        value={mode}
        onChange={value => setMode(value as ExportMode)}
        options={['文件', '文本']}
        className="mb-4"
      />

      {mode === '文件'
        ? (
            <div className="text-center py-8">
              <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={onDownload}>
                下载 JSON 文件
              </Button>
            </div>
          )
        : (
            <>
              <TextArea rows={10} readOnly value={open ? getJson() : ''} />
              <Space className="mt-3 w-full justify-end">
                <Button icon={<CopyOutlined />} onClick={onCopy}>
                  复制到剪贴板
                </Button>
              </Space>
            </>
          )}
    </Modal>
  )
}

export default ExportModal
