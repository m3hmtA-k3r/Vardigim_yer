"use client"
import React from 'react'
import Image from 'next/image'
import { addToCart } from '../../lib/slices/cartSlice'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../lib/store'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import translations from '../lib/translations/customer/featuredProduct.json'

interface FeaturedProductProps {
    foods: any[]
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

const FeaturedProduct = ({ foods }: FeaturedProductProps) => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const handleAddToCart = (food: any) => {
        if (!isAuthenticated) {
            alert(translations.alert.login)
            return
        }

        dispatch(addToCart({
            id: food._id,
            name: food.name,
            price: food.price,
            image: food.image
        }))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-16 overflow-x-hidden"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations.featuredProduct.title}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {translations.featuredProduct.description}
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {foods.slice(0, 6).map((food) => (
                    <motion.div
                        variants={item}
                        key={food._id}
                        whileHover={{
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 300 }
                        }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                    >
                        <div className="p-6">
                            <div className="relative mb-4">
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring" }}
                                    className="absolute right-2 top-2 z-10"
                                >
                                    <span className={`px-3 py-1 text-xs font-medium text-white ${food.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}>
                                        {food.isAvailable ? 'Available' : 'Not Available'}
                                    </span>
                                </motion.div>
                                <div className="flex justify-center">
                                    <motion.div
                                        className="relative w-full h-48"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Image
                                            src={food.image}
                                            alt={food.name}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-semibold text-gray-900 mb-2"
                            >
                                {food.name}
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 text-sm mb-4"
                            >
                                {food.description}
                            </motion.p>

                         

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center justify-end"
                            >
                             
                                <div className="flex items-center gap-2">
                                    {food.oldPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            $ {food.oldPrice.toFixed(2)}
                                        </span>
                                    )}
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                                        className="text-lg font-bold text-orange-500"
                                    >
                                        $ {food.price.toFixed(2)}
                                    </motion.span>
                                </div>
                            </motion.div>

                            <div className="flex justify-between">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAddToCart(food)}
                                    disabled={!food.isAvailable}
                                    className={`py-2 px-4 rounded-lg font-medium ${food.isAvailable
                                        ? 'cursor-pointer'
                                        : 'text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {food.isAvailable ? '🛒' : translations.featuredProduct.notAvailable}
                                </motion.button>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-sm text-gray-500 text-right mt-2"
                                >
                                    {food.category.name}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
      
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="text-center mt-10"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    onClick={() => router.push('/products')}
                >
                    <span className="text-white">{translations.footer.viewAllProducts}</span>
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

export default FeaturedProduct