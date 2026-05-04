import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Empty,
  Spin,
  Tag,
  Modal,
  Descriptions,
  List,
  Button,
  Divider,
  Statistic,
} from 'antd'
import {
  SearchOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { sportApi } from '../services/api'
import dayjs from 'dayjs'

const { Search } = Input
const { Meta } = Card

const SportKnowledge = () => {
  const [loading, setLoading] = useState(false)
  const [knowledges, setKnowledges] = useState([])
  const [category, setCategory] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentKnowledge, setCurrentKnowledge] = useState(null)
  const [sportDetails, setSportDetails] = useState([])

  const fetchKnowledges = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category) params.category = category
      if (keyword) params.keyword = keyword
      const res = await sportApi.getKnowledges({ page: 1, page_size: 50, ...params })
      setKnowledges(res.data.list || [])
    } catch (error) {
      console.error('Failed to fetch knowledges:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledges()
  }, [category, keyword])

  const handleViewDetail = async (knowledge) => {
    setCurrentKnowledge(knowledge)
    try {
      const detailsRes = await sportApi.getDetails(knowledge.id)
      setSportDetails(detailsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch details:', error)
    }
    setDetailVisible(true)
  }

  const categoryOptions = [
    { label: '全部', value: null },
    { label: '有氧运动', value: '有氧运动' },
    { label: '力量训练', value: '力量训练' },
    { label: '柔韧性', value: '柔韧性' },
  ]

  const getLevelColor = (level) => {
    const map = {
      初级: 'blue',
      中级: 'orange',
      高级: 'red',
    }
    return map[level] || 'default'
  }

  return (
    <div>
      <Card
        title="运动知识"
        extra={
          <Row gutter={16}>
            <Col>
              <Select
                style={{ width: 120 }}
                placeholder="分类"
                value={category}
                onChange={setCategory}
                allowClear
                options={categoryOptions}
              />
            </Col>
            <Col>
              <Search
                placeholder="搜索运动知识"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: 250 }}
                onSearch={(value) => setKeyword(value)}
              />
            </Col>
          </Row>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : knowledges.length > 0 ? (
          <Row gutter={[16, 16]}>
            {knowledges.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  className="sport-card"
                  onClick={() => handleViewDetail(item)}
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'white',
                      }}
                    >
                      <BookOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                      <Tag color="white">{item.category || '运动'}</Tag>
                    </div>
                  }
                >
                  <Meta
                    title={item.title}
                    description={
                      <div>
                        <p style={{ margin: 0, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.description}
                        </p>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#999' }}>
                          <span><StarOutlined /> {item.views || 0} 浏览</span>
                          <span>{dayjs(item.created_at).format('YYYY-MM-DD')}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无运动知识数据" />
        )}
      </Card>

      <Modal
        title={currentKnowledge?.title}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentKnowledge && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{currentKnowledge.category}</Tag>
              <span style={{ marginLeft: 16, color: '#999', fontSize: 14 }}>
                <StarOutlined style={{ marginRight: 4 }} />
                {currentKnowledge.views || 0} 浏览
              </span>
              <span style={{ marginLeft: 16, color: '#999', fontSize: 14 }}>
                {dayjs(currentKnowledge.created_at).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>简介</h4>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                {currentKnowledge.description}
              </p>
            </div>

            {currentKnowledge.content && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>详细内容</h4>
                <p style={{ color: '#333', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
                  {currentKnowledge.content}
                </p>
              </div>
            )}

            {sportDetails.length > 0 && (
              <div>
                <Divider />
                <h4 style={{ marginBottom: 16 }}>相关运动详情</h4>
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={sportDetails}
                  renderItem={(item) => (
                    <List.Item>
                      <Card
                        size="small"
                        cover={
                          <div
                            style={{
                              height: 100,
                              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}
                          >
                            <FireOutlined style={{ fontSize: 32 }} />
                          </div>
                        }
                      >
                        <Meta
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {item.title}
                              <Tag color={getLevelColor(item.level)}>{item.level}</Tag>
                            </div>
                          }
                          description={
                            <div style={{ marginTop: 8 }}>
                              <Statistic
                                title="时长"
                                value={item.duration}
                                suffix="分钟"
                                size="small"
                                style={{ display: 'inline-block', marginRight: 16 }}
                                valueStyle={{ fontSize: 16 }}
                              />
                              <Statistic
                                title="消耗"
                                value={item.calories}
                                suffix="kcal"
                                size="small"
                                style={{ display: 'inline-block' }}
                                valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
                              />
                              <p style={{ margin: 0, marginTop: 8, color: '#666', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {item.description}
                              </p>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SportKnowledge
