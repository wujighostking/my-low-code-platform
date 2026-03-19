import type { ReactNode } from 'react'
import { Button, Card, Form, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'

interface AuthLayoutProps {
  loading: boolean
  subtitle: string
  linkHint: string
  linkText: string
  linkTo: string
  children: ReactNode
}

export function AuthLayout({ loading, subtitle, linkHint, linkText, linkTo, children }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <>
      <Spin spinning={loading} fullscreen />
      <div className="min-h-screen bg-gradient-to-br from-#667eea to-#764ba2 center">
        <Card className="w-100 rd-3" classNames={{ body: 'py-10 px-8' }}>
          <div className="text-center mb-8">
            <h1 className="text-7 font-700 color-#1a1a2e m-0">低代码平台</h1>
            <p className="color-#999 mt-2 text-3.5">{subtitle}</p>
          </div>

          {children}

          <div className="text-center mt-4 text-3.5">
            <span className="color-#999">{linkHint}</span>
            <a
              className="color-#667eea cursor-pointer hover:color-#764ba2"
              onClick={() => navigate(linkTo)}
            >
              {linkText}
            </a>
          </div>
        </Card>
      </div>
    </>
  )
}

export function AuthSubmitButton({ loading, children }: { loading: boolean, children: ReactNode }) {
  return (
    <Form.Item className="!mb-0">
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        block
        className="!h-11 !rd-2 !text-4 !bg-gradient-to-br !from-#667eea !to-#764ba2"
      >
        {children}
      </Button>
    </Form.Item>
  )
}
