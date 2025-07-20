'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Button, Select, Tag, Space, Card, Statistic, Drawer, message, Avatar, List, Popconfirm, Tabs, Tooltip } from 'antd'
import { UserOutlined, ReloadOutlined, EyeOutlined, StopOutlined, DeleteOutlined, CheckOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, ShoppingOutlined, CrownOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useMediaQuery } from 'react-responsive'
import translations from '../../lib/translations/admin/userManagement.json'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface User {
  _id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  phone?: string
  addresses?: Array<{
    title: string
    street: string
    city: string
    district: string
    phone: string
  }>
}

interface Order {
  _id: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
  items: Array<{
    food: {
      name: string
      price: number
    }
    quantity: number
  }>
  deliveryAddress: {
    title: string
    street: string
    city: string
    district: string
    phone: string
  }
}

interface StatusConfig {
  emoji: string;
  color: string;
  text: string;
}

interface OrderStatusConfig {
  [key: string]: StatusConfig;
}

const orderStatusConfig: OrderStatusConfig = {
  pending: { emoji: '🕒', color: 'warning', text: translations.userDetail.orders.status.pending },
  confirmed: { emoji: '✅', color: 'processing', text: translations.userDetail.orders.status.confirmed },
  preparing: { emoji: '👨‍🍳', color: 'orange', text: translations.userDetail.orders.status.preparing },
  ready: { emoji: '🍽️', color: 'purple', text: translations.userDetail.orders.status.ready },
  delivered: { emoji: '🚚', color: 'success', text: translations.userDetail.orders.status.delivered },
  cancelled: { emoji: '❌', color: 'error', text: translations.userDetail.orders.status.cancelled }
};

interface PaymentStatusConfig {
  [key: string]: StatusConfig;
}

