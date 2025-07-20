'use client'

import { Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { useState, useEffect } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import translations from '../../lib/translations/admin/foodForm.json'

const { Dragger } = Upload

interface FoodFormProps {
  initialData?: any
  onSubmit: (formData: FormData) => Promise<void>
  categories: any[]
}

export default function FoodForm({ initialData, onSubmit, categories }: FoodFormProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: [''],
    preparationTime: '',
    image: '',
    isAvailable: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        category: initialData.category?._id || initialData.category || '',
        ingredients: initialData.ingredients?.length ? initialData.ingredients : [''],
        preparationTime: initialData.preparationTime?.toString() || '',
        image: initialData.image || '',
        isAvailable: initialData.isAvailable ?? true
      })
      if (initialData.image) {
        setPreviewUrl(initialData.image)
      }
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...form.ingredients]
    newIngredients[index] = value
    setForm(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredient = (index: number) => {
    if (form.ingredients.length > 1) {
      const newIngredients = form.ingredients.filter((_, i) => i !== index)
      setForm(prev => ({
        ...prev,
        ingredients: newIngredients
      }))
    }
  }

  const handleImageUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error(translations.messages.imageOnly)
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error(translations.messages.imageSizeLimit)
      return false
    }

    try {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      return false
    } catch (error) {
      console.error('Image upload error:', error)
      message.error(translations.messages.uploadError)
      return false
    }
  }

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: false,
    maxCount: 1,
    accept: 'image/*',
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      if (file instanceof File) {
        handleImageUpload(file).then(() => {
          onSuccess?.('ok')
        })
      }
    },
    beforeUpload: (file) => handleImageUpload(file),
    onDrop: (e) => {
      const file = e.dataTransfer.files[0]
      if (file) {
        handleImageUpload(file)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      formData.append('category', form.category)
      formData.append('preparationTime', form.preparationTime)
      formData.append('isAvailable', form.isAvailable.toString())
      formData.append('ingredients', JSON.stringify(form.ingredients.filter(ing => ing.trim())))

      if (imageFile) {
        const compressedImage = await compressImage(imageFile)
        formData.append('image', compressedImage)
      } else if (form.image) {
        formData.append('image', form.image)
      }

      await onSubmit(formData)
      message.success(translations.messages.saveSuccess)
    } catch (error) {
      message.error(translations.messages.saveError)
    } finally {
      setIsLoading(false)
    }
  }

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Could not compress image'))
              }
            },
            'image/jpeg',
            0.7
          )
        }
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.form.foodName.label}
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={translations.form.foodName.placeholder}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.form.category.label}
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">{translations.form.category.placeholder}</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.form.price.label}
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={translations.form.price.placeholder}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {translations.form.preparationTime.label}
          </label>
          <input
            type="number"
            name="preparationTime"
            value={form.preparationTime}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={translations.form.preparationTime.placeholder}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.form.description.label}
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={translations.form.description.placeholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.form.ingredients.label}
        </label>
        <div className="space-y-2">
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={translations.form.ingredients.placeholder}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
                disabled={form.ingredients.length === 1}
              >
                {translations.form.ingredients.removeButton}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-blue-600 hover:text-blue-700"
          >
            {translations.form.ingredients.addButton}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translations.form.image.label}
        </label>
        <Dragger {...uploadProps} className="bg-white">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {translations.form.image.dragText}
          </p>
          <p className="ant-upload-hint">
            {translations.form.image.hint}
          </p>
        </Dragger>
        {previewUrl && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          name="isAvailable"
          checked={form.isAvailable}
          onChange={(e) => setForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
          {translations.form.availability.label}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? translations.buttons.saving : translations.buttons.save}
        </button>
      </div>
    </form>
  )
} 