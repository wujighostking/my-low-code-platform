import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, Input, message } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '@/api/auth'
import { AuthLayout, AuthSubmitButton } from '@/components/auth/AuthLayout'

function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string, password: string }) => {
    setLoading(true)
    try {
      const data = await register({ username: values.username, password: values.password })
      localStorage.setItem('token', data.access_token)
      message.success('注册成功')
      navigate('/project')
    }
    catch { /* request 拦截器已处理错误提示 */ }
    finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      loading={loading}
      subtitle="创建账号，开始使用"
      linkHint="已有账号？"
      linkText="去登录"
      linkTo="/login"
    >
      <Form form={form} onFinish={onFinish} size="large">
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入账号' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="账号" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
        </Form.Item>

        <AuthSubmitButton loading={loading}>注 册</AuthSubmitButton>
      </Form>
    </AuthLayout>
  )
}

export default Register
