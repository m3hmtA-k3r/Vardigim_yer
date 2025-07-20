'use client'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../lib/store'
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setSelectedCategory,
  clearSelectedCategory,
  clearError
} from '../../../lib/slices/adminCategorySlice'
import { Table, Button, Input, Modal, Form, Tag, Space, Card, Statistic, Upload, Switch, App } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import axios from 'axios'
import { message } from 'antd'
import translations from '../../lib/translations/admin/categoryManagement.json'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Category {
  _id: string
  name: string
  description: string
  image: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoryManagement() {
  const dispatch = useAppDispatch()
  const { categories, isLoading, error, selectedCategory } = useAppSelector(state => state.adminCategory)

  const [messageApi, contextHolder] = message.useMessage();

  const [modalVisible, setModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  useEffect(() => {
    dispatch(fetchAdminCategories())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        image: values.image,
        isActive: values.isActive !== undefined ? values.isActive : true
      }

      if (selectedCategory) {
        await dispatch(updateCategory({ id: selectedCategory._id, data: submitData })).unwrap()
        messageApi.success(translations.messages.success.updated)
      } else {
        await dispatch(createCategory(submitData)).unwrap()
        messageApi.success(translations.messages.success.created)
      }

      setModalVisible(false)
      form.resetFields()
      setImageUrl('')
      dispatch(clearSelectedCategory())
    } catch (error) {
      console.error('Error saving category:', error)
      messageApi.error(translations.messages.error.create)
    }
  }

  const handleEdit = (category: Category) => {
    dispatch(setSelectedCategory(category))
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive
    })
    setImageUrl(category.image)
    setModalVisible(true)
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        messageApi.error('Oturum bulunamadı')
        return
      }

      const response = await axios.get(`${API_URL}/admin/foods`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const categoryFoods = response.data.foods.filter((food: any) =>
        food.category && food.category._id === categoryId
      )

      if (categoryFoods.length > 0) {
        await Promise.all(categoryFoods.map(async (food: any) => {
          try {
            const response = await axios.patch(
              `${API_URL}/admin/foods/${food._id}/toggle-availability`,
              { isAvailable: false },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          } catch (error) {
          }
        }))
      }

      await dispatch(deleteCategory(categoryId)).unwrap()
      messageApi.success('Kategori ve ilgili yemekler başarıyla silindi')

    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'Kategori silme işlemi sırasında bir hata oluştu')
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        messageApi.error(translations.messages.error.session)
        return
      }

    } catch (error) {
      messageApi.error(translations.messages.error.statusUpdate)
    }
  }

  const toggleStatus = async (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    if (!category) return

    try {
      const updateData = {
        name: category.name,
        description: category.description,
        image: category.image,
        isActive: !category.isActive
      }

     await dispatch(updateCategory({ id: categoryId, data: updateData })).unwrap()

      messageApi.success(translations.messages.success.statusUpdated)
    } catch (error) {
      messageApi.error(translations.messages.error.statusUpdate)
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

  const showDeleteConfirm = (record: Category) => {
    setCategoryToDelete(record)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      await handleDelete(categoryToDelete._id)
      setDeleteModalVisible(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Silme işlemi sırasında hata:', error)
    }
  }

  const columns = [
    {
      title: translations.table.columns.category,
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Category) => (
        <div className={`flex items-center space-x-3 ${!record.isActive ? 'opacity-75' : ''}`}>
          <img
            src={record.image}
            alt={record.name}
            className={`w-12 h-12 rounded-lg object-cover ${!record.isActive ? 'grayscale' : ''}`}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'
            }}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
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
      title: translations.table.columns.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
      sorter: (a: Category, b: Category) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="bg-blue-500"
          >
            {translations.table.actions.edit}
          </Button>
          <Switch
            checked={record.isActive}
            onChange={() => toggleStatus(record._id)}
            checkedChildren={translations.modal.form.status.active}
            unCheckedChildren={translations.modal.form.status.inactive}
            className={record.isActive ? 'bg-green-500' : 'bg-red-500'}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          >
            {translations.table.actions.delete}
          </Button>
        </Space>
      ),
    },
  ]

  const stats = [
    { title: translations.stats.totalCategories, value: categories.length, color: 'blue' },
    { title: translations.stats.activeCategories, value: categories.filter(c => c.isActive).length, color: 'green' },
    { title: translations.stats.inactiveCategories, value: categories.filter(c => !c.isActive).length, color: 'red' },
    { title: translations.stats.lastUpdate, value: new Date().toLocaleDateString('tr-TR'), color: 'purple' }
  ]

  return (
    <App>
      <div>
        {contextHolder}
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
                placeholder={translations.search.placeholder}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                className="max-w-xs"
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                dispatch(clearSelectedCategory())
                form.resetFields()
                setImageUrl('')
                setModalVisible(true)
              }}
              className="bg-blue-500"
            >
              {translations.buttons.addNew}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={localCategories.filter(category =>
              category.name.toLowerCase().includes(searchText.toLowerCase()) ||
              category.description.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              total: localCategories.filter(category =>
                category.name.toLowerCase().includes(searchText.toLowerCase()) ||
                category.description.toLowerCase().includes(searchText.toLowerCase())
              ).length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => translations.table.pagination.total.replace('{total}', total.toString())
            }}
            rowClassName={(record) => !record.isActive ? 'bg-gray-50' : ''}
          />
        </div>

        <Modal
          title={selectedCategory ? translations.modal.edit.title : translations.modal.add.title}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
            dispatch(clearSelectedCategory())
            setImageUrl('')
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true
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
                      alt="Category preview"
                      className="max-w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="isActive"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={translations.modal.form.status.active}
                unCheckedChildren={translations.modal.form.status.inactive}
              />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => {
                  setModalVisible(false)
                  form.resetFields()
                  dispatch(clearSelectedCategory())
                  setImageUrl('')
                }}>
                  {translations.modal.form.buttons.cancel}
                </Button>
                <Button type="primary" htmlType="submit" className="bg-blue-500">
                  {selectedCategory ? translations.modal.form.buttons.update : translations.modal.form.buttons.save}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={translations.deleteModal.title}
          open={deleteModalVisible}
          onCancel={() => {
            setDeleteModalVisible(false)
            setCategoryToDelete(null)
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setDeleteModalVisible(false)
                setCategoryToDelete(null)
              }}
            >
              {translations.deleteModal.buttons.cancel}
            </Button>,
            <Button
              key="delete"
              danger
              type="primary"
              onClick={handleDeleteConfirm}
            >
              {translations.deleteModal.buttons.confirm}
            </Button>
          ]}
        >
          <div>
            <p>{translations.deleteModal.description}</p>
            {categoryToDelete && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={categoryToDelete.image}
                    alt={categoryToDelete.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image'
                    }}
                  />
                  <div>
                    <div className="font-medium">{categoryToDelete.name}</div>
                    <div className="text-sm text-gray-500">{categoryToDelete.description}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4">
              <p className="text-red-500 font-medium">{translations.deleteModal.warning}</p>
              <p>{translations.deleteModal.warningText}</p>
            </div>
          </div>
        </Modal>
      </div>
    </App>
  )
} 