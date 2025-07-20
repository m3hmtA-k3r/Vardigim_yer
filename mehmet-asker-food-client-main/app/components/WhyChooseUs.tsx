import React from 'react'
import { motion } from 'framer-motion'
import translations from '../lib/translations/customer/whyChooseUs.json'

const features = [
    {
        icon: '🚚',
        title: translations.features.fastDelivery,
        description: translations.featuresDescription.fastDelivery
    },
    {
        icon: '⭐',
        title: translations.features.qualityIngredients,
        description: translations.featuresDescription.qualityIngredients
    },
    {
        icon: '👨‍🍳',
        title: translations.features.experiencedChefs,
        description: translations.featuresDescription.experiencedChefs
    },
    {
        icon: '💰',
        title: translations.features.affordablePrices,
        description: translations.featuresDescription.affordablePrices
    },
    {
        icon: '🔒',
        title: translations.features.securePayment,
        description: translations.featuresDescription.securePayment
    },
    {
        icon: '📞',
        title: translations.features.customerSupport,
        description: translations.featuresDescription.customerSupport
    }
]

const stats = [
    {
        value: translations.statsPoints.happyCustomers,
        label: translations.stats.happyCustomers
    },
    {
        value: translations.statsPoints.deliciousProducts,
        label: translations.stats.deliciousProducts
    },
    {
        value: translations.statsPoints.deliveredOrders,
        label: translations.stats.deliveredOrders
    },
    {
        value: translations.statsPoints.averageRating,
        label: translations.stats.averageRating
    }
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.04, 0.62, 0.23, 0.98]
        }
    }
}

const WhyChooseUs = () => {
    return (
        <div className="container mx-auto px-8 md:px-4  py-16 overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {translations.title}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {translations.description}
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: index * 0.1
                                }}
                                className="text-5xl mb-6"
                            >
                                {feature.icon}
                            </motion.div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mt-16 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-8"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ scale: 0.5, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                            className="text-center"
                        >
                            <div className="text-3xl font-bold text-orange-500 mb-2">{stat.value}</div>
                            <div className="text-gray-600 text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default WhyChooseUs