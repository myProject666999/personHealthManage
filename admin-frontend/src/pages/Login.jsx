import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      if (res.data.user.role_name !== 'admin') {
        message.error('该账号不是管理员账号，请前往用户端登录')
        setLoading(false)
        return
      }
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('admin_user', JSON.stringify(res.data.user))
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">个人健康管理系统</h2>
        <h3 style={{ textAlign: 'center', marginBottom: 30, color: '#666' }}>管理端登录</h3>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
            管理员测试账号：admin / admin123
          </p>
          <p style={{ margin: 0, marginTop: 8, fontSize: 14, color: '#666' }}>
            普通用户请前往用户端登录
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
