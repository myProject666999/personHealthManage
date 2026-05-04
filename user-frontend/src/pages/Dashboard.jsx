import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Empty, Spin, message } from 'antd'
import {
  HeartOutlined,
  WeightOutlined,
  RiseOutlined,
  FireOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
} from 'recharts'
import { healthApi } from '../services/api'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [records, setRecords] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, recordsRes] = await Promise.all([
        healthApi.getStats(),
        healthApi.getRecords({ page: 1, page_size: 10 }),
      ])
      setStats(statsRes.data)
      setRecords(recordsRes.data.list || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLatestRecord = () => {
    if (records.length > 0) {
      return records[0]
    }
    return null
  }

  const latestRecord = getLatestRecord()

  const formatChartData = (data, key) => {
    if (!data || !data.length) return []
    return data.map((item) => ({
      date: item.date,
      value: item.value,
    }))
  }

  const formatBPData = (data) => {
    if (!data || !data.length) return []
    return data.map((item) => ({
      date: item.date,
      收缩压: item.high,
      舒张压: item.low,
    }))
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="最新体重 (kg)"
              value={latestRecord?.weight || '--'}
              precision={1}
              prefix={<WeightOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="最新 BMI"
              value={latestRecord?.bmi || '--'}
              precision={1}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="心率 (次/分)"
              value={latestRecord?.heart_rate || '--'}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card">
            <Statistic
              title="体脂率 (%)"
              value={latestRecord?.body_fat || '--'}
              precision={1}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="体重趋势" className="chart-container">
            {stats?.weight_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatChartData(stats.weight_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1890ff"
                    fill="#e6f7ff"
                    name="体重 (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无体重数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="BMI趋势" className="chart-container">
            {stats?.bmi_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData(stats.bmi_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[15, 35]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#52c41a"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="BMI"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无BMI数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="血压趋势" className="chart-container">
            {stats?.blood_pressure_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={formatBPData(stats.blood_pressure_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[50, 160]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="收缩压" fill="#ff4d4f" name="收缩压 (mmHg)" />
                  <Bar dataKey="舒张压" fill="#1890ff" name="舒张压 (mmHg)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无血压数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="心率趋势" className="chart-container">
            {stats?.heart_rate_trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData(stats.heart_rate_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[50, 120]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="心率 (次/分)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无心率数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
