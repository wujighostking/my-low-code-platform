import { act, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import Preview from '../../views/Preview'

const validData = {
  container: { width: 800, height: 800 },
  blocks: [
    { top: 100, left: 100, zIndex: 1, key: 'text' },
    { top: 200, left: 200, zIndex: 2, key: 'button' },
  ],
}

function renderPreview() {
  return render(
    <MemoryRouter>
      <Preview />
    </MemoryRouter>,
  )
}

afterEach(() => {
  sessionStorage.clear()
})

describe('preview', () => {
  it('shows empty state when no preview data in sessionStorage', async () => {
    renderPreview()
    await expect.element(page.getByText('暂无预览数据，请从编辑器中点击预览按钮')).toBeInTheDocument()
  })

  it('shows empty state when sessionStorage contains invalid JSON', async () => {
    sessionStorage.setItem('preview-data', '{invalid json')
    renderPreview()
    await expect.element(page.getByText('暂无预览数据，请从编辑器中点击预览按钮')).toBeInTheDocument()
  })

  it('renders blocks from sessionStorage data', async () => {
    sessionStorage.setItem('preview-data', JSON.stringify(validData))
    renderPreview()
    await expect.element(page.getByText('渲染文本')).toBeInTheDocument()
    await expect.element(page.getByText('渲染按钮')).toBeInTheDocument()
  })

  it('renders back-to-edit button', async () => {
    sessionStorage.setItem('preview-data', JSON.stringify(validData))
    renderPreview()
    await expect.element(page.getByText('返回编辑')).toBeInTheDocument()
  })

  it('applies container dimensions to the canvas', async () => {
    sessionStorage.setItem('preview-data', JSON.stringify(validData))
    renderPreview()

    const button = page.getByText('渲染按钮')
    await expect.element(button).toBeInTheDocument()

    const canvas = button.element().closest('[style*="overflow"]') as HTMLElement
    expect(canvas.style.width).toBe('800px')
    expect(canvas.style.height).toBe('800px')
  })

  it('skips blocks with unregistered component keys', async () => {
    const data = {
      container: { width: 800, height: 800 },
      blocks: [
        { top: 100, left: 100, zIndex: 1, key: 'text' },
        { top: 200, left: 200, zIndex: 1, key: 'unknown-component' },
      ],
    }
    sessionStorage.setItem('preview-data', JSON.stringify(data))
    renderPreview()
    await expect.element(page.getByText('渲染文本')).toBeInTheDocument()
  })

  it('navigates to home when back-to-edit button is clicked', async () => {
    sessionStorage.setItem('preview-data', JSON.stringify(validData))
    renderPreview()

    const button = page.getByText('返回编辑')
    await act(async () => {
      await button.click()
    })
  })
})
