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
  Space,
  Spin,
  Select,
  Collapse,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { sportApi } from '../services/api'
import dayjs from 'dayjs'

const { Panel } = Collapse
const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const SportKnowledgeManagement = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentKnowledge, setCurrentKnowledge] = useState(null)
  const [currentDetail, setCurrentDetail] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedKnowledge, setSelectedKnowledge] = useState(null)
  const [knowledgeDetails, setKnowledgeDetails] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [form] = Form.useForm()
  const [detailForm] = Form.useForm()

  const fetchData = async (page = 1, size = 10, search = '') => {
    setLoading(true)
    try {
      const params = { page, page_size: size }
      if (search) params.keyword = search
      const res = await sportApi.getKnowledges(params)
      setData(res.data.list || [])
      setTotal(res.data.total || 0)
      setCurrent(page)
      setPageSize(size)
    } catch (error) {
      console.error('Failed to fetch knowledges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetails = async (knowledgeId) => {
    setDetailLoading(true)
    try {
      const res = await sportApi.getDetails(knowledgeId)
      setKnowledgeDetails(res.data || [])
    } catch (error) {
      console.error('Failed to fetch details:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = () => {
    fetchData(1, pageSize, searchText)
  }

  const handleSubmit = async (values) => {
    try {
      if (currentKnowledge) {
        await sportApi.updateKnowledge(currentKnowledge.id, values)
        message.success('更新成功')
      } else {
        await sportApi.createKnowledge(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setCurrentKnowledge(null)
      fetchData(current, pageSize, searchText)
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  const handleDetailSubmit = async (values) => {
    try {
      if (currentDetail) {
        await sportApi.updateDetail(currentDetail.id, values)
        message.success('更新成功')
      } else {
        await sportApi.createDetail({ ...values, sport_knowledge_id: selectedKnowledge })
        message.success('创建成功')
      }
      setDetailModalVisible(false)
      detailForm.resetFields()
      setCurrentDetail(null)
      fetchDetails(selectedKnowledge)
    } catch (error) {
      console.error('Failed to submit detail:', error)
    }
  }

  const handleEdit = (record) => {
    setCurrentKnowledge(record)
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      category: record.category,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await sportApi.deleteKnowledge(id)
      message.success('删除成功')
      fetchData(current, pageSize, searchText)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleDetailEdit = (record) => {
    setCurrentDetail(record)
    detailForm.setFieldsValue({
      title: record.title,
      description: record.description,
      duration: record.duration,
      calories: record.calories,
      level: record.level,
    })
    setDetailModalVisible(true)
  }

  const handleDetailDelete = async (id) => {
    try {
      await sportApi.deleteDetail(id)
      message.success('删除成功')
      fetchDetails(selectedKnowledge)
    } catch (error) {
      console.error('Failed to delete detail:', error)
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
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
          <Button
            type="link"
            onClick={() => {
              setSelectedKnowledge(record.id)
              fetchDetails(record.id)
            }}
          >
            查看详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个运动知识吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const detailColumns = [
    {
      title: '运动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '消耗卡路里',
      dataIndex: 'calories',
      key: 'calories',
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleDetailEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个运动详情吗？" onConfirm={() => handleDetailDelete(record.id)}>
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
        title="运动知识管理"
        extra={
          <Space>
            <Input
              placeholder="搜索标题"
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
                setCurrentKnowledge(null)
                form.resetFields()
                setModalVisible(true)
              }}
            >
              新增运动知识
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

      {selectedKnowledge && (
        <Card
          title="运动详情"
          style={{ marginTop: 16 }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  setSelectedKnowledge(null)
                  setKnowledgeDetails([])
                }}
              >
                关闭
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentDetail(null)
                  detailForm.resetFields()
                  setDetailModalVisible(true)
                }}
              >
                新增运动详情
              </Button>
            </Space>
          }
        >
          <Table
            columns={detailColumns}
            dataSource={knowledgeDetails}
            rowKey="id"
            loading={detailLoading}
            pagination={false}
          />
        </Card>
      )}

      <Modal
        title={currentKnowledge ? '编辑运动知识' : '新增运动知识'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setCurrentKnowledge(null)
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
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea placeholder="请输入描述" rows={4} />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="有氧运动">有氧运动</Option>
              <Option value="力量训练">力量训练</Option>
              <Option value="柔韧性">柔韧性</Option>
              <Option value="平衡训练">平衡训练</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setCurrentKnowledge(null)
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
        title={currentDetail ? '编辑运动详情' : '新增运动详情'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          detailForm.resetFields()
          setCurrentDetail(null)
        }}
        footer={null}
        width={500}
      >
        <Form
          form={detailForm}
          layout="vertical"
          onFinish={handleDetailSubmit}
        >
          <Form.Item
            name="title"
            label="运动名称"
            rules={[{ required: true, message: '请输入运动名称' }]}
          >
            <Input placeholder="请输入运动名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="duration"
              label="时长(分钟)"
              rules={[{ required: true, message: '请输入时长' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入时长" />
            </Form.Item>
            <Form.Item
              name="calories"
              label="消耗卡路里"
              rules={[{ required: true, message: '请输入消耗卡路里' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入消耗卡路里" />
            </Form.Item>
          </div>
          <Form.Item
            name="level"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select placeholder="请选择难度">
              <Option value="初级">初级</Option>
              <Option value="中级">中级</Option>
              <Option value="高级">高级</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setDetailModalVisible(false)
                detailForm.resetFields()
                setCurrentDetail(null)
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

export default SportKnowledgeManagement
