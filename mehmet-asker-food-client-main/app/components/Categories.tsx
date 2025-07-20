'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../lib/store'
import { setSelectedCategory } from '../../lib/slices/foodSlice'
import categoriesTranslations from '../lib/translations/customer/categories.json'

interface CategoriesProps {
    categories: any[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
}

export default function Categories({ categories }: CategoriesProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { selectedCategory } = useSelector((state: RootState) => state.food)

    const handleCategoryClick = (categoryId: string | null) => {
        dispatch(setSelectedCategory(categoryId))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-16 "
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{categoriesTranslations.title}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {categoriesTranslations.description}
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6"
            >
                {categories.map((category) => (
                    <motion.button
                        variants={item}
                        key={category._id}
                        onClick={() => handleCategoryClick(category._id)}
                        whileHover={{
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 300 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`group p-6 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col items-center space-y-4 ${selectedCategory === category._id ? 'ring-2 ring-orange-500' : ''}`}
                    >
                        <motion.div
                            className="text-4xl mb-2"
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            <Image src={category.image} alt={category.name} width={100} height={100} />
                        </motion.div>
                        <div className="text-center ">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                                {category.description || categoriesTranslations.defaultDescription}
                            </p>
                            <motion.span
                                className="text-xs text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {category.foodCount} items
                            </motion.span>
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    )
} 