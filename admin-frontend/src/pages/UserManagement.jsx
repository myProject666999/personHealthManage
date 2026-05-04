import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Card,
  Space,
  Spin,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { userApi, roleApi } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const fetchData = async (page = 1, size = 10, search = '') => {
    setLoading(true)
    try {
      const params = { page, page_size: size }
      if (search) params.username = search
      const res = await userApi.getUsers(params)
      setData(res.data.list || [])
      setTotal(res.data.total || 0)
      setCurrent(page)
      setPageSize(size)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await roleApi.getRoles()
      setRoles(res.data || [])
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchRoles()
  }, [])

  const handleSearch = () => {
    fetchData(1, pageSize, searchText)
  }

  const handleSubmit = async (values) => {
    try {
      if (currentUser) {
        await userApi.updateUser(currentUser.id, values)
        message.success('更新成功')
      } else {
        await userApi.createUser(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setCurrentUser(null)
      fetchData(current, pageSize, searchText)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  const handleEdit = (record) => {
    setCurrentUser(record)
    form.setFieldsValue({
      username: record.username,
      real_name: record.real_name,
      email: record.email,
      phone: record.phone,
      age: record.age,
      gender: record.gender,
      role_id: record.role_id,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await userApi.deleteUser(id)
      message.success('删除成功')
      fetchData(current, pageSize, searchText)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return role?.name || '-'
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '角色',
      dataIndex: 'role_id',
      key: 'role_id',
      render: (roleId) => {
        const roleName = getRoleName(roleId)
        return (
          <Tag color={roleName === 'admin' ? 'red' : 'blue'}>
            {roleName === 'admin' ? '管理员' : '普通用户'}
          </Tag>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {getRoleName(record.role_id) !== 'admin' && (
            <Popconfirm title="确定要删除这个用户吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          <Space>
            <Input
              placeholder="搜索用户名"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Button icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentUser(null)
                form.resetFields()
                setModalVisible(true)
              }}
            >
              新增用户
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => fetchData(page, size, searchText),
            onShowSizeChange: (page, size) => fetchData(page, size, searchText),
          }}
        />
      </Card>

      <Modal
        title={currentUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setCurrentUser(null)
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!currentUser} />
          </Form.Item>
          {!currentUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="real_name" label="真实姓名">
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效的邮箱' }]}>
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
          <Form.Item
            name="role_id"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name === 'admin' ? '管理员' : '普通用户'} - {role.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setCurrentUser(null)
              }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
