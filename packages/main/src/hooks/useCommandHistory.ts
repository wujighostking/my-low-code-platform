import type { Dispatch, SetStateAction } from 'react'
import type { Command } from '@/commands'
import type { Block } from '@/hooks/useCanvasDrop'
import { useRef, useState } from 'react'

const MAX_HISTORY = 50

interface UseCommandHistoryOptions {
  setBlocks: Dispatch<SetStateAction<Block[]>>
}

export function useCommandHistory({ setBlocks }: UseCommandHistoryOptions) {
  const undoStackRef = useRef<Command[]>([])
  const redoStackRef = useRef<Command[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncFlags = () => {
    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(redoStackRef.current.length > 0)
  }

  const executeCommand = (command: Command) => {
    setBlocks(prev => command.execute(prev))
    undoStackRef.current.push(command)
    if (undoStackRef.current.length > MAX_HISTORY)
      undoStackRef.current.shift()
    redoStackRef.current = []
    syncFlags()
  }

  const undo = () => {
    const command = undoStackRef.current.pop()
    if (!command)
      return
    setBlocks(prev => command.undo(prev))
    redoStackRef.current.push(command)
    syncFlags()
  }

  const redo = () => {
    const command = redoStackRef.current.pop()
    if (!command)
      return
    setBlocks(prev => command.execute(prev))
    undoStackRef.current.push(command)
    syncFlags()
  }

  return { executeCommand, undo, redo, canUndo, canRedo }
}
