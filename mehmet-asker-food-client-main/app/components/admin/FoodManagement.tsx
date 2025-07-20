'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Button, Input, Select, Modal, Form, InputNumber, Switch, message, Tag, Space, Card, Statistic, Upload } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, InboxOutlined, ReloadOutlined, PercentageOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import translations from '../../lib/translations/admin/foodManagement.json'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Food {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: {
    _id: string
    name: string
  }
  ingredients: string[]
  preparationTime: number
  isAvailable: boolean
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  totalAvailable: number
  totalUnavailable: number
  isDiscount?: boolean
  discount?: number
  discountPrice?: number
}

interface Category {
  _id: string
  name: string
}

export default function FoodManagement() {
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [totalFoods, setTotalFoods] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [availableFoods, setAvailableFoods] = useState(0)
  const [unavailableFoods, setUnavailableFoods] = useState(0)
  const [messageApi, contextHolder] = message.useMessage()
  const token = localStorage.getItem('token')
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false)
  const [discountForm] = Form.useForm()
  const [singleDiscountModalVisible, setSingleDiscountModalVisible] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [singleDiscountForm] = Form.useForm()

  if (!token) {
    messageApi.error(translations.messages.error.session)
    return
  }


  const fetchFoods = async (page = currentPage, limit = pageSize) => {
    try {
      setIsLoading(true)
      const categoryQuery = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
      const response = await axios.get(`${API_URL}/admin/foods?page=${page}&limit=${limit}${categoryQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const foodsData = response.data.foods || []
      setFoods(foodsData)
      setTotalFoods(response.data.total || 0)

      setAvailableFoods(response.data.totalAvailable || 0)
      setUnavailableFoods(response.data.totalUnavailable || 0)
    } catch (error) {
      message.error(translations.messages.error.load)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFoods()
    fetchCategories()
  }, [currentPage, pageSize, selectedCategory])

  const fetchCategories = async () => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCategories(response.data.categories || [])
    } catch (error) {
      message.error(translations.messages.error.load)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      if (editingFood) {
        await axios.put(`${API_URL}/admin/foods/${editingFood._id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        })
        message.success(translations.messages.success.update)
      } else {
        await axios.post(`${API_URL}/admin/foods`, values, {
          headers: { Authorization: `Bearer ${token}` }
        })
        message.success(translations.messages.success.add)
      }

      await fetchFoods()
      setModalVisible(false)
      form.resetFields()
      setEditingFood(null)
    } catch (error) {
      message.error(editingFood ? translations.messages.error.update : translations.messages.error.add)
    }
  }

  const handleEdit = (food: Food) => {
    setEditingFood(food)
    setImageUrl(food.image)
    form.setFieldsValue({
      name: food.name,
      description: food.description,
      price: food.price,
      image: food.image,
      category: food.category._id,
      isAvailable: food.isAvailable
    })
    setModalVisible(true)
  }

  const handleDelete = async (foodId: string) => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.delete(`${API_URL}/admin/foods/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      message.success(translations.messages.success.delete)
      await fetchFoods()
    } catch (error) {
      message.error(translations.messages.error.delete)
    }
  }

  const toggleAvailability = async (foodId: string) => {
    try {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.patch(`${API_URL}/admin/foods/${foodId}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      message.success(translations.messages.success.statusUpdate)
      await fetchFoods()
    } catch (error) {
      message.error(translations.messages.error.statusUpdate)
    }
  }

  const handleImageChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setIsImageLoading(true)
      return
    }

    if (info.file.status === 'done') {
      if (info.file.originFileObj instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImageUrl(e.target?.result as string)
          form.setFieldsValue({ image: e.target?.result })
        }
        reader.readAsDataURL(info.file.originFileObj)
      } else {
        setImageUrl(info.file.url || info.file.preview)
        form.setFieldsValue({ image: info.file.url || info.file.preview })
      }
      setIsImageLoading(false)
    }
  }

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.match(/^https?:\/\/.+/)) {
      setImageUrl(pastedText)
      form.setFieldsValue({ image: pastedText })
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess?.('ok')
      }, 0)
    },
    onChange: handleImageChange,
    accept: 'image/*'
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await fetchFoods(1, pageSize)
      setCurrentPage(1)
      message.success(translations.messages.success.refresh)
    } catch (error) {
      message.error(translations.messages.error.refresh)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const filteredFoods = foods.filter(food => {
    return food.name.toLowerCase().includes(searchText.toLowerCase()) ||
      food.description.toLowerCase().includes(searchText.toLowerCase())
  })

  const handleBulkDiscount = async () => {
    try {
      const values = await discountForm.validateFields()
      const payload = {
        isDiscount: values.isDiscount,
        discount: values.isDiscount ? values.discountPercent : 0,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined
      }

      await axios.patch(`${API_URL}/admin/foods/update-all-discounts`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      message.success(translations.messages.success.discountApplied)
      fetchFoods()
      setIsDiscountModalVisible(false)
      discountForm.resetFields()
    } catch (error) {
      message.error(translations.messages.error.applyDiscount)
    }
  }
  const handleCancelAllDiscounts = async () => {
    try {
      const payload = {
        isDiscount: false,
        discount: 0,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined
      }

      await axios.patch(`${API_URL}/admin/foods/update-all-discounts`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      message.success(translations.messages.success.discountCanceled)
      fetchFoods()
      setIsDiscountModalVisible(false)
      discountForm.resetFields()
    } catch (error) {
      message.error(translations.messages.error.applyDiscount)
    }
  }

  const handleSingleDiscount = async (values: any) => {
    try {
      if (!selectedFood) return

      await axios.patch(`${API_URL}/admin/foods/${selectedFood._id}/update-discount`, {
        isDiscount: values.isDiscount,
        discount: values.isDiscount ? values.discountPercent : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      message.success(translations.messages.success.discountUpdated)
      fetchFoods()
      setSingleDiscountModalVisible(false)
      singleDiscountForm.resetFields()
      setSelectedFood(null)
    } catch (error) {
      message.error(translations.messages.error.updateDiscount)
    }
  }

  const openSingleDiscountModal = (food: Food) => {
    setSelectedFood(food)
    singleDiscountForm.setFieldsValue({
      isDiscount: food.isDiscount || false,
      discountPercent: food.discount || 0
    })
    setSingleDiscountModalVisible(true)
  }


  const columns = [
    {
      title: translations.table.columns.food,
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Food) => (
        <div className={`flex items-center space-x-3 ${!record.isAvailable ? 'opacity-75' : ''}`}>
          <img
            src={record.image}
            alt={record.name}
            className={`w-12 h-12 rounded-lg object-cover ${!record.isAvailable ? 'grayscale' : ''}`}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'
            }}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
            <div className="text-xs text-gray-400">
              {record.ingredients?.join(', ')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: translations.table.columns.category,
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string, record: Food) => (
        <Tag color={record.isAvailable ? 'blue' : 'default'}>{text}</Tag>
      ),
    },
    {
      title: translations.table.columns.price,
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Food) => (
        <div className={!record.isAvailable ? 'text-gray-500' : ''}>
          {record.isDiscount && record.discount && record.discountPrice ? (
            <div>
              <span className="line-through text-gray-400">${price.toFixed(2)}</span>
              <span className="ml-2 text-red-500">-{record.discount}%</span>
              <div className="font-medium text-green-600">${record.discountPrice.toFixed(2)}</div>
            </div>
          ) : (
            <span className="text-green-600 font-medium">${price.toFixed(2)}</span>
          )}
        </div>
      ),
      sorter: (a: Food, b: Food) => a.price - b.price,
    },
    {
      title: translations.table.columns.status,
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'success' : 'error'}>
          {isAvailable ? translations.table.status.available : translations.table.status.unavailable}
        </Tag>
      ),
    },
    {
      title: translations.table.columns.actions,
      key: 'actions',
      render: (_: any, record: Food) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="bg-blue-500"
          >
            {translations.table.actions.edit}
          </Button>
          <Button
            type="primary"
            icon={<PercentageOutlined />}
            onClick={() => openSingleDiscountModal(record)}
            className="bg-orange-500"
          >
            {translations.table.actions.discount}
          </Button>
          <Switch
            checked={record.isAvailable}
            onChange={() => toggleAvailability(record._id)}
            checkedChildren={translations.table.status.available}
            unCheckedChildren={translations.table.status.unavailable}
            className={record.isAvailable ? 'bg-green-500' : 'bg-red-500'}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            {translations.table.actions.delete}
          </Button>
        </Space>
      ),
    },
  ]

  const stats = [
    { title: translations.stats.totalFoods, value: totalFoods, color: 'blue' },
    { title: translations.stats.availableFoods, value: availableFoods, color: 'green' },
    { title: translations.stats.unavailableFoods, value: unavailableFoods, color: 'red' },
    { title: translations.stats.totalCategories, value: categories.length, color: 'purple' }
  ]

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  const handleModalClose = () => {
    setModalVisible(false)
    form.resetFields()
    setEditingFood(null)
    setImageUrl('')
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
            <Input
              placeholder={translations.filters.searchPlaceholder}
              value={searchText}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              className="max-w-xs"
            />
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="min-w-[200px]"
            >
              <Select.Option value="all">{translations.filters.allCategories}</Select.Option>
              {categories.map(category => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Space>
            <Button
              type="default"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              {translations.buttons.refresh}
            </Button>
            <Button
              type="primary"
              danger
              icon={<PercentageOutlined />}
              onClick={handleCancelAllDiscounts}
            >
              {translations.buttons.cancelAllDiscounts}
            </Button>
            <Button
              type="primary"
              icon={<PercentageOutlined />}
              onClick={() => setIsDiscountModalVisible(true)}
              className="bg-orange-500"
            >
              {translations.buttons.applyBulkDiscount}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingFood(null)
                form.resetFields()
                setModalVisible(true)
              }}
              className="bg-blue-500"
            >
              {translations.buttons.addNewFood}
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredFoods}
          rowKey="_id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalFoods,
            showSizeChanger: true,
            showTotal: (total) => translations.table.pagination.total.replace('{total}', total.toString()),
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          rowClassName={(record) => !record.isAvailable ? 'bg-gray-50' : ''}
        />
      </div>

      <Modal
        title={editingFood ? translations.modal.editTitle : translations.modal.addTitle}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isAvailable: true
          }}
        >
          <Form.Item
            name="name"
            label={translations.modal.form.name.label}
            rules={[{ required: true, message: translations.modal.form.name.required }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={translations.modal.form.description.label}
            rules={[{ required: true, message: translations.modal.form.description.required }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="price"
            label={translations.modal.form.price.label}
            rules={[{ required: true, message: translations.modal.form.price.required }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={translations.modal.form.category.label}
            rules={[{ required: true, message: translations.modal.form.category.required }]}
          >
            <Select>
              {categories.map(category => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label={translations.modal.form.image.label}
            rules={[{ required: true, message: translations.modal.form.image.required }]}
          >
            <div className="space-y-4">
              <Input
                placeholder={translations.modal.form.image.placeholder}
                onPaste={handleUrlPaste}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  form.setFieldsValue({ image: e.target.value })
                }}
              />

              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  {translations.modal.form.image.dragText}
                </p>
              </Upload.Dragger>

              {imageUrl && (
                <div className="mt-4">
                  <img
                    src={imageUrl}
                    alt="Food preview"
                    className="max-w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image'
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="isAvailable"
            valuePropName="checked"
          >
            <Switch
              checkedChildren={translations.modal.form.status.available}
              unCheckedChildren={translations.modal.form.status.unavailable}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleModalClose}>
                {translations.modal.form.buttons.cancel}
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500">
                {editingFood ? translations.modal.form.buttons.update : translations.modal.form.buttons.save}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={translations.modal.discountTitle}
        open={isDiscountModalVisible}
        onCancel={() => {
          setIsDiscountModalVisible(false)
          discountForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={discountForm}
          layout="vertical"
          onFinish={handleBulkDiscount}
          initialValues={{
            isDiscount: false,
            discountPercent: 0
          }}
        >
          <Form.Item
            name="isDiscount"
            valuePropName="checked"
            label={translations.modal.form.discount.label}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.isDiscount !== currentValues.isDiscount}
          >
            {({ getFieldValue }) =>
              getFieldValue('isDiscount') ? (
                <Form.Item
                  name="discountPercent"
                  label={translations.modal.form.discount.percentageLabel}
                  rules={[
                    { required: true, message: translations.modal.form.discount.percentageRequired },
                    { type: 'number', min: 0, max: 100, message: translations.modal.form.discount.percentageRange }
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => Number(value!.replace('%', '')) as 0 | 100}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <div className="text-gray-500 mb-4 text-sm">
            {selectedCategory !== 'all' ?
              translations.modal.form.discount.note.category :
              translations.modal.form.discount.note.all}
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setIsDiscountModalVisible(false)
                discountForm.resetFields()
              }}>
                {translations.modal.form.buttons.cancel}
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500">
                {translations.modal.form.buttons.applyDiscount}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Single Product Discount Modal */}
      <Modal
        title={`${translations.modal.singleDiscountTitle} - ${selectedFood?.name || ''}`}
        open={singleDiscountModalVisible}
        onCancel={() => {
          setSingleDiscountModalVisible(false)
          singleDiscountForm.resetFields()
          setSelectedFood(null)
        }}
        footer={null}
      >
        <Form
          form={singleDiscountForm}
          layout="vertical"
          onFinish={handleSingleDiscount}
          initialValues={{
            isDiscount: false,
            discountPercent: 0
          }}
        >
          <Form.Item
            name="isDiscount"
            valuePropName="checked"
            label={translations.modal.form.discount.label}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.isDiscount !== currentValues.isDiscount}
          >
            {({ getFieldValue }) =>
              getFieldValue('isDiscount') ? (
                <Form.Item
                  name="discountPercent"
                  label={translations.modal.form.discount.percentageLabel}
                  rules={[
                    { required: true, message: translations.modal.form.discount.percentageRequired },
                    { type: 'number', min: 0, max: 100, message: translations.modal.form.discount.percentageRange }
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => Number(value!.replace('%', '')) as 0 | 100}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {selectedFood && selectedFood.isDiscount && selectedFood.discount && selectedFood.discountPrice && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">{translations.modal.form.discount.currentDiscount}:</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="line-through text-gray-400">${selectedFood.price.toFixed(2)}</span>
                <span className="text-red-500">-{selectedFood.discount}%</span>
                <span className="font-medium text-green-600">${selectedFood.discountPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setSingleDiscountModalVisible(false)
                singleDiscountForm.resetFields()
                setSelectedFood(null)
              }}>
                {translations.modal.form.buttons.cancel}
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-500">
                {translations.modal.form.buttons.applyDiscount}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 