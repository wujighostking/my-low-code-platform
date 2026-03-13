import type { Block } from '@/hooks/useCanvasDrop'
import { describe, expect, it } from 'vitest'
import { AddBlockCommand, ChangeZIndexCommand, DeleteBlocksCommand, MoveBlocksCommand } from '@/commands'

const baseBlocks: Block[] = [
  { top: 100, left: 100, zIndex: 1, key: 'text' },
  { top: 200, left: 200, zIndex: 1, key: 'button' },
  { top: 300, left: 300, zIndex: 1, key: 'input' },
]

describe('addBlockCommand', () => {
  const newBlock: Block = { top: 400, left: 400, zIndex: 1, key: 'text' }

  it('execute appends the block to the end', () => {
    const command = new AddBlockCommand(newBlock)
    const result = command.execute(baseBlocks)

    expect(result).toHaveLength(4)
    expect(result[3]).toEqual(newBlock)
  })

  it('execute does not mutate the original array', () => {
    const command = new AddBlockCommand(newBlock)
    const result = command.execute(baseBlocks)

    expect(result).not.toBe(baseBlocks)
    expect(baseBlocks).toHaveLength(3)
  })

  it('undo removes the last block', () => {
    const command = new AddBlockCommand(newBlock)
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo).toHaveLength(3)
    expect(afterUndo).toEqual(baseBlocks)
  })

  it('undo does not mutate the input array', () => {
    const command = new AddBlockCommand(newBlock)
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo).not.toBe(afterExecute)
    expect(afterExecute).toHaveLength(4)
  })

  it('execute then undo restores original state', () => {
    const command = new AddBlockCommand(newBlock)
    const result = command.undo(command.execute(baseBlocks))

    expect(result).toEqual(baseBlocks)
  })
})

describe('moveBlocksCommand', () => {
  it('execute moves blocks to target positions', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 150, toLeft: 160 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].top).toBe(150)
    expect(result[0].left).toBe(160)
  })

  it('undo restores blocks to original positions', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 150, toLeft: 160 },
    ])
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo[0].top).toBe(100)
    expect(afterUndo[0].left).toBe(100)
  })

  it('handles multiple block updates', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 10, toLeft: 20 },
      { index: 2, fromTop: 300, fromLeft: 300, toTop: 30, toLeft: 40 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].top).toBe(10)
    expect(result[0].left).toBe(20)
    expect(result[1]).toEqual(baseBlocks[1])
    expect(result[2].top).toBe(30)
    expect(result[2].left).toBe(40)
  })

  it('does not mutate the original array', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 999, toLeft: 999 },
    ])
    command.execute(baseBlocks)

    expect(baseBlocks[0].top).toBe(100)
    expect(baseBlocks[0].left).toBe(100)
  })

  it('execute then undo restores original state', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 500, toLeft: 600 },
      { index: 1, fromTop: 200, fromLeft: 200, toTop: 700, toLeft: 800 },
    ])
    const result = command.undo(command.execute(baseBlocks))

    expect(result[0].top).toBe(100)
    expect(result[0].left).toBe(100)
    expect(result[1].top).toBe(200)
    expect(result[1].left).toBe(200)
  })

  it('preserves non-position properties', () => {
    const command = new MoveBlocksCommand([
      { index: 0, fromTop: 100, fromLeft: 100, toTop: 999, toLeft: 999 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].zIndex).toBe(1)
    expect(result[0].key).toBe('text')
  })
})

