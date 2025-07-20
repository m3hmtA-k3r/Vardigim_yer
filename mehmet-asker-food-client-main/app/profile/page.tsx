'use client'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressList from '../cart/AddressList'
import ProfileInfo from '../components/ProfileInfo'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../lib/store'
import { getUserProfile } from '../../lib/slices/authSlice'
import profileTranslations from '../lib/translations/customer/profilePage.json'

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token && !user) {
        dispatch(getUserProfile())
      } else if (!token) {
        router.push('/')
      }
    }
  }, [dispatch, user, router])

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EA580C]"></div>
      </div>
    )
  }

  if (isMounted && !isAuthenticated) {
    router.push('/')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{profileTranslations.redirect}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container max-w-[80vw] mx-auto pt-14 md:pt-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{profileTranslations.title}</h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{profileTranslations.navigation.backToHome}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-100">
              <nav className="flex px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 font-medium text-sm relative ${activeTab === 'profile'
                    ? 'text-[#EA580C]'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                  {activeTab === 'profile' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C]"></span>
                  )}
                  {profileTranslations.tabs.personalInfo}
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`py-4 px-6 font-medium text-sm relative ${activeTab === 'addresses'
                    ? 'text-[#EA580C]'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                  {activeTab === 'addresses' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA580C]"></span>
                  )}
                  {profileTranslations.tabs.addresses}
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className={`transition-all duration-300 ${activeTab === 'profile' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <ProfileInfo user={user} />
              </div>
              <div className={`transition-all duration-300 ${activeTab === 'addresses' ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <AddressList showActions={true} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 