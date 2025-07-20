'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../lib/store'
import { updateProfile } from '../../lib/slices/authSlice'
import translations from '../lib/translations/customer/profilePage.json'

interface ProfileInfoProps {
  user: any
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updateProfile(formData))
      setIsEditing(false)
    } catch (error) {
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{translations.profileInfo.title}</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EA580C] hover:bg-[#EA580C]/90 focus:outline-none transition-colors"
        >
          <span className="text-white">{isEditing ? translations.profileInfo.cancel : translations.profileInfo.editProfile}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {translations.profileInfo.fullName}
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {translations.profileInfo.email}
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {translations.profileInfo.phone}
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#EA580C] hover:bg-[#EA580C]/90 focus:outline-none min-w-[120px] transition-colors"
              >
                <span className="text-white">{translations.profileInfo.saveChanges}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-[#EA580C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-900">{user?.name}</h4>
              <p className="text-gray-500">{translations.profileInfo.memberSince} {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">{translations.profileInfo.email}</p>
              <p className="mt-1 text-base text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{translations.profileInfo.phone}</p>
              <p className="mt-1 text-base text-gray-900">{user?.phone || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 