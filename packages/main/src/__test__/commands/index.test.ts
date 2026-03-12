import type { Block } from '@/hooks/useCanvasDrop'
import { describe, expect, it } from 'vitest'
import { AddBlockCommand, MoveBlocksCommand } from '@/commands'

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
