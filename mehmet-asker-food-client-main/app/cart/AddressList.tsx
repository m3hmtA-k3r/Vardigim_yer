'use client'
import { useState, useEffect } from 'react'
import { useAppSelector } from '../../lib/store'
import translations from '../lib/translations/customer/adress.json'

interface Address {
  _id: string
  title: string
  street: string
  city: string
  district: string
  postalCode?: string
  phone: string
  isDefault?: boolean
}

interface AddressListProps {
  onSelect?: (address: Address) => void
  selectedId?: string
  showActions?: boolean
}

export default function AddressList({ onSelect, selectedId, showActions = false }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAddress, setNewAddress] = useState({
    title: '',
    street: '',
    city: '',
    district: '',
    postalCode: '',
    phone: '',
    isDefault: false
  })
  const { isAuthenticated } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated])

  const fetchAddresses = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Adresler yüklenemedi')
      }

      const data = await response.json()
      setAddresses(data.addresses)
    } catch (error) {
      setError(translations.failedLoadingAdress)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddress)
      })

      if (!response.ok) {
        throw new Error(translations.failedAddingAdress)
      }

      await fetchAddresses()
      setIsModalOpen(false)
      setNewAddress({
        title: '',
        street: '',
        city: '',
        district: '',
        postalCode: '',
        phone: '',
        isDefault: false
      })
    } catch (error) {
      alert(translations.failedAddingAdress)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error(translations.failedToChangeDefaultAddress)
      }

      await fetchAddresses()
    } catch (error) {
      alert(translations.failedToChangeDefaultAddress)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!window.confirm(translations.areYouSureToDeleteAddress)) {
      return
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(translations.failedToDeleteAddress)
      }

      await fetchAddresses()
    } catch (error) {
      alert(translations.failedToDeleteAddress)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">{translations.loading}</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{translations.myAddresses}</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EA580C] hover:bg-[#EA580C]/90 focus:outline-none"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="white" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className='text-white'>{translations.addNewAddress}</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{translations.noAddresses}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-6 rounded-xl border transition-all duration-200 ${selectedId === address._id
                ? 'border-[#EA580C] bg-[#EA580C]/5 shadow-md'
                : 'border-gray-200 hover:border-[#EA580C]/30 hover:bg-gray-50'
                } ${onSelect ? 'cursor-pointer' : ''}`}
              onClick={() => onSelect?.(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#EA580C]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#EA580C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{address.title}</p>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {translations.default}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                      <p className="text-sm text-gray-600">{address.district}, {address.city}</p>
                      <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetDefault(address._id)
                      }}
                      disabled={address.isDefault}
                      className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        text-[#EA580C] hover:bg-[#EA580C]/10"
                    >
                      {translations.setAsDefault}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(address._id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Adding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">{translations.addNewAddress}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.addressTitle}
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Home, Work, etc."
                  value={newAddress.title}
                  onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                  className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                  required
                />
              </div>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.streetAddress}
                </label>
                <input
                  type="text"
                  id="street"
                  placeholder="Enter your street address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.district}
                  </label>
                  <input
                    type="text"
                    id="district"
                    placeholder="Enter district"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.city}
                  </label>
                  <input
                    type="text"
                    id="city"
                    placeholder="Enter city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.postalCode}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    placeholder="Enter postal code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {translations.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter phone number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-[#EA580C] focus:ring-[#EA580C] text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="h-4 w-4 text-[#EA580C] focus:ring-[#EA580C] border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  {translations.setAsDefault}
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none min-w-[120px]"
                >
                  {translations.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#EA580C] hover:bg-[#EA580C]/90 focus:outline-none min-w-[120px]"
                >
                  <span className="text-white">{translations.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 