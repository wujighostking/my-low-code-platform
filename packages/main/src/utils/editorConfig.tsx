import type { ReactNode } from 'react'
import { Button, Input } from 'antd'
import { componentKeys } from './constants'

type ComponentKey = (typeof componentKeys)[keyof typeof componentKeys]

interface ComponentConfig {
  key: ComponentKey
  label: string
  preview: () => ReactNode
  render: () => ReactNode
}

function createEditorConfig() {
  const componentList = new Set<ComponentConfig>()
  const componentMap = new Map<ComponentConfig['key'], ComponentConfig>()

  function register(config: ComponentConfig) {
    if (componentList.has(config))
      return

    componentList.add(config)
    componentMap.set(config.key, config)
  }

  return { componentList, componentMap, register }
}

export const registerConfig = createEditorConfig()

const materials: ComponentConfig[] = [
  { key: componentKeys.text, label: '文本', preview: () => '预览文本', render: () => '渲染文本' },
  { key: componentKeys.button, label: '按钮', preview: () => <Button>预览按钮</Button>, render: () => <Button>渲染按钮</Button> },
  { key: componentKeys.input, label: '输入框', preview: () => <Input placeholder="预览输入框" />, render: () => <Input placeholder="渲染输入框" /> },
]

materials.forEach(material => registerConfig.register(material))
