import type { Block } from '@/hooks/useCanvasDrop'

export interface Command {
  execute: (blocks: Block[]) => Block[]
  undo: (blocks: Block[]) => Block[]
}

export class AddBlockCommand implements Command {
  private block: Block

  constructor(block: Block) {
    this.block = block
  }

  execute(blocks: Block[]): Block[] {
    return [...blocks, this.block]
  }

  undo(blocks: Block[]): Block[] {
    return blocks.slice(0, -1)
  }
}

interface MoveUpdate {
  index: number
  fromTop: number
  fromLeft: number
  toTop: number
  toLeft: number
}

export class MoveBlocksCommand implements Command {
  private updates: MoveUpdate[]

  constructor(updates: MoveUpdate[]) {
    this.updates = updates
  }

  execute(blocks: Block[]): Block[] {
    const next = [...blocks]
    this.updates.forEach(({ index, toTop, toLeft }) => {
      next[index] = { ...next[index], top: toTop, left: toLeft }
    })
    return next
  }

  undo(blocks: Block[]): Block[] {
    const next = [...blocks]
    this.updates.forEach(({ index, fromTop, fromLeft }) => {
      next[index] = { ...next[index], top: fromTop, left: fromLeft }
    })
    return next
  }
}
