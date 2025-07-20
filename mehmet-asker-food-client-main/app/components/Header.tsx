'use client'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../lib/store'
import { logout } from '../../lib/slices/authSlice'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import translations from '../lib/translations/common/header.json'

export default function Header() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { itemCount } = useSelector((state: RootState) => state.cart)
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  useEffect(() => {
    setIsClient(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
  }

  if (user?.role === 'admin') {
    return null
  }

  const menuItems = [
    { href: '/', label: translations.navigation.home },
    { href: '/products', label: translations.navigation.menu },
    { href: '/about', label: translations.navigation.about }
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-white'
        }`}
    >
      <div className="container max-w-[90vw] lg:max-w-[80vw] mx-auto">
        <nav className="flex items-center justify-between h-12 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="text-2xl"
            >
              🍕
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {translations.logo.text}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-neutral-600 hover:text-orange-500 transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart & User Menu */}
            {isClient && isAuthenticated ? (
              <div className="relative flex items-center space-x-4">
                {/* Cart Icon */}
                <Link href="/cart">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-full hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-2xl">🛒</span>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hidden md:flex items-center space-x-2 p-2 rounded-full hover:bg-orange-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.username ? user.username[0].toUpperCase() : ''}
                      </span>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden"
                      >
                        {[
                          { href: '/profile', icon: '👤', label: translations.userMenu.profile },
                          { href: '/orders', icon: '📦', label: translations.userMenu.orders },
                          ...(user?.role === 'admin' ? [{ href: '/admin', icon: '⚙️', label: translations.userMenu.adminPanel }] : [])
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-3 text-sm text-neutral-700 hover:bg-orange-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsUserMenuOpen(false)
                            router.push('/')
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
                        >
                          <span>🚪</span>
                          <span>{translations.auth.logout}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-neutral-600 hover:text-orange-500 transition-colors"
                >
                  {translations.auth.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg transition-all"
                >
                  {translations.auth.register}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-orange-500 transition-colors"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </motion.button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-[80%] h-full bg-white z-40 shadow-2xl overflow-y-auto"
          >
            {/* Mobile Menu Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex justify-between items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                <motion.div whileHover={{ rotate: 180 }} className="text-2xl">
                  🍕
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  FoodApp
                </span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100"
              >
                <span className="text-2xl">✕</span>
              </motion.button>
            </div>

            {/* User Profile Section (if authenticated) */}
            {isClient && isAuthenticated && (
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xl text-white font-medium">
                      {user?.username ? user.username[0].toUpperCase() : ''}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      {user?.username ? capitalizeFirstLetter(user.username) : ''}
                    </h3>
                    <p className="text-sm text-neutral-500">{user?.email}</p>
                  </div>
                </div>

                {/* Cart Summary */}
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-xl mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🛒</span>
                    <span className="font-medium text-neutral-900">{translations.userMenu.cart}</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-6 space-y-4">
              {menuItems.map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 p-3 rounded-xl text-neutral-700 hover:bg-orange-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* User Related Links (if authenticated) */}
              {isClient && isAuthenticated && (
                <>
                  <div className="h-px bg-neutral-100 my-4" />
                  {[
                    { href: '/profile', icon: '👤', label: translations.userMenu.profile },
                    { href: '/orders', icon: '📦', label: translations.userMenu.orders },
                    ...(user?.role === 'admin' ? [{ href: '/admin', icon: '⚙️', label: translations.userMenu.adminPanel }] : [])
                  ].map((item) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-xl text-neutral-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </>
              )}
            </nav>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-100 bg-white">
              {isClient && isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                    router.push('/')
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <span>🚪</span>
                  <span>{translations.auth.logout}</span>
                </button>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/auth/login"
                    className="w-full p-3 text-center text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translations.auth.login}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full p-3 text-center text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {translations.auth.register}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
    </motion.header>
  )
} 
