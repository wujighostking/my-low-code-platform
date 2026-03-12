import type { UploadProps } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { Input, Modal, Segmented, Upload } from 'antd'
import { useCallback, useState } from 'react'

const { TextArea } = Input
const { Dragger } = Upload

type ImportMode = '文件' | '文本'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onApply: (jsonStr: string) => boolean
}

function ImportModal({ open, onClose, onApply }: ImportModalProps) {
  const [mode, setMode] = useState<ImportMode>('文件')
  const [textValue, setTextValue] = useState('')
  const [fileContent, setFileContent] = useState('')

  const reset = useCallback(() => {
    setTextValue('')
    setFileContent('')
    setMode('文件')
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const handleOk = useCallback(() => {
    const content = mode === '文件' ? fileContent : textValue
    if (!content.trim())
      return
    const success = onApply(content)
    if (success)
      handleClose()
  }, [mode, fileContent, textValue, onApply, handleClose])

  const uploadProps: UploadProps = {
    accept: '.json',
    maxCount: 1,
    beforeUpload: (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFileContent(e.target?.result as string)
      }
      reader.readAsText(file)
      return false
    },
    onRemove: () => {
      setFileContent('')
    },
  }

  return (
    <Modal
      title="导入配置"
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      okText="导入"
      cancelText="取消"
      okButtonProps={{ disabled: mode === '文件' ? !fileContent : !textValue.trim() }}
      destroyOnClose
    >
      <Segmented
        block
        value={mode}
        onChange={value => setMode(value as ImportMode)}
        options={['文件', '文本']}
        className="mb-4"
      />

      {mode === '文件'
        ? (
            <Dragger {...uploadProps}>
              <p className="text-4xl text-[#1677ff]">
                <InboxOutlined />
              </p>
              <p>点击或拖拽 JSON 文件到此区域</p>
            </Dragger>
          )
        : (
            <TextArea
              rows={10}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              placeholder='粘贴 JSON 配置，例如：&#10;{&#10;  "container": { "width": 800, "height": 800 },&#10;  "blocks": [...]&#10;}'
            />
          )}
    </Modal>
  )
}

export default ImportModal
