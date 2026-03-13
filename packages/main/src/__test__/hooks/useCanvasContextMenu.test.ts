import type { RefObject } from 'react'
import type { Block } from '@/hooks/useCanvasDrop'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCanvasContextMenu } from '@/hooks/useCanvasContextMenu'

const blocks: Block[] = [
  { top: 0, left: 0, zIndex: 1, key: 'text' },
  { top: 100, left: 100, zIndex: 2, key: 'button' },
]

const mockToolbarActions = [
  { key: 'undo', label: '撤销', icon: null, shortcut: 'Ctrl+Z', disabled: false, onClick: vi.fn() },
  { key: 'redo', label: '重做', icon: null, shortcut: 'Ctrl+Y', disabled: false, onClick: vi.fn() },
  { key: 'bringToFront', label: '置顶', icon: null, disabled: false, onClick: vi.fn() },
  { key: 'sendToBack', label: '置底', icon: null, disabled: false, onClick: vi.fn() },
  { key: 'delete', label: '删除', icon: null, shortcut: 'Delete', disabled: false, danger: true, onClick: vi.fn() },
]

function createCanvasRef(rect?: Partial<DOMRect>): RefObject<HTMLDivElement | null> {
  const div = document.createElement('div')
  div.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  })
  return { current: div }
}

function setup(overrides: Partial<Parameters<typeof useCanvasContextMenu>[0]> = {}) {
  const options = {
    isEditing: true,
    canvasRef: createCanvasRef(),
    blocks,
    selectedBlockIndexes: [0] as number[],
    applySelection: vi.fn(),
    toolbarActions: mockToolbarActions,
    hasSelection: true,
    openReplaceImportModal: vi.fn(),
    ...overrides,
  }
  const hook = renderHook(() => useCanvasContextMenu(options))
  return { hook, ...options }
}

function createMouseEvent(clientX = 100, clientY = 200): React.MouseEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    clientX,
    clientY,
  } as unknown as React.MouseEvent
}

describe('useCanvasContextMenu', () => {
  describe('initial state', () => {
    it('starts with contextMenu as null', () => {
      const { hook } = setup()

      expect(hook.result.current.contextMenu).toBeNull()
    })

    it('starts with viewDataBlock as null', () => {
      const { hook } = setup()

      expect(hook.result.current.viewDataBlock).toBeNull()
    })

    it('starts with replaceTargetBlock as null', () => {
      const { hook } = setup()

      expect(hook.result.current.replaceTargetBlock).toBeNull()
    })

    it('starts with replaceTargetIndexes as empty', () => {
      const { hook } = setup()

      expect(hook.result.current.replaceTargetIndexes).toEqual([])
    })
  })

  describe('handleContextMenu', () => {
    it('sets contextMenu position relative to canvas', () => {
      const canvasRef = createCanvasRef({ left: 50, top: 30 })
      const { hook } = setup({ canvasRef })
      const event = createMouseEvent(150, 230)

      act(() => hook.result.current.handleContextMenu(event))

      expect(hook.result.current.contextMenu).toEqual({ x: 100, y: 200 })
    })

    it('calls preventDefault and stopPropagation', () => {
      const { hook } = setup()
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event))

      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('does nothing when not editing', () => {
      const { hook } = setup({ isEditing: false })
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event))

      expect(hook.result.current.contextMenu).toBeNull()
    })

    it('applies selection when blockIndex is provided and not already selected', () => {
      const applySelection = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [0], applySelection })
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event, 1))

      expect(applySelection).toHaveBeenCalledWith([1])
    })

    it('does not apply selection when blockIndex is already selected', () => {
      const applySelection = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [0], applySelection })
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event, 0))

      expect(applySelection).not.toHaveBeenCalled()
    })

    it('does nothing when canvasRef.current is null', () => {
      const canvasRef: RefObject<HTMLDivElement | null> = { current: null }
      const { hook } = setup({ canvasRef })
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event))

      expect(hook.result.current.contextMenu).toBeNull()
    })
  })

  describe('closeContextMenu', () => {
    it('sets contextMenu to null', () => {
      const { hook } = setup()
      const event = createMouseEvent()

      act(() => hook.result.current.handleContextMenu(event))
      expect(hook.result.current.contextMenu).not.toBeNull()

      act(() => hook.result.current.closeContextMenu())

      expect(hook.result.current.contextMenu).toBeNull()
    })
  })

  describe('contextMenuItems', () => {
    it('includes toolbar action items and extra menu items', () => {
      const { hook } = setup()
      const items = hook.result.current.contextMenuItems!

      const nonDividerItems = items.filter((item: any) => item.type !== 'divider')
      const keys = nonDividerItems.map((item: any) => item.key)

      expect(keys).toContain('undo')
      expect(keys).toContain('redo')
      expect(keys).toContain('viewData')
      expect(keys).toContain('replaceImport')
      expect(keys).toContain('delete')
    })

    it('includes dividers', () => {
      const { hook } = setup()
      const items = hook.result.current.contextMenuItems!

      const dividers = items.filter((item: any) => item.type === 'divider')
      expect(dividers.length).toBeGreaterThan(0)
    })

    it('disables viewData and replaceImport when no selection', () => {
      const { hook } = setup({ hasSelection: false })
      const items = hook.result.current.contextMenuItems!

      const viewData = items.find((item: any) => item.key === 'viewData') as any
      const replaceImport = items.find((item: any) => item.key === 'replaceImport') as any

      expect(viewData.disabled).toBe(true)
      expect(replaceImport.disabled).toBe(true)
    })

    it('clicking viewData sets viewDataBlock', () => {
      const { hook } = setup({ selectedBlockIndexes: [0] })
      const items = hook.result.current.contextMenuItems!
      const viewData = items.find((item: any) => item.key === 'viewData') as any

      act(() => viewData.onClick())

      expect(hook.result.current.viewDataBlock).toEqual(blocks[0])
    })

    it('clicking replaceImport sets replaceTarget and opens modal', () => {
      const openReplaceImportModal = vi.fn()
      const { hook } = setup({ selectedBlockIndexes: [1], openReplaceImportModal })
      const items = hook.result.current.contextMenuItems!
      const replaceImport = items.find((item: any) => item.key === 'replaceImport') as any

      act(() => replaceImport.onClick())

      expect(hook.result.current.replaceTargetBlock).toEqual(blocks[1])
      expect(hook.result.current.replaceTargetIndexes).toEqual([1])
      expect(openReplaceImportModal).toHaveBeenCalledOnce()
    })

    it('clicking toolbar action item calls onClick and closes context menu', () => {
      const { hook } = setup()
      // First open context menu
      act(() => hook.result.current.handleContextMenu(createMouseEvent()))
      expect(hook.result.current.contextMenu).not.toBeNull()

      const items = hook.result.current.contextMenuItems!
      const undoItem = items.find((item: any) => item.key === 'undo') as any

      act(() => undoItem.onClick())

      expect(mockToolbarActions[0].onClick).toHaveBeenCalled()
      expect(hook.result.current.contextMenu).toBeNull()
    })
  })

  describe('setViewDataBlock', () => {
    it('can set and clear viewDataBlock', () => {
      const { hook } = setup()

      act(() => hook.result.current.setViewDataBlock(blocks[0]))
      expect(hook.result.current.viewDataBlock).toEqual(blocks[0])

      act(() => hook.result.current.setViewDataBlock(null))
      expect(hook.result.current.viewDataBlock).toBeNull()
    })
  })
})
