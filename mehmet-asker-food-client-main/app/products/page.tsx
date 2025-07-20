'use client'
import axios from 'axios'
import Image from 'next/image'
import Header from '../components/Header'
import { Footer } from '../components/Footer'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../lib/slices/cartSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState, AppDispatch } from '../../lib/store'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import productsTranslations from '../lib/translations/customer/productsPage.json'

interface Category {
    _id: string
    name: string
    image: string
    description?: string
    foodCount?: number
}

interface Food {
    _id: string
    name: string
    description: string
    price: number
    oldPrice?: number
    image: string
    category: {
        _id: string
        name: string
    }
    rating: number
    preparationTime: number
    isAvailable: boolean
    isDiscount?: boolean
    discount?: number
    discountPrice?: number
}

const MenuPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)
    const [categories, setCategories] = useState<Category[]>([])
    const [foods, setFoods] = useState<Food[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 12
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        fetchCategories()
        fetchFoods()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
        fetchFoods()
    }, [selectedCategory])

    useEffect(() => {
        fetchFoods()
    }, [currentPage])

    const fetchCategories = async () => {
        try {
            const axiosInstance = axios.create({
                baseURL: API_URL,
            });

            // İstekleri bu instance üzerinden yapın
            const response = await axiosInstance.get('/categories');
            // const response = await axios.get(`${API_URL}/categories`)
            if (response.data.categories) {
                setCategories(response.data.categories)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            setError(productsTranslations.error.fetchCategories)
        }
    }

    const fetchFoods = async () => {
        try {
            setLoading(true)
            const url = new URL(`${API_URL}/foods`)

            url.searchParams.append('page', currentPage.toString())
            url.searchParams.append('limit', itemsPerPage.toString())
            if (selectedCategory) {
                url.searchParams.append('category', selectedCategory)
            }

            const response = await axios.get(url.toString())
            if (response.data.foods) {
                const { foods, totalPages: pages, totalItems: items } = response.data;
                setFoods(foods || []);

                const total = items || foods.length;
                const calculatedTotalPages = pages || Math.ceil(total / itemsPerPage);

                setTotalItems(total);
                setTotalPages(calculatedTotalPages);

                if (currentPage > calculatedTotalPages) {
                    setCurrentPage(calculatedTotalPages || 1);
                }
            }
        } catch (error) {
            setError(productsTranslations.error.fetchFoods)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = (food: Food) => {
        if (!isAuthenticated) {
            alert(productsTranslations.error.loginRequired)
            return
        }

        dispatch(addToCart({
            id: food._id,
            name: food.name,
            isDiscount: food.isDiscount,
            discount: food.discount,
            discountPrice: food.discountPrice,
            price: food.price,
            image: food.image
        }))
    }

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(searchQuery.toLowerCase())
    )



    const calculatePageRange = () => {
        const start = ((currentPage - 1) * itemsPerPage) + 1;
        const end = start + Math.min(currentPage * itemsPerPage, totalItems);
        return { start, end };
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <h3 className="text-xl font-semibold mb-2">{productsTranslations.error.title}</h3>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header />
            <div className="bg-gray-50 min-w-screen">


                <div className="container mx-auto px-4 py-8 mt-14 md:mt-14">
                    <div className="mb-8">
                        <div className="max-w-2xl ">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={productsTranslations.search.placeholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory(null)}
                                className={`p-4 rounded-xl ${!selectedCategory ? 'bg-orange-500 text-white' : 'bg-white hover:bg-orange-50'} shadow-sm transition-all duration-200`}
                            >
                                <span className={`${!selectedCategory ? 'text-white' : 'text-gray-700'}`}>{productsTranslations.categories.all}</span>
                            </motion.button>
                            {categories.map((category) => (
                                <motion.button
                                    key={category._id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(category._id)}
                                    className={`p-4 rounded-xl ${selectedCategory === category._id ? 'bg-orange-500 text-white' : 'bg-white hover:bg-orange-50'} shadow-sm transition-all duration-200`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <span className={`text-sm font-medium ${selectedCategory === category._id ? 'text-white' : 'text-gray-700'}`}>{category.name}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence>
                            {loading ? (
                                <div className="col-span-full flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            ) : filteredFoods.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500">{productsTranslations.noResults}</p>
                                </div>
                            ) : (
                                <>
                                    {filteredFoods.map((food) => (
                                        <motion.div
                                            key={food._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                                        >
                                            <div className="relative">
                                                <div className="absolute top-2 right-2 z-10">
                                                    <span className={`px-3 py-1 text-xs font-medium text-white ${food.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}>
                                                        {food.isAvailable ? productsTranslations.foodCard.available : productsTranslations.foodCard.notAvailable}
                                                    </span>
                                                </div>
                                                <div className="h-48 w-full">
                                                    <Image
                                                        src={food.image}
                                                        alt={food.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                {food.oldPrice && (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                                                        {productsTranslations.foodCard.sale}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-lg">{food.name}</h3>
                                                    <span className="text-sm text-gray-500">{food.category.name}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-5 line-clamp-2">{food.description}</p>


                                                <div className="flex items-center mt-6 justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {food.isDiscount ? (
                                                            <>
                                                                <span className="text-sm text-gray-400 line-through">
                                                                    ${food.price.toFixed(2)}
                                                                </span>
                                                                <span className="text-red-500 text-sm">
                                                                    -{food.discount}%
                                                                </span>
                                                                <span className="text-md font-bold text-orange-500">
                                                                    ${food.discountPrice?.toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-md font-bold text-orange-500">
                                                                ${food.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleAddToCart(food)}
                                                        disabled={!food.isAvailable}
                                                        className={`px-4 py-2 rounded-lg ${food.isAvailable
                                                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <span className="text-white">
                                                            {food.isAvailable ? productsTranslations.foodCard.addToCart : productsTranslations.foodCard.notAvailable}
                                                        </span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {!loading && filteredFoods.length > 0 && (
                        <div className="flex flex-col items-center py-12 mt-8">
                            <div className="text-sm text-gray-600 mb-8">
                                {productsTranslations.pagination.showing} <span className="font-semibold text-orange-600">
                                    {totalItems > 0 ? (() => {
                                        const { start, end } = calculatePageRange();
                                        return `${start} - ${end}`;
                                    })() : '0'}
                                </span>{' '}
                                {productsTranslations.pagination.of} <span className="font-semibold text-orange-600">{totalItems}</span> {productsTranslations.pagination.results}
                            </div>

                            <nav className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex items-center justify-between w-full max-w-4xl">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 mr-4 pr-4 ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white shadow-md'
                                            }`}
                                    >
                                        <svg className="w-5 h-5 hover:text-white" fill="hover:text-white" stroke="currentColor hover:text-white" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span className="hidden sm:inline hover:text-white">{productsTranslations.pagination.previous}</span>
                                    </button>

                                    <div className="flex items-center gap-2 mx-4">
                                        {currentPage > 2 && (
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-orange-50 text-gray-600 flex items-center justify-center transition-all duration-200"
                                            >
                                                1
                                            </button>
                                        )}

                                        {currentPage > 3 && (
                                            <span className="text-gray-400">...</span>
                                        )}

                                        {currentPage > 1 && (
                                            <button
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-orange-50 text-gray-600 flex items-center justify-center transition-all duration-200"
                                            >
                                                {currentPage - 1}
                                            </button>
                                        )}

                                        <button
                                            className="w-10 h-10 rounded-xl bg-orange-500 text-white font-medium flex items-center justify-center transform scale-110 shadow-orange-200 shadow-lg"
                                        >
                                            <span className="text-white">{currentPage}</span>
                                        </button>

                                        {currentPage < totalPages && (
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-orange-50 text-gray-600 flex items-center justify-center transition-all duration-200"
                                            >
                                                {currentPage + 1}
                                            </button>
                                        )}

                                        {currentPage < totalPages - 2 && (
                                            <span className="text-gray-400">...</span>
                                        )}

                                        {currentPage < totalPages - 1 && (
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-orange-50 text-gray-600 flex items-center justify-center transition-all duration-200"
                                            >
                                                {totalPages}
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white shadow-md'
                                            }`}
                                    >
                                        <span className="hidden sm:inline hover:text-white">{productsTranslations.pagination.next}</span>
                                        <svg className="w-5 h-5 hover:text-white" fill="hover:text-white" stroke="currentColor hover:text-white" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MenuPage