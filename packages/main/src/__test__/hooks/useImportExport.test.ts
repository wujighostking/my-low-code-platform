import { describe, expect, it } from 'vitest'
import { validateEditorData } from '@/hooks/useImportExport'

describe('validateEditorData', () => {
  it('accepts valid editor data', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [
        { top: 100, left: 100, zIndex: 1, key: 'text' },
        { top: 200, left: 200, zIndex: 1, key: 'button' },
      ],
    }

    expect(validateEditorData(data)).toBe(true)
  })

  it('accepts valid data with empty blocks array', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [],
    }

    expect(validateEditorData(data)).toBe(true)
  })

  it('rejects null', () => {
    expect(validateEditorData(null)).toBe(false)
  })

  it('rejects non-object', () => {
    expect(validateEditorData('string')).toBe(false)
    expect(validateEditorData(42)).toBe(false)
    expect(validateEditorData(undefined)).toBe(false)
  })

  it('rejects missing container', () => {
    const data = { blocks: [] }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects container with missing width', () => {
    const data = {
      container: { height: 800 },
      blocks: [],
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects container with missing height', () => {
    const data = {
      container: { width: 800 },
      blocks: [],
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects missing blocks', () => {
    const data = { container: { width: 800, height: 800 } }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects blocks that is not an array', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: 'not-array',
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects block with missing top', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [{ left: 100, zIndex: 1, key: 'text' }],
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects block with non-number left', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [{ top: 100, left: '100', zIndex: 1, key: 'text' }],
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects block with unregistered component key', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [{ top: 100, left: 100, zIndex: 1, key: 'unknown-component' }],
    }

    expect(validateEditorData(data)).toBe(false)
  })

  it('rejects block that is null', () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [null],
    }

    expect(validateEditorData(data)).toBe(false)
  })
})
