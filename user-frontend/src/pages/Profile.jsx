import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  message,
  Spin,
  Avatar,
  Descriptions,
  Divider,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { userApi } from '../services/api'

const { Option } = Select

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form] = Form.useForm()

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await userApi.getProfile()
      setProfile(res.data)
      form.setFieldsValue({
        real_name: res.data.real_name,
        email: res.data.email,
        phone: res.data.phone,
        age: res.data.age,
        gender: res.data.gender,
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      await userApi.updateProfile({
        real_name: values.real_name,
        email: values.email,
        phone: values.phone,
        age: values.age,
        gender: values.gender,
      })
      message.success('更新成功')
      fetchProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Card title="个人资料">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div style={{ marginLeft: 24 }}>
            <h2 style={{ margin: 0 }}>{profile?.real_name || profile?.username}</h2>
            <p style={{ margin: 0, marginTop: 8, color: '#666' }}>
              用户名：{profile?.username}
            </p>
            <p style={{ margin: 0, marginTop: 4, color: '#666' }}>
              角色：{profile?.role_name === 'admin' ? '管理员' : '普通用户'}
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Form.Item name="real_name" label="真实姓名">
              <Input placeholder="请输入真实姓名" />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}>
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item name="phone" label="手机号">
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="age" label="年龄">
              <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="请输入年龄" />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Select placeholder="请选择性别" allowClear>
                <Option value="男">男</Option>
                <Option value="女">女</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={saving} size="large">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
