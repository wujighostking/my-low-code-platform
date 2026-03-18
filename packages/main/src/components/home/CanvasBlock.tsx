import type { MouseEvent } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { registerConfig } from '@/utils/editorConfig'

interface CanvasBlockProps {
  block: Block
  index: number
  isEditing: boolean
  isSelected: boolean
  isDragging: boolean
  setBlockElement: (index: number, element: HTMLDivElement | null) => void
  onMouseDown: (event: MouseEvent<HTMLDivElement>, index: number) => void
  onContextMenu: (event: MouseEvent<HTMLDivElement>, index: number) => void
}

function CanvasBlock({ block, index, isEditing, isSelected, isDragging, setBlockElement, onMouseDown, onContextMenu }: CanvasBlockProps) {
  const config = registerConfig.componentMap.get(block.key as Parameters<typeof registerConfig.componentMap.get>[0])
  if (!config)
    return null

  const editingOnly = <T,>(handler: T): T | undefined => isEditing ? handler : undefined

  return (
    <div
      key={`${block.key}-${index}`}
      ref={element => setBlockElement(index, element)}
      onMouseDown={editingOnly((event: MouseEvent<HTMLDivElement>) => onMouseDown(event, index))}
      onContextMenu={editingOnly((event: MouseEvent<HTMLDivElement>) => onContextMenu(event, index))}
      onClick={editingOnly((event: MouseEvent<HTMLDivElement>) => event.stopPropagation())}
      className={`absolute select-none rounded-md -translate-x-1/2 -translate-y-1/2 ${isEditing ? (isDragging ? 'cursor-grabbing' : isSelected ? 'cursor-grab' : 'cursor-pointer') : 'cursor-default'
      }  ${isEditing && isSelected ? 'shadow-[0_0_0_2px_#1677ff]' : ''}`}
      style={{ top: block.top, left: block.left, zIndex: block.zIndex }}
    >
      {config.render()}
    </div>
  )
}

export default CanvasBlock
