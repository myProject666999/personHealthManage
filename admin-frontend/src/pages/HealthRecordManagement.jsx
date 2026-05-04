import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Card,
  Space,
  Spin,
  Tag,
  Input,
  Popconfirm,
  Modal,
  Descriptions,
  message,
} from 'antd'
import { SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { healthApi } from '../services/api'
import dayjs from 'dayjs'

const HealthRecordManagement = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  const fetchData = async (page = 1, size = 10, search = '') => {
    setLoading(true)
    try {
      const params = { page, page_size: size }
      if (search) params.username = search
      const res = await healthApi.getRecords(params)
      setData(res.data.list || [])
      setTotal(res.data.total || 0)
      setCurrent(page)
      setPageSize(size)
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvaluations = async () => {
    try {
      const res = await healthApi.getEvaluations({ page: 1, page_size: 100 })
      setEvaluations(res.data.list || [])
    } catch (error) {
      console.error('Failed to fetch evaluations:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchEvaluations()
  }, [])

  const handleSearch = () => {
    fetchData(1, pageSize, searchText)
  }

  const handleDelete = async (id) => {
    try {
      await healthApi.deleteRecord(id)
      message.success('删除成功')
      fetchData(current, pageSize, searchText)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleViewDetail = (record) => {
    setCurrentRecord(record)
    setDetailModalVisible(true)
  }

  const getLevelColor = (level) => {
    switch (level) {
      case '正常':
        return 'green'
      case '偏高':
        return 'orange'
      case '偏快':
        return 'orange'
      case '偏慢':
        return 'blue'
      case '偏低':
        return 'blue'
      case '肥胖':
        return 'red'
      case '高血压':
        return 'red'
      case '过高':
        return 'red'
      default:
        return 'default'
    }
  }

  const getScoreLevel = (score) => {
    if (!score) return { text: '-', color: 'default' }
    if (score >= 85) return { text: '优秀', color: 'green' }
    if (score >= 70) return { text: '良好', color: 'blue' }
    if (score >= 60) return { text: '一般', color: 'orange' }
    return { text: '需关注', color: 'red' }
  }

  const getLevelTag = (bmi) => {
    if (!bmi) return '-'
    if (bmi < 18.5) return <Tag color="orange">偏瘦</Tag>
    if (bmi < 24) return <Tag color="green">正常</Tag>
    if (bmi < 28) return <Tag color="orange">偏胖</Tag>
    return <Tag color="red">肥胖</Tag>
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: ['user', 'username'],
      key: 'username',
      render: (text) => text || '-',
    },
    {
      title: '身高(cm)',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: '体重(kg)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'BMI',
      key: 'bmi',
      render: (_, record) => (
        <div>
          <div>{record.bmi ? record.bmi.toFixed(1) : '-'}</div>
          {getLevelTag(record.bmi)}
        </div>
      ),
    },
    {
      title: '血压',
      key: 'blood_pressure',
      render: (_, record) => (
        <div>
          {record.blood_pressure_high && record.blood_pressure_low
            ? `${record.blood_pressure_high}/${record.blood_pressure_low}`
            : '-'}
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.heart_rate ? `心率: ${record.heart_rate}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: '体脂率',
      dataIndex: 'body_fat',
      key: 'body_fat',
      render: (value) => (value ? `${value}%` : '-'),
    },
    {
      title: '记录日期',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Popconfirm title="确定要删除这个健康记录吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const evaluationColumns = [
    {
      title: '用户名',
      dataIndex: ['user', 'username'],
      key: 'username',
      render: (text) => text || '-',
    },
    {
      title: '整体评分',
      dataIndex: 'overall_score',
      key: 'overall_score',
      render: (score) => {
        const level = getScoreLevel(score)
        return (
          <div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>
              {score?.toFixed(1) || '-'}
            </div>
            <Tag color={level.color}>{level.text}</Tag>
          </div>
        )
      },
    },
    {
      title: 'BMI评估',
      dataIndex: 'bmi_status',
      key: 'bmi_status',
      render: (text) => <Tag color={getLevelColor(text)}>{text || '-'}</Tag>,
    },
    {
      title: '血压评估',
      dataIndex: 'blood_pressure_status',
      key: 'blood_pressure_status',
      render: (text) => <Tag color={getLevelColor(text)}>{text || '-'}</Tag>,
    },
    {
      title: '评估时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
  ]

  return (
    <div>
      <Card
        title="健康记录管理"
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

      <Card title="健康评估记录" style={{ marginTop: 16 }}>
        <Table
          columns={evaluationColumns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="健康记录详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setCurrentRecord(null)
        }}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="用户名">
                {currentRecord.user?.username || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="记录日期">
                {currentRecord.record_date ? dayjs(currentRecord.record_date).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="身高">
                {currentRecord.height ? `${currentRecord.height} cm` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="体重">
                {currentRecord.weight ? `${currentRecord.weight} kg` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="BMI">
                <div>
                  {currentRecord.bmi ? currentRecord.bmi.toFixed(1) : '-'}
                  <div style={{ marginTop: 4 }}>{getLevelTag(currentRecord.bmi)}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="体脂率">
                {currentRecord.body_fat ? `${currentRecord.body_fat}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="收缩压">
                {currentRecord.blood_pressure_high ? `${currentRecord.blood_pressure_high} mmHg` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="舒张压">
                {currentRecord.blood_pressure_low ? `${currentRecord.blood_pressure_low} mmHg` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="心率">
                {currentRecord.heart_rate ? `${currentRecord.heart_rate} 次/分` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                {currentRecord.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

          </div>
        )}
      </Modal>
    </div>
  )
}

export default HealthRecordManagement
