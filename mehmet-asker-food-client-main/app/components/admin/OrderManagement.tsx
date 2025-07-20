'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Button, Select, Tag, Space, Card, Statistic, Drawer, message, Avatar, Descriptions, List, Badge } from 'antd'
import { EyeOutlined, CheckOutlined, ClockCircleOutlined, FireOutlined, GiftOutlined, CloseOutlined, ReloadOutlined, CarOutlined } from '@ant-design/icons'
import translations from '../../lib/translations/admin/orderManagement.json'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Order {
  _id: string
  user: {
    _id: string
    username: string
    email: string
  }
  items: Array<{
    food: {
      _id: string
      name: string
      price: number
      image: string
    }
    quantity: number
    price: number
  }>
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  stripePaymentIntentId?: string
  paidAt?: string
  deliveryAddress: {
    title: string
    street: string
    city: string
    district: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderStats {
  total: number;
  totalPendingOrders: number;
  totalDeliveredOrders: number;
  totalRevenue: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalOrders, setTotalOrders] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    totalPendingOrders: 0,
    totalDeliveredOrders: 0,
    totalRevenue: 0
  })

 

  const fetchOrders = async (page = currentPage, limit = pageSize) => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      setIsLoading(true)
      const status = filter !== 'all' ? `&status=${filter}` : ''
      const response = await axios.get(`${API_URL}/admin/orders?page=${page}&limit=${limit}${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.orders || [])
      setTotalOrders(response.data.total)
      setOrderStats({
        total: response.data.total,
        totalPendingOrders: response.data.totalPendingOrders,
        totalDeliveredOrders: response.data.totalDeliveredOrders,
        totalRevenue: response.data.totalRevenue
      })
    } catch (error) {
      message.error(translations.messages.error.loadOrders)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatuses = async () => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      setIsRefreshing(true)

      const pendingOrders = orders.filter(order =>
        order.paymentStatus === 'pending' && order.stripePaymentIntentId
      )

      if (pendingOrders.length === 0) {
        message.info(translations.messages.info.noPaymentPending)
        return
      }

      const checkPromises = pendingOrders.map(async (order) => {
        try {
          const response = await axios.post(
            `${API_URL}/admin/orders/${order._id}/check-payment`,
            {
              paymentIntentId: order.stripePaymentIntentId,
              orderId: order._id
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          return response.data
        } catch (error) {
          if (axios.isAxiosError(error)) {
            message.error(`${translations.table.columns.orderId} #${order._id.slice(-8)}: ${error.response?.data?.message || error.message}`)
          }
          return null
        }
      })

      const results = await Promise.all(checkPromises)
      const successfulUpdates = results.filter(Boolean).length

      if (successfulUpdates > 0) {
        message.success(translations.messages.success.paymentCheck.replace('{count}', successfulUpdates.toString()))
      }

      await fetchOrders()
    } catch (error) {
      message.error(translations.messages.error.paymentCheck)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await checkPaymentStatuses()
      await fetchOrders()
    } catch (error) {
      message.error(translations.messages.error.refresh)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
        fetchOrders()
  }, [currentPage, pageSize, filter])



  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.patch(`${API_URL}/admin/orders/${orderId}/status`,
        { orderStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      message.success(translations.messages.success.statusUpdate)
      await fetchOrders()
    } catch (error: any) {
      message.error(error.response?.data?.message || translations.messages.error.statusUpdate)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'processing'
      case 'preparing': return 'orange'
      case 'ready': return 'purple'
      case 'delivered': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled') => {
    return translations.table.status[status] || status
  }

  const getPaymentStatusTag = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Tag color="green">{translations.table.payment.completed}</Tag>
      case 'pending':
        return <Tag color="orange">{translations.table.payment.pending}</Tag>
      case 'failed':
        return <Tag color="red">{translations.table.payment.failed}</Tag>
      default:
        return <Tag color="default">{paymentStatus}</Tag>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />
      case 'confirmed': return <CheckOutlined />
      case 'preparing': return <FireOutlined />
      case 'ready': return <GiftOutlined />
      case 'delivered': return <CheckOutlined />
      case 'cancelled': return <CloseOutlined />
      default: return <ClockCircleOutlined />
    }
  }

  const getNextStatusActions = (orderStatus: string, orderId: string, paymentStatus: string) => {
    const actions = []

    if (orderStatus === 'pending') {
      if (paymentStatus === 'paid') {
        actions.push(
          <Button
            key="confirm"
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => updateOrderStatus(orderId, 'confirmed')}
            className="bg-blue-500"
          >
            {translations.table.actions.confirm}
          </Button>
        )
      } else {
        actions.push(
          <Button
            key="payment-pending"
            disabled
            size="small"
            icon={<ClockCircleOutlined />}
          >
            {translations.table.actions.paymentPending}
          </Button>
        )
      }
    }

    if (orderStatus === 'confirmed') {
      actions.push(
        <Button
          key="preparing"
          type="primary"
          size="small"
          icon={<FireOutlined />}
          onClick={() => updateOrderStatus(orderId, 'preparing')}
          style={{ backgroundColor: '#fa8c16' }}
        >
          {translations.table.actions.preparing}
        </Button>
      )
    }

    if (orderStatus === 'preparing') {
      actions.push(
        <Button
          key="ready"
          type="primary"
          size="small"
          icon={<GiftOutlined />}
          onClick={() => updateOrderStatus(orderId, 'ready')}
          style={{ backgroundColor: '#722ed1' }}
        >
          {translations.table.actions.ready}
        </Button>
      )
    }

    if (orderStatus === 'ready') {
      actions.push(
        <Button
          key="delivered"
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => updateOrderStatus(orderId, 'delivered')}
          className="bg-green-500"
        >
          {translations.table.actions.deliver}
        </Button>
      )
    }

    if (!['delivered', 'cancelled', 'preparing', 'ready'].includes(orderStatus)) {
      actions.push(
        <Button
          key="cancel"
          danger
          size="small"
          icon={<CloseOutlined />}
          onClick={() => updateOrderStatus(orderId, 'cancelled')}
        >
          {translations.table.actions.cancel}
        </Button>
      )
    }

    return actions
  }

  const handleOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setDrawerVisible(true)
  }

  const columns = [
    {
      title: translations.table.columns.orderId,
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <div className="font-mono text-sm">
          #{id.slice(-8)}
        </div>
      ),
    },
    {
      title: translations.table.columns.customer.title,
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div>
          <div className="font-medium">{user?.username || translations.table.columns.customer.unknown}</div>
          <div className="text-sm text-gray-500">{user?.email || translations.table.columns.customer.noEmail}</div>
        </div>
      ),
    },
    {
      title: translations.table.columns.products.title,
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          <div className="font-medium text-green-600">₺{items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</div>
          <div className="text-sm text-gray-500">
            {translations.table.columns.products.itemCount.replace('{count}', items.length.toString())}
          </div>
        </div>
      ),
    },
    {
      title: translations.table.columns.status,
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (orderStatus: string, record: Order) => (
        <Space direction="vertical" size="small">
          <Tag icon={getStatusIcon(orderStatus)} color={getStatusColor(orderStatus)}>
            {getStatusText(orderStatus as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled')}
          </Tag>
          {getPaymentStatusTag(record.paymentStatus)}
        </Space>
      ),
    },
    {
      title: translations.table.columns.orderDate,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('tr-TR')}</div>
          <div className="text-sm text-gray-500">{new Date(date).toLocaleTimeString('tr-TR')}</div>
        </div>
      ),
      sorter: (a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space direction="vertical" size="small">
          <Space wrap>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleOrderDetail(record)}
              className="bg-blue-500"
              size="small"
            >
              {translations.table.actions.detail}
            </Button>
            {record.orderStatus === 'delivered' && (
              <Button
                type="primary"
                icon={<CarOutlined />}
                className="bg-green-500"
                size="small"
                disabled
              >
                {translations.table.actions.delivered}
              </Button>
            )}
          </Space>
          <Space wrap>
            {getNextStatusActions(record.orderStatus, record._id, record.paymentStatus)}
          </Space>
        </Space>
      ),
    },
  ]

  const stats = [
    { title: translations.stats.totalOrders, value: totalOrders || 0, color: 'blue' },
    {
      title: translations.stats.pendingPayment,
      value: orderStats.totalPendingOrders,
      color: 'orange'
    },
    {
      title: translations.stats.delivered,
      value: orderStats.totalDeliveredOrders,
      color: 'green'
    },
    {
      title: translations.stats.totalRevenue,
      value: `$ ${orderStats.totalRevenue.toFixed(2)}`,
      color: 'purple'
    }
  ]

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: `var(--ant-${stat.color}-6)` }}
              />
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 flex-1">
            <Select
              value={filter}
              onChange={setFilter}
              className="min-w-[200px]"
            >
              <Select.Option value="all">{translations.table.filters.all}</Select.Option>
              <Select.Option value="pending">{translations.table.filters.pending}</Select.Option>
              <Select.Option value="confirmed">{translations.table.filters.confirmed}</Select.Option>
              <Select.Option value="preparing">{translations.table.filters.preparing}</Select.Option>
              <Select.Option value="ready">{translations.table.filters.ready}</Select.Option>
              <Select.Option value="delivered">{translations.table.filters.delivered}</Select.Option>
              <Select.Option value="cancelled">{translations.table.filters.cancelled}</Select.Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined spin={isRefreshing} />}
            onClick={handleRefresh}
            loading={isRefreshing}
            className="bg-blue-500"
          >
            {isRefreshing ? translations.buttons.refreshing : translations.buttons.refresh}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalOrders,
            showSizeChanger: true,
            showTotal: (total) => translations.table.pagination.total.replace('{total}', total.toString()),
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span>{translations.drawer.title}</span>
            <Badge count={selectedOrder?._id.slice(-8)} color="blue" />
          </div>
        }
        placement="right"
        closable={true}
        onClose={() => {
          setDrawerVisible(false)
          setSelectedOrder(null)
        }}
        open={drawerVisible}
        width={480}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Descriptions title={translations.drawer.sections.customerInfo.title} bordered size="small">
              <Descriptions.Item label={translations.drawer.sections.customerInfo.name} span={3}>
                <Avatar size="small" className="mr-2">
                  {selectedOrder.user.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                {selectedOrder.user.username}
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.customerInfo.email} span={3}>
                {selectedOrder.user.email}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title={translations.drawer.sections.deliveryAddress.title} bordered size="small">
              <Descriptions.Item label={translations.drawer.sections.deliveryAddress.addressTitle} span={3}>
                {selectedOrder.deliveryAddress.title}
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.deliveryAddress.address} span={3}>
                {selectedOrder.deliveryAddress.street}
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.deliveryAddress.districtCity} span={2}>
                {selectedOrder.deliveryAddress.district}, {selectedOrder.deliveryAddress.city}
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.deliveryAddress.phone} span={1}>
                {selectedOrder.deliveryAddress.phone}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-base font-medium mb-3">{translations.drawer.sections.orderItems.title}</h4>
              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.food.image}
                          size={48}
                          onError={() => true}
                        />
                      }
                      title={item.food.name}
                      description={
                        <div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} x ₺{item.food.price.toFixed(2)}
                          </div>
                        </div>
                      }
                    />
                    <div className="font-semibold text-green-600">
                      ₺{(item.quantity * item.food.price).toFixed(2)}
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Descriptions title={translations.drawer.sections.orderSummary.title} bordered size="small">
              <Descriptions.Item label={translations.drawer.sections.orderSummary.totalAmount} span={2}>
                <span className="text-lg font-bold text-green-600">
                  ₺{selectedOrder.totalAmount.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.orderSummary.status} span={1}>
                <Tag icon={getStatusIcon(selectedOrder.orderStatus)} color={getStatusColor(selectedOrder.orderStatus)}>
                  {getStatusText(selectedOrder.orderStatus as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={translations.drawer.sections.orderSummary.orderDate} span={3}>
                {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
              </Descriptions.Item>
            </Descriptions>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {getNextStatusActions(selectedOrder.orderStatus, selectedOrder._id, selectedOrder.paymentStatus)}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
} 