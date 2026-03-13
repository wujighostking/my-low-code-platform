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

  return (
    <div
      key={`${block.key}-${index}`}
      ref={element => setBlockElement(index, element)}
      onMouseDown={isEditing ? event => onMouseDown(event, index) : undefined}
      onContextMenu={isEditing ? event => onContextMenu(event, index) : undefined}
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

export default CanvasBlock
