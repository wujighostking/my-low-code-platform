import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'

interface CanvasContextMenuProps {
  position: { x: number, y: number }
  items: MenuProps['items']
  onClose: () => void
}

function CanvasContextMenu({ position, items, onClose }: CanvasContextMenuProps) {
  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      <Dropdown
        menu={{ items }}
        open
        onOpenChange={(open) => {
          if (!open)
            onClose()
        }}
        trigger={['contextMenu']}
      >
        <div />
      </Dropdown>
    </div>
  )
}

export default CanvasContextMenu
