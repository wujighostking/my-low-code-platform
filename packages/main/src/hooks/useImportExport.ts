import type { Dispatch, SetStateAction } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { message } from 'antd'
import { useState } from 'react'
import { registerConfig } from '@/utils/editorConfig'

interface EditorData {
  container: { width: number, height: number }
  blocks: Block[]
}

interface UseImportExportOptions {
  blocks: Block[]
  container: { width: number, height: number }
  setBlocks: Dispatch<SetStateAction<Block[]>>
}

export function validateBlockData(data: unknown): data is Block {
  if (typeof data !== 'object' || data === null)
    return false
  const b = data as Record<string, unknown>
  return typeof b.top === 'number'
    && typeof b.left === 'number'
    && typeof b.zIndex === 'number'
    && typeof b.key === 'string'
    && registerConfig.componentMap.has(b.key as Parameters<typeof registerConfig.componentMap.has>[0])
}

export function validateEditorData(data: unknown): data is EditorData {
  if (typeof data !== 'object' || data === null)
    return false

  const obj = data as Record<string, unknown>

  if (typeof obj.container !== 'object' || obj.container === null)
    return false

  const container = obj.container as Record<string, unknown>
  if (typeof container.width !== 'number' || typeof container.height !== 'number')
    return false

  if (!Array.isArray(obj.blocks))
    return false

  return obj.blocks.every((block: unknown) => {
    if (typeof block !== 'object' || block === null)
      return false
    const b = block as Record<string, unknown>
    return typeof b.top === 'number'
      && typeof b.left === 'number'
      && typeof b.zIndex === 'number'
      && typeof b.key === 'string'
      && registerConfig.componentMap.has(b.key as Parameters<typeof registerConfig.componentMap.has>[0])
  })
}

export function useImportExport({ blocks, container, setBlocks }: UseImportExportOptions) {
  const [importModalOpen, setImportModalOpen] = useState(false)

  function openImportModal() {
    setImportModalOpen(true)
  }

  function closeImportModal() {
    setImportModalOpen(false)
  }

  function applyImport(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr)
      if (!validateEditorData(data)) {
        message.error('JSON 格式不正确或包含未注册的组件')
        return false
      }
      setBlocks(data.blocks)
      message.success('导入成功')
      return true
    }
    catch {
      message.error('JSON 解析失败，请检查格式')
      return false
    }
  }

  const [replaceImportModalOpen, setReplaceImportModalOpen] = useState(false)

  function openReplaceImportModal() {
    setReplaceImportModalOpen(true)
  }

  function closeReplaceImportModal() {
    setReplaceImportModalOpen(false)
  }

  function applyReplaceImport(jsonStr: string, selectedIndexes: number[]) {
    try {
      const data = JSON.parse(jsonStr)
      if (!validateBlockData(data)) {
        message.error('JSON 格式不正确或包含未注册的组件')
        return false
      }
      setBlocks(prev => prev.map((block, index) => {
        if (selectedIndexes.includes(index)) {
          return { ...data, top: block.top, left: block.left, zIndex: block.zIndex }
        }
        return block
      }))
      message.success('导入替换成功')
      return true
    }
    catch {
      message.error('JSON 解析失败，请检查格式')
      return false
    }
  }

  const [exportModalOpen, setExportModalOpen] = useState(false)

  function openExportModal() {
    setExportModalOpen(true)
  }

  function closeExportModal() {
    setExportModalOpen(false)
  }

  const getExportJson = () => {
    const data: EditorData = { container, blocks }
    return JSON.stringify(data, null, 2)
  }

  const downloadAsFile = () => {
    const json = getExportJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'editor-data.json'
    a.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  const copyToClipboard = async () => {
    const json = getExportJson()
    await navigator.clipboard.writeText(json)
    message.success('已复制到剪贴板')
  }

  return {
    importModalOpen,
    openImportModal,
    closeImportModal,
    applyImport,
    replaceImportModalOpen,
    openReplaceImportModal,
    closeReplaceImportModal,
    applyReplaceImport,
    exportModalOpen,
    openExportModal,
    closeExportModal,
    getExportJson,
    downloadAsFile,
    copyToClipboard,
  }
}
