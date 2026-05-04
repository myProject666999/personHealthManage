import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Modal,
  Descriptions,
  Row,
  Col,
  Statistic,
} from 'antd'
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { healthApi } from '../services/api'
import dayjs from 'dayjs'

const HealthEvaluation = () => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [evalTotal, setEvalTotal] = useState(0)
  const [evalCurrent, setEvalCurrent] = useState(1)
  const [evalPageSize, setEvalPageSize] = useState(10)
  const [resultVisible, setResultVisible] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  const fetchRecords = async () => {
    try {
      const res = await healthApi.getRecords({ page: 1, page_size: 100 })
      setRecords(res.data.list || [])
    } catch (error) {
      console.error('Failed to fetch records:', error)
    }
  }

  const fetchEvaluations = async (page = 1, size = 10) => {
    setLoading(true)
    try {
      const res = await healthApi.getEvaluations({ page, page_size: size })
      setEvaluations(res.data.list || [])
      setEvalTotal(res.data.total || 0)
      setEvalCurrent(page)
      setEvalPageSize(size)
    } catch (error) {
      console.error('Failed to fetch evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
    fetchEvaluations()
  }, [])

  const handleEvaluate = async () => {
    if (!selectedRecord) {
      message.warning('请先选择一条健康记录')
      return
    }

    setEvaluating(true)
    try {
      const res = await healthApi.evaluate(selectedRecord)
      setCurrentResult(res.data)
      setResultVisible(true)
      fetchEvaluations(evalCurrent, evalPageSize)
    } catch (error) {
      console.error('Failed to evaluate:', error)
    } finally {
      setEvaluating(false)
    }
  }

  const handleViewResult = (record) => {
    setCurrentResult(record)
    setResultVisible(true)
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#52c41a'
    if (score >= 70) return '#1890ff'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const getStatusColor = (status) => {
    const map = {
      正常: 'green',
      偏瘦: 'blue',
      偏胖: 'orange',
      肥胖: 'red',
      偏高: 'orange',
      高血压: 'red',
      偏慢: 'blue',
      偏快: 'orange',
      偏低: 'blue',
      过高: 'red',
      未检测: 'default',
    }
    return map[status] || 'default'
  }

  const columns = [
    {
      title: '评估时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '综合评分',
      dataIndex: 'overall_score',
      key: 'overall_score',
      render: (score) => (
        <span style={{ fontSize: 18, fontWeight: 'bold', color: getScoreColor(score) }}>
          {score?.toFixed(1) || '-'}
        </span>
      ),
    },
    {
      title: 'BMI状态',
      dataIndex: 'bmi_status',
      key: 'bmi_status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '血压状态',
      dataIndex: 'blood_pressure_status',
      key: 'blood_pressure_status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '心率状态',
      dataIndex: 'heart_rate_status',
      key: 'heart_rate_status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewResult(record)}>
          查看详情
        </Button>
      ),
    },
  ]

  const recordOptions = records.map((r) => ({
    label: `${dayjs(r.created_at).format('YYYY-MM-DD')} - 身高:${r.height || '-'}cm 体重:${r.weight || '-'}kg`,
    value: r.id,
  }))

  return (
    <div>
      <Card title="健康评估">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={16}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择要评估的健康记录"
              value={selectedRecord}
              onChange={setSelectedRecord}
              options={recordOptions}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckCircleOutlined />}
              onClick={handleEvaluate}
              loading={evaluating}
            >
              开始评估
            </Button>
          </Col>
        </Row>

        <Table
          title={() => <span>历史评估记录</span>}
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: evalCurrent,
            pageSize: evalPageSize,
            total: evalTotal,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => fetchEvaluations(page, size),
            onShowSizeChange: (page, size) => fetchEvaluations(page, size),
          }}
        />
      </Card>

      <Modal
        title="评估结果"
        open={resultVisible}
        onCancel={() => setResultVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentResult && (
          <div>
            <div className="evaluation-result">
              <h3 style={{ margin: 0, color: 'white', textAlign: 'center' }}>综合评估结果</h3>
              <div className="score" style={{ color: getScoreColor(currentResult.overall_score) }}>
                {currentResult.overall_score?.toFixed(1) || '-'}
                <span style={{ fontSize: 16, marginLeft: 8 }}>分</span>
              </div>
              <div className="status-item">
                <span>BMI状态</span>
                <Tag color={getStatusColor(currentResult.bmi_status)}>
                  {currentResult.bmi_status}
                </Tag>
              </div>
              <div className="status-item">
                <span>体重状态</span>
                <Tag color={getStatusColor(currentResult.weight_status)}>
                  {currentResult.weight_status}
                </Tag>
              </div>
              <div className="status-item">
                <span>血压状态</span>
                <Tag color={getStatusColor(currentResult.blood_pressure_status)}>
                  {currentResult.blood_pressure_status}
                </Tag>
              </div>
              <div className="status-item">
                <span>心率状态</span>
                <Tag color={getStatusColor(currentResult.heart_rate_status)}>
                  {currentResult.heart_rate_status}
                </Tag>
              </div>
              <div className="status-item">
                <span>体脂状态</span>
                <Tag color={getStatusColor(currentResult.body_fat_status)}>
                  {currentResult.body_fat_status}
                </Tag>
              </div>
            </div>

            <div className="suggestions-box">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <InfoCircleOutlined />
                健康建议
              </h4>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8 }}>
                {currentResult.suggestions || '暂无建议'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HealthEvaluation
