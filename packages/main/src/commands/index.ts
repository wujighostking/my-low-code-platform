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

interface DeleteEntry {
  index: number
  block: Block
}

export class DeleteBlocksCommand implements Command {
  private entries: DeleteEntry[]

  constructor(entries: DeleteEntry[]) {
    this.entries = entries.sort((a, b) => b.index - a.index)
  }

  execute(blocks: Block[]): Block[] {
    const indexSet = new Set(this.entries.map(e => e.index))
    return blocks.filter((_, i) => !indexSet.has(i))
  }

  undo(blocks: Block[]): Block[] {
    const next = [...blocks]
    const sorted = this.entries.toSorted((a, b) => a.index - b.index)
    sorted.forEach(({ index, block }) => {
      next.splice(index, 0, block)
    })
    return next
  }
}

interface ZIndexUpdate {
  index: number
  fromZIndex: number
  toZIndex: number
}

export class ChangeZIndexCommand implements Command {
  private updates: ZIndexUpdate[]

  constructor(updates: ZIndexUpdate[]) {
    this.updates = updates
  }

  execute(blocks: Block[]): Block[] {
    const next = [...blocks]
    this.updates.forEach(({ index, toZIndex }) => {
      next[index] = { ...next[index], zIndex: toZIndex }
    })
    return next
  }

  undo(blocks: Block[]): Block[] {
    const next = [...blocks]
    this.updates.forEach(({ index, fromZIndex }) => {
      next[index] = { ...next[index], zIndex: fromZIndex }
    })
    return next
  }
}
