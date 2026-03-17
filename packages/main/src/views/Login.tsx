import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message, Spin } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string, password: string }) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.status === 0) {
        localStorage.setItem('token', data.data.access_token)
        message.success('登录成功')
        navigate('/')
      }
      else {
        message.error(data.message || '登录失败')
      }
    }
    catch {
      message.error('网络错误，请稍后重试')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Spin spinning={loading} fullscreen />
      <div
        className="min-h-screen center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Card
          style={{ width: 400, borderRadius: 12 }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          <div className="text-center" style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0,
              }}
            >
              低代码平台
            </h1>
            <p style={{ color: '#999', marginTop: 8, fontSize: 14 }}>
              可视化搭建，高效创造
            </p>
          </div>

          <Form form={form} onFinish={onFinish} size="large">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="账号" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontSize: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  )
}

export default Login
