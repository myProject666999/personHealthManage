import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Descriptions,
  Tag,
  Space,
  Spin,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { healthApi } from '../services/api'
import dayjs from 'dayjs'

const HealthRecords = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, size = 10) => {
    setLoading(true)
    try {
      const res = await healthApi.getRecords({ page, page_size: size })
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

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (values) => {
    try {
      if (currentRecord) {
        await healthApi.updateRecord(currentRecord.id, values)
        message.success('更新成功')
      } else {
        await healthApi.createRecord(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setCurrentRecord(null)
      fetchData(current, pageSize)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  const handleEdit = (record) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      height: record.height,
      weight: record.weight,
      blood_pressure_high: record.blood_pressure_high,
      blood_pressure_low: record.blood_pressure_low,
      heart_rate: record.heart_rate,
      body_fat: record.body_fat,
      muscle_mass: record.muscle_mass,
      bone_density: record.bone_density,
      water_rate: record.water_rate,
      metabolic_rate: record.metabolic_rate,
      notes: record.notes,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await healthApi.deleteRecord(id)
      message.success('删除成功')
      fetchData(current, pageSize)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleView = (record) => {
    setCurrentRecord(record)
    setDetailVisible(true)
  }

  const getBMIStatus = (bmi) => {
    if (!bmi) return { color: 'default', text: '-' }
    if (bmi < 18.5) return { color: 'blue', text: '偏瘦' }
    if (bmi < 24) return { color: 'green', text: '正常' }
    if (bmi < 28) return { color: 'orange', text: '偏胖' }
    return { color: 'red', text: '肥胖' }
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '身高 (cm)',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: '体重 (kg)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      key: 'bmi',
      render: (bmi) => {
        const status = getBMIStatus(bmi)
        return (
          <span>
            {bmi?.toFixed(1) || '-'}
            {bmi && <Tag color={status.color} style={{ marginLeft: 8 }}>{status.text}</Tag>}
          </span>
        )
      },
    },
    {
      title: '血压 (mmHg)',
      key: 'blood_pressure',
      render: (_, record) =>
        record.blood_pressure_high && record.blood_pressure_low
          ? `${record.blood_pressure_high}/${record.blood_pressure_low}`
          : '-',
    },
    {
      title: '心率 (次/分)',
      dataIndex: 'heart_rate',
      key: 'heart_rate',
    },
    {
      title: '体脂率 (%)',
      dataIndex: 'body_fat',
      key: 'body_fat',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这条记录吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="健康记录管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentRecord(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            新增记录
          </Button>
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
            onChange: (page, size) => fetchData(page, size),
            onShowSizeChange: (page, size) => fetchData(page, size),
          }}
        />
      </Card>

      <Modal
        title={currentRecord ? '编辑健康记录' : '新增健康记录'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setCurrentRecord(null)
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="身体基本信息" style={{ marginBottom: 0 }}>
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item name="height" label="身高 (cm)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={250} style={{ width: '100%' }} placeholder="请输入身高" />
                </Form.Item>
                <Form.Item name="weight" label="体重 (kg)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={300} style={{ width: '100%' }} placeholder="请输入体重" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item label="血压心率" style={{ marginBottom: 0, marginTop: 16 }}>
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Form.Item name="blood_pressure_high" label="收缩压 (mmHg)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={250} style={{ width: '100%' }} placeholder="如：120" />
                </Form.Item>
                <Form.Item name="blood_pressure_low" label="舒张压 (mmHg)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="如：80" />
                </Form.Item>
                <Form.Item name="heart_rate" label="心率 (次/分)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="如：70" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item label="身体成分" style={{ marginBottom: 0, marginTop: 16 }}>
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item name="body_fat" label="体脂率 (%)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如：20" />
                </Form.Item>
                <Form.Item name="muscle_mass" label="肌肉量 (kg)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如：35" />
                </Form.Item>
                <Form.Item name="bone_density" label="骨密度" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={5} step={0.01} style={{ width: '100%' }} placeholder="如：1.2" />
                </Form.Item>
                <Form.Item name="water_rate" label="水分率 (%)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如：55" />
                </Form.Item>
                <Form.Item name="metabolic_rate" label="基础代谢率 (kcal)" style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={5000} style={{ width: '100%' }} placeholder="如：1500" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item name="notes" label="备注" style={{ marginTop: 16 }}>
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setCurrentRecord(null)
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

      <Modal
        title="健康记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="记录时间">
              {dayjs(currentRecord.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="身高">
              {currentRecord.height || '-'} cm
            </Descriptions.Item>
            <Descriptions.Item label="体重">
              {currentRecord.weight || '-'} kg
            </Descriptions.Item>
            <Descriptions.Item label="BMI">
              {currentRecord.bmi?.toFixed(1) || '-'}
              {currentRecord.bmi && (
                <Tag color={getBMIStatus(currentRecord.bmi).color} style={{ marginLeft: 8 }}>
                  {getBMIStatus(currentRecord.bmi).text}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="血压">
              {currentRecord.blood_pressure_high && currentRecord.blood_pressure_low
                ? `${currentRecord.blood_pressure_high}/${currentRecord.blood_pressure_low} mmHg`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="心率">
              {currentRecord.heart_rate || '-'} 次/分
            </Descriptions.Item>
            <Descriptions.Item label="体脂率">
              {currentRecord.body_fat || '-'} %
            </Descriptions.Item>
            <Descriptions.Item label="肌肉量">
              {currentRecord.muscle_mass || '-'} kg
            </Descriptions.Item>
            <Descriptions.Item label="骨密度">
              {currentRecord.bone_density || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="水分率">
              {currentRecord.water_rate || '-'} %
            </Descriptions.Item>
            <Descriptions.Item label="基础代谢率">
              {currentRecord.metabolic_rate || '-'} kcal
            </Descriptions.Item>
            <Descriptions.Item label="备注">
              {currentRecord.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default HealthRecords
