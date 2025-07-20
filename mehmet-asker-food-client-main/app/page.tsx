'use client'
import { useEffect } from 'react'
import Header from './components/Header'
import { Footer } from './components/Footer'
import { useRouter } from 'next/navigation'
import Categories from './components/Categories'
import HeroSection from './components/HeroSection'
import WhyChooseUs from './components/WhyChooseUs'
import { RootState, AppDispatch } from '../lib/store'
import { useDispatch, useSelector } from 'react-redux'
import { Testimonials } from './components/Testimoials'
import { getUserProfile } from '../lib/slices/authSlice'
import FeaturedProduct from './components/FeaturedProduct'
import adminTranslations from './lib/translations/admin/adminPage.json'
import { fetchCategories, fetchFoods, fetchPopularFoods } from '../lib/slices/foodSlice'

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { categories, foods, selectedCategory } = useSelector((state: RootState) => state.food)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchFoods())
    dispatch(fetchPopularFoods())
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token && !user) {
        dispatch(getUserProfile())
      }
    }
  }, [dispatch, user])

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchFoods(selectedCategory))
    } else {
      dispatch(fetchFoods())
    }
  }, [selectedCategory, dispatch])

  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin')
    }
  }, [user, router])

  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{adminTranslations.routingToAdminPanel}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden ">
      <Header />
      <HeroSection />
      <Categories categories={categories} />
      <FeaturedProduct foods={foods} />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  )
}