const paymentStatusConfig: PaymentStatusConfig = {
  pending: { emoji: '⏳', color: 'warning', text: translations.userDetail.orders.payment.pending },
  paid: { emoji: '💰', color: 'success', text: translations.userDetail.orders.payment.paid },
  failed: { emoji: '❌', color: 'error', text: translations.userDetail.orders.payment.failed }
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsRefreshing(true)
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data.users || [])
      messageApi.success(translations.messages.success.usersUpdated)
    } catch (error) {
      console.error('Error loading users:', error)
      messageApi.error(translations.messages.error.loadUsers)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  const fetchUserOrders = async (userId: string) => {
    try {
      setIsLoadingOrders(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${API_URL}/admin/users/${userId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setUserOrders(response.data.orders)
      } else {
        setUserOrders([])
      }
    } catch (error) {
      console.error('Kullanıcı siparişleri yüklenirken hata:', error)
      messageApi.error('Siparişler yüklenirken bir hata oluştu')
      setUserOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.patch(`${API_URL}/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      await fetchUsers()
      messageApi.success('Kullanıcı durumu güncellendi')
    } catch (error) {
      console.error('Kullanıcı durumu değiştirilirken hata:', error)
      messageApi.error('Kullanıcı durumu güncellenirken bir hata oluştu')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      await fetchUsers()
      messageApi.success('Kullanıcı silindi')
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error)
      messageApi.error('Kullanıcı silinirken bir hata oluştu')
    }
  }

  const handleUserDetail = async (user: User) => {
    setSelectedUser(user)
    setDrawerVisible(true)
    await fetchUserOrders(user._id)
  }

  const getOrderStatusTag = (status: string) => {
    const config = orderStatusConfig[status] || { emoji: '❓', color: 'default', text: status };
    return (
      <Tag color={config.color}>
        <span className="mr-1">{config.emoji}</span>
        {config.text}
      </Tag>
    );
  };

  const getPaymentStatusTag = (status: string) => {
    const config = paymentStatusConfig[status] || { emoji: '❓', color: 'default', text: status };
    return (
      <Tag color={config.color}>
        <span className="mr-1">{config.emoji}</span>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: translations.table.columns.user,
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.username}</div>
            {record.phone && (
              <div className="text-xs text-gray-500">{record.phone}</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: translations.table.columns.email,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: translations.table.columns.role,
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'purple' : 'default'}>
          {role === 'admin' ? translations.table.roles.admin : translations.table.roles.user}
        </Tag>
      ),
    },
    {
      title: translations.table.columns.status,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? translations.table.status.active : translations.table.status.inactive}
        </Tag>
      ),
    },
    {
      title: translations.table.columns.registrationDate,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleUserDetail(record)}
            className="bg-blue-500"
          >
            {translations.table.actions.detail}
          </Button>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            size="small"
            icon={record.isActive ? <StopOutlined /> : <CheckOutlined />}
            onClick={() => toggleUserStatus(record._id)}
            danger={record.isActive}
            className={record.isActive ? '' : 'bg-green-500'}
          >
            {record.isActive ? translations.table.actions.deactivate : translations.table.actions.activate}
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title={translations.deleteConfirm.title}
              description={translations.deleteConfirm.description}
              onConfirm={() => deleteUser(record._id)}
              okText={translations.deleteConfirm.ok}
              cancelText={translations.deleteConfirm.cancel}
            >
              <Button
                type="primary"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                {translations.table.actions.delete}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const stats = [
    {
      title: translations.stats.totalUsers,
      value: users.length,
      color: 'blue',
      prefix: <UserOutlined />
    },
    {
      title: translations.stats.activeUsers,
      value: users.filter(u => u.isActive).length,
      color: 'green',
      prefix: <CheckOutlined />
    },
    {
      title: translations.stats.inactiveUsers,
      value: users.filter(u => !u.isActive).length,
      color: 'red',
      prefix: <StopOutlined />
    },
    {
      title: translations.stats.adminUsers,
      value: users.filter(u => u.role === 'admin').length,
      color: 'purple',
      prefix: <UserOutlined />
    }
  ]

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              valueStyle={{ color: `var(--ant-${stat.color}-6)` }}
            />
          </Card>
        ))}
      </div>

      <Card
        title={translations.table.title}
        extra={
          <Space>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">{translations.table.filters.allUsers}</Select.Option>
              <Select.Option value="active">{translations.table.filters.activeUsers}</Select.Option>
              <Select.Option value="inactive">{translations.table.filters.inactiveUsers}</Select.Option>
              <Select.Option value="admin">{translations.table.filters.adminUsers}</Select.Option>
            </Select>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={fetchUsers}
              loading={isRefreshing}
              className="bg-blue-500"
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users.filter(user => {
            if (filter === 'all') return true
            if (filter === 'active') return user.isActive
            if (filter === 'inactive') return !user.isActive
            if (filter === 'admin') return user.role === 'admin'
            return true
          })}
          rowKey="_id"
          loading={isLoading}
        />
      </Card>

      <Drawer
        title={
          <Space className="items-center">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              className={`${selectedUser?.isActive ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {selectedUser?.username}
                {selectedUser?.role === 'admin' && (
                  <Tooltip title={translations.table.roles.admin}>
                    <CrownOutlined className="text-yellow-500" />
                  </Tooltip>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {selectedUser?.isActive ? `🟢 ${translations.table.status.active}` : `🔴 ${translations.table.status.inactive}`}
              </div>
            </div>
          </Space>
        }
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedUser(null);
          setUserOrders([]);
        }}
        open={drawerVisible}
        width={isMobile ? '100%' : 800}
        styles={{
          body: {
            padding: 0,
          }
        }}
      >
        {selectedUser && (
          <div className="h-full">
            <Tabs
              defaultActiveKey="info"
              style={{
                margin: "10px 40px"
              }}
              items={[
                {
                  key: 'info',
                  label: (
                    <span>
                      <UserOutlined /> {translations.userDetail.tabs.info}
                    </span>
                  ),
                  children: (
                    <div className="p-4 space-y-6">
                      <Card hoverable className="border-2 border-blue-100">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <MailOutlined className="text-blue-500 text-xl" />
                            <div>
                              <div className="text-sm text-gray-500">{translations.userDetail.info.email}</div>
                              <div className="font-medium">{selectedUser.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <PhoneOutlined className="text-green-500 text-xl" />
                            <div>
                              <div className="text-sm text-gray-500">{translations.userDetail.info.phone}</div>
                              <div className="font-medium">{selectedUser.phone || translations.userDetail.info.notSpecified}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarOutlined className="text-orange-500 text-xl" />
                            <div>
                              <div className="text-sm text-gray-500">{translations.userDetail.info.registrationDate}</div>
                              <div className="font-medium">
                                {new Date(selectedUser.createdAt).toLocaleString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ),
                },
                {
                  key: 'addresses',
                  label: (
                    <span>
                      <EnvironmentOutlined /> {translations.userDetail.tabs.addresses}
                    </span>
                  ),
                  children: (
                    <div className="p-4">
                      {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {selectedUser.addresses.map((address, index) => (
                            <Card
                              key={index}
                              hoverable
                              className="border-2 border-green-100 hover:border-green-300 transition-all"
                            >
                              <div className="space-y-2">
                                <div className="text-lg font-medium text-green-600">
                                  {address.title}
                                </div>
                                <div className="text-gray-600">
                                  {address.street}
                                </div>
                                <div className="text-gray-500">
                                  {address.district}, {address.city}
                                </div>
                                <div className="text-gray-500">
                                  📞 {address.phone}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <EnvironmentOutlined className="text-4xl mb-2" />
                          <p>{translations.userDetail.addresses.noAddress}</p>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'orders',
                  label: (
                    <span>
                      <ShoppingOutlined /> {translations.userDetail.tabs.orders}
                    </span>
                  ),
                  children: (
                    <div className="p-4">
                      <List
                        loading={isLoadingOrders}
                        dataSource={userOrders}
                        locale={{
                          emptyText: (
                            <div className="text-center py-8 my-8 text-gray-500">
                              <ShoppingOutlined className="text-4xl mb-2" />
                              <p>{translations.userDetail.orders.noOrders}</p>
                            </div>
                          )
                        }}
                        renderItem={order => (
                          <Card
                            key={order._id}
                            style={{
                              margin: "40px 0px"
                            }}
                            className="my-8 border-2 border-blue-50 hover:border-blue-200 transition-all"
                            hoverable
                          >
                            <div className="space-y-4 my-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-lg font-medium">
                                    {translations.userDetail.orders.orderId} #{order._id.slice(-8)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    <ClockCircleOutlined className="mr-1" />
                                    {new Date(order.createdAt).toLocaleString('tr-TR')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-green-600">
                                    <DollarOutlined className="mr-1" />
                                    ₺{order.totalAmount.toFixed(2)}
                                  </div>
                                  <Space>
                                    {getOrderStatusTag(order.orderStatus)}
                                    {getPaymentStatusTag(order.paymentStatus)}
                                  </Space>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium mb-2">🛍️ {translations.userDetail.orders.orderContent}</div>
                                <div className="space-y-1">
                                  {order.items?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                      <div>
                                        <span className="font-medium">{item.quantity}x</span> {item.food?.name}
                                      </div>
                                      <div className="text-gray-600">
                                        ₺{(item.food?.price * item.quantity).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium mb-2">
                                  <EnvironmentOutlined className="mr-1" />
                                  {translations.userDetail.orders.deliveryAddress}
                                </div>
                                <div className="text-gray-600">
                                  {order.deliveryAddress.street}
                                </div>
                                <div className="text-gray-500">
                                  {order.deliveryAddress.district}, {order.deliveryAddress.city}
                                </div>
                                <div className="text-gray-500">
                                  📞 {order.deliveryAddress.phone}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
} 