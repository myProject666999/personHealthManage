import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { userApi, sportApi, healthApi } from '../services/api'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    knowledges: 0,
    records: 0,
  })

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, knowledgesRes, recordsRes] = await Promise.all([
        userApi.getUsers({ page: 1, page_size: 1 }),
        sportApi.getKnowledges({ page: 1, page_size: 1 }),
        healthApi.getRecords({ page: 1, page_size: 1 }),
      ])
      setStats({
        users: usersRes.data.total || 0,
        roles: 2,
        knowledges: knowledgesRes.data.total || 0,
        records: recordsRes.data.total || 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Card title="系统概览">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="用户总数"
                value={stats.users}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="角色数量"
                value={stats.roles}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="运动知识"
                value={stats.knowledges}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="健康记录"
                value={stats.records}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="系统说明" style={{ marginTop: 16 }}>
        <div style={{ padding: '0 16px' }}>
          <h4 style={{ marginBottom: 12 }}>功能说明：</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>用户管理</strong>：管理系统用户，支持新增、编辑、删除用户操作
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>角色管理</strong>：管理系统角色，支持新增、编辑、删除角色操作
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>运动知识管理</strong>：管理运动知识和运动详情，支持新增、编辑、删除操作
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>健康记录管理</strong>：查看和管理用户的健康记录和健康评估
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