describe('deleteBlocksCommand', () => {
  it('execute removes a single block', () => {
    const command = new DeleteBlocksCommand([
      { index: 1, block: baseBlocks[1] },
    ])
    const result = command.execute(baseBlocks)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(baseBlocks[0])
    expect(result[1]).toEqual(baseBlocks[2])
  })

  it('execute removes multiple blocks', () => {
    const command = new DeleteBlocksCommand([
      { index: 0, block: baseBlocks[0] },
      { index: 2, block: baseBlocks[2] },
    ])
    const result = command.execute(baseBlocks)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(baseBlocks[1])
  })

  it('execute does not mutate the original array', () => {
    const command = new DeleteBlocksCommand([
      { index: 1, block: baseBlocks[1] },
    ])
    command.execute(baseBlocks)

    expect(baseBlocks).toHaveLength(3)
  })

  it('undo restores a single deleted block at the correct index', () => {
    const command = new DeleteBlocksCommand([
      { index: 1, block: baseBlocks[1] },
    ])
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo).toHaveLength(3)
    expect(afterUndo).toEqual(baseBlocks)
  })

  it('undo restores multiple deleted blocks at their correct indices', () => {
    const command = new DeleteBlocksCommand([
      { index: 0, block: baseBlocks[0] },
      { index: 2, block: baseBlocks[2] },
    ])
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo).toHaveLength(3)
    expect(afterUndo).toEqual(baseBlocks)
  })

  it('undo does not mutate the input array', () => {
    const command = new DeleteBlocksCommand([
      { index: 1, block: baseBlocks[1] },
    ])
    const afterExecute = command.execute(baseBlocks)
    command.undo(afterExecute)

    expect(afterExecute).toHaveLength(2)
  })

  it('handles sequential delete-then-undo correctly (the reported bug scenario)', () => {
    // 模拟用户操作：先删除按钮，再删除输入框，然后连续撤销两次
    const command1 = new DeleteBlocksCommand([
      { index: 1, block: baseBlocks[1] },
    ])
    const afterDelete1 = command1.execute(baseBlocks)
    // [text, input]

    const command2 = new DeleteBlocksCommand([
      { index: 1, block: afterDelete1[1] },
    ])
    const afterDelete2 = command2.execute(afterDelete1)
    // [text]

    const afterUndo2 = command2.undo(afterDelete2)
    // [text, input]
    expect(afterUndo2).toHaveLength(2)
    expect(afterUndo2).toEqual(afterDelete1)

    const afterUndo1 = command1.undo(afterUndo2)
    // [text, button, input]
    expect(afterUndo1).toHaveLength(3)
    expect(afterUndo1).toEqual(baseBlocks)
  })

  it('handles deleting all blocks and undoing', () => {
    const command = new DeleteBlocksCommand(
      baseBlocks.map((block, index) => ({ index, block })),
    )
    const afterExecute = command.execute(baseBlocks)

    expect(afterExecute).toHaveLength(0)

    const afterUndo = command.undo(afterExecute)

    expect(afterUndo).toEqual(baseBlocks)
  })
})

describe('changeZIndexCommand', () => {
  it('execute changes zIndex of a single block', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 10 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].zIndex).toBe(10)
    expect(result[1].zIndex).toBe(1)
  })

  it('undo restores the original zIndex', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 10 },
    ])
    const afterExecute = command.execute(baseBlocks)
    const afterUndo = command.undo(afterExecute)

    expect(afterUndo[0].zIndex).toBe(1)
  })

  it('handles multiple zIndex updates', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 5 },
      { index: 2, fromZIndex: 1, toZIndex: 3 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].zIndex).toBe(5)
    expect(result[1].zIndex).toBe(1)
    expect(result[2].zIndex).toBe(3)
  })

  it('does not mutate the original array', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 99 },
    ])
    command.execute(baseBlocks)

    expect(baseBlocks[0].zIndex).toBe(1)
  })

  it('preserves non-zIndex properties', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 99 },
    ])
    const result = command.execute(baseBlocks)

    expect(result[0].top).toBe(100)
    expect(result[0].left).toBe(100)
    expect(result[0].key).toBe('text')
  })

  it('execute then undo restores original state', () => {
    const command = new ChangeZIndexCommand([
      { index: 0, fromZIndex: 1, toZIndex: 5 },
      { index: 1, fromZIndex: 1, toZIndex: 3 },
    ])
    const result = command.undo(command.execute(baseBlocks))

    expect(result[0].zIndex).toBe(1)
    expect(result[1].zIndex).toBe(1)
  })
})
