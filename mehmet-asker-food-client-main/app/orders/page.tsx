'use client'
import axios from 'axios'
import { format } from 'date-fns'
import { RootState } from '@/lib/store'
import Header from '../components/Header'
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ordersTranslations from '../lib/translations/customer/ordersPage.json'

interface OrderItem {
    food: {
        name: string
        price: number
        image: string
        category: string
    }
    quantity: number
}

interface Order {
    _id: string
    items: OrderItem[]
    totalAmount: number
    orderStatus: string
    createdAt: string
    deliveryAddress: DeliveryAddress
}

interface OrdersResponse {
    message: string
    orders: Order[]
}

interface DeliveryAddress {
    district: string
    city: string
    street: string
    postalCode: string
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In progress' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const { token } = useSelector((state: RootState) => state.auth)

    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await axios.get<OrdersResponse>(`${API_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data) {
                setOrders(response.data.orders)
            } else {
                setError(ordersTranslations.error.fetchError)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError(ordersTranslations.error.loginRequired)
            } else if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError(ordersTranslations.error.genericError)
            }
        } finally {
            setLoading(false)
        }
    }

    const cancelOrder = async (orderId: string) => {
        try {
            setError('')
            const response = await axios.patch(`${API_URL}/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data) {
                fetchOrders()
            } else {
                setError('Failed to cancel order')
            }
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError('An error occurred while canceling the order')
            }
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders()
        } else {
            setError('Please login to view your orders')
            setLoading(false)
        }
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <h3 className="text-xl font-semibold mb-2">{ordersTranslations.error.title}</h3>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (!orders.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{ordersTranslations.noOrders.title}</h3>
                    <p className="text-gray-600">{ordersTranslations.noOrders.description}</p>
                </div>
            </div>
        )
    }

    console.log(orders)
    return (
        <div>
            <Header />
            <div className="bg-gray-50 min-w-screen min-h-screen">

            <div className="container mx-auto px-2 md:px-4 py-8 mt-14 md:mt-16">
                <h1 className="text-3xl font-bold mb-8">{ordersTranslations.title}</h1>
                <div className="space-y-6">
                    {orders.map((order) => {
                        const status = statusColors[order.orderStatus.toLowerCase()] || statusColors['pending']
                        const firstItem = order.items[0]
                        const itemCount = order.items.length
                        const itemNames = order.items.slice(0, 2).map(i => i.food.name).join(' | ')
                        const moreCount = itemCount > 2 ? itemCount - 2 : 0
                        return (
                            <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow flex flex-col md:flex-row items-stretch overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow"
                            >
                                {/* Left: Product Image */}
                                <div className="flex-shrink-0 flex items-center justify-center bg-neutral-50 md:w-40 w-full md:h-auto h-40">
                                    <img
                                        src={firstItem?.food?.image || '/placeholder.png'}
                                        alt={firstItem?.food?.name || 'Product'}
                                        className="object-cover w-24 h-24 md:w-32 md:h-32 rounded-xl shadow"
                                        />
                                </div>
                                {/* Right: Order Info */}
                                <div className="flex-1 flex flex-col justify-between p-4 md:p-6">
                                    {/* Top: Status & Date */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                                            <span className="h-2 w-2 rounded-full bg-current"></span>
                                            {ordersTranslations.orderStatus[order.orderStatus.toLowerCase() as keyof typeof ordersTranslations.orderStatus]}
                                        </span>
                                        <span className="text-gray-400 text-xs">|</span>
                                        <span className="text-gray-500 text-xs font-medium">{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                                    </div>
                                    {/* Order ID */}
                                    <div className="mb-1">
                                        <span className="text-[15px] font-bold text-[#7B2C2C] tracking-wide">{ordersTranslations.orderDetails.orderId}: {order._id}</span>
                                    </div>
                                    {/* Items summary */}
                                    <div className="text-gray-700 text-sm mb-2">
                                        {itemNames}
                                        {moreCount > 0 && (
                                            <span className="text-[#7B2C2C] font-medium">
                                                {moreCount === 1 ? ordersTranslations.orderDetails.moreItems : ordersTranslations.orderDetails.moreItemsPlural.replace('{count}', moreCount.toString())}
                                            </span>
                                        )}
                                    </div>
                                    {/* Total price */}
                                    <div className="text-lg font-bold text-neutral-800 mb-2">${Number(order.totalAmount).toFixed(2)}</div>
                                    {/* Collapse/Expand Button */}
                                    <div className="flex items-center gap-4 mt-auto">
                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                            className="ml-auto text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm"
                                            >
                                            {expandedOrderId === order._id ? ordersTranslations.orderDetails.hideDetails : ordersTranslations.orderDetails.showDetails}
                                            <span className="text-lg">{expandedOrderId === order._id ? '▲' : '›'}</span>
                                        </button>
                                        {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                                            <button
                                            onClick={() => cancelOrder(order._id)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                            >
                                                {ordersTranslations.orderDetails.cancelOrder}
                                            </button>
                                        )}
                                    </div>
                                    {/* Collapse: Order Details */}
                                    <AnimatePresence>
                                        {expandedOrderId === order._id && (
                                            <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden border-t border-neutral-200 mt-4 pt-4"
                                            >
                                                <div className="space-y-4">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            <img
                                                                src={item.food.image || '/placeholder.png'}
                                                                alt={item.food.name}
                                                                className="w-14 h-14 object-cover rounded shadow"
                                                                />
                                                            <div className="flex-1">
                                                                <h4 className="font-medium">{item.food.name}</h4>
                                                                <p className="text-xs text-gray-500">{ordersTranslations.orderDetails.quantity}: {item.quantity} Piece</p>
                                                            </div>
                                                        
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-4 border-t border-gray-200 mt-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium">{ordersTranslations.orderDetails.totalAmount}:</span>
                                                        <span className="font-bold text-lg">${Number(order.totalAmount).toFixed(2)}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <p className="font-medium">{ordersTranslations.orderDetails.deliveryAddress}:</p>
                                                        <p>{order.deliveryAddress.district} {order.deliveryAddress.city} {order.deliveryAddress.street} {order.deliveryAddress.postalCode}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
                    </div>
            </div>
        </div>
    )
}

export default OrdersPage