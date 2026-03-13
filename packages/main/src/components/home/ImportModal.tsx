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
  title?: string
  placeholder?: string
  defaultTextValue?: string
}

function ImportModal({ open, onClose, onApply, title = '导入配置', placeholder, defaultTextValue }: ImportModalProps) {
  const [mode, setMode] = useState<ImportMode>('文件')
  const [textValue, setTextValue] = useState('')
  const [fileContent, setFileContent] = useState('')

  const handleAfterOpenChange = useCallback((visible: boolean) => {
    if (visible) {
      if (defaultTextValue) {
        setMode('文本')
        setTextValue(defaultTextValue)
      }
      else {
        setMode('文件')
        setTextValue('')
      }
      setFileContent('')
    }
  }, [defaultTextValue])

  function reset() {
    setTextValue('')
    setFileContent('')
    setMode('文件')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleOk() {
    const content = mode === '文件' ? fileContent : textValue
    if (!content.trim())
      return
    const success = onApply(content)
    if (success)
      handleClose()
  }

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
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      okText="导入"
      cancelText="取消"
      okButtonProps={{ disabled: mode === '文件' ? !fileContent : !textValue.trim() }}
      destroyOnHidden
      afterOpenChange={handleAfterOpenChange}
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
              placeholder={placeholder ?? '粘贴 JSON 配置，例如：\n{\n  "container": { "width": 800, "height": 800 },\n  "blocks": [...]\n}'}
            />
          )}
    </Modal>
  )
}

export default ImportModal
