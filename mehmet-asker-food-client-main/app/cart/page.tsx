'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AddressList from './AddressList'
import Header from '../components/Header'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import CheckoutModal from '@/components/CheckoutModal'
import { RootState, AppDispatch } from '../../lib/store'
import { resetPayment } from '../../store/slices/paymentSlice'
import { removeFromCart, updateQuantity, clearCart } from '../../lib/slices/cartSlice'

const translations = {
    steps: {
        cart: 'Cart',
        address: 'Address',
        payment: 'Payment'
    },
    alerts: {
        loginRequired: 'Please login to place an order!',
        emptyCart: 'Your cart is empty!',
        paymentFailed: 'Payment failed. Please try again.'
    },
    cart: {
        title: 'My Cart',
        empty: 'Your cart is empty',
        clearCart: 'Clear Cart',
        continue: 'Continue'
    },
    address: {
        title: 'Delivery Address',
        backToCart: 'Back to Cart'
    },
    payment: {
        title: 'Payment Information',
        backToAddress: 'Back to Address Selection'
    },
    orderSummary: {
        title: 'Order Summary',
        subtotal: 'Subtotal',
        delivery: 'Delivery',
        total: 'Total'
    }
}

function CartContent() {
    const dispatch = useDispatch<AppDispatch>()
    const { items, total, itemCount } = useSelector((state: RootState) => state.cart)
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)
    const [selectedAddress, setSelectedAddress] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState<'cart' | 'address' | 'payment' | 'confirmation'>('cart')
    const searchParams = useSearchParams()
    useEffect(() => {
        const step = searchParams.get('step')
        if (step === 'confirmation') {
            setCurrentStep('confirmation')
        }

        const error = searchParams.get('error')
        if (error === 'payment_failed') {
            alert(translations.alerts.paymentFailed)
        }
    }, [searchParams])

    useEffect(() => {
        return () => {
            dispatch(resetPayment())
        }
    }, [dispatch])

    const handleQuantityChange = (id: string, quantity: number) => {
        dispatch(updateQuantity({ id, quantity }))
    }

    const handleRemoveItem = (id: string) => {
        dispatch(removeFromCart(id))
    }

    const handleClearCart = () => {
        dispatch(clearCart())
    }

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert(translations.alerts.loginRequired)
            return
        }

        if (items.length === 0) {
            alert(translations.alerts.emptyCart)
            return
        }

        setCurrentStep('address')
    }

    const handleAddressSelect = (address: any) => {
        setSelectedAddress(address)
        setCurrentStep('payment')
    }

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {Object.keys(translations.steps).map((step, index) => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === step ? 'bg-[#EA580C] text-white' :
                        Object.keys(translations.steps)
                            .indexOf(currentStep) > Object.keys(translations.steps)
                                .indexOf(step as any) ? 'bg-[#EA580C]/20 text-[#EA580C]' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {index + 1}
                    </div>
                    {index < 2 && (
                        <div className={`w-16 h-1 mx-2 ${Object.keys(translations.steps)
                            .indexOf(currentStep) > index
                            ? 'bg-[#EA580C]'
                            : 'bg-gray-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    )

    const renderCartItems = () => (
        <div className="space-y-4 mb-6">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={item.image || '/images/placeholder-food.png'}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            {item.isDiscount && item.discount && item.discountPrice ? (
                                <div className="flex items-center gap-4" >
                                    <span className="text-gray-400 line-through">$ {Number(item.price).toFixed(2)}  </span>
                                    <span className="text-red-500">
                                        {"   "} -{item.discount}%
                                    </span>
                                    <span className="text-[#EA580C] font-bold">$ {Number(item.discountPrice).toFixed(2)}</span>
                                </div>
                            ) : (
                                <p className="text-[#EA580C] font-bold mt-1">$ {Number(item.price).toFixed(2)}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 rounded-lg p-1">
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
                            >
                                -
                            </button>

                            <span className="w-8 text-center font-medium">{item.quantity}</span>

                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors ml-2"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    )

    const renderAddressSelection = () => (
        <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-6">{translations.address.title}</h3>
            <AddressList
                onSelect={handleAddressSelect}
                selectedId={selectedAddress?.id}
                showActions={true}
            />
        </div>
    )

    const renderPayment = () => (
        <div className="bg-white rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg">
                    <h4 className="font-medium mb-6">{translations.payment.title}</h4>
                    <CheckoutModal
                        isOpen={true}
                        onClose={() => { }}
                        orderData={{
                            items: items.map(item => ({
                                food: item.id,
                                quantity: item.quantity,
                                price: item.isDiscount ? Number(item.discountPrice) : Number(item.price)
                            })),
                            totalAmount: total,
                            deliveryAddress: selectedAddress,
                            paymentMethod: 'stripe'
                        }}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <div>
            <Header />
            <div className="bg-gray-50 min-w-screen min-h-screen">
                <div className="container max-w-[80vw] mx-auto py-8">
                    {renderStepIndicator()}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {currentStep === 'cart' && (
                                <>
                                    <h3 className="text-xl font-bold mb-6">{translations.cart.title} ({itemCount})</h3>
                                    {items.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <div className="text-6xl mb-4">🛒</div>
                                            <p className="text-gray-500">{translations.cart.empty}</p>
                                        </div>
                                    ) : (
                                        renderCartItems()
                                    )}
                                </>
                            )}
                            {currentStep === 'address' && renderAddressSelection()}
                            {currentStep === 'payment' && renderPayment()}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h4 className="text-lg font-bold mb-4">{translations.orderSummary.title}</h4>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{translations.orderSummary.subtotal}</span>
                                        <span>$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{translations.orderSummary.delivery}</span>
                                        <span>$ 0.00</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>{translations.orderSummary.total}</span>
                                            <span className="text-[#EA580C]">$ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {currentStep === 'cart' && items.length > 0 && (
                                        <>
                                            <button
                                                onClick={handleCheckout}
                                                className="w-full bg-[#EA580C] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#EA580C]/90 transition-colors"
                                            >
                                                <span className="text-white">{translations.cart.continue}</span>
                                            </button>
                                            <button
                                                onClick={handleClearCart}
                                                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                {translations.cart.clearCart}
                                            </button>
                                        </>
                                    )}
                                    {currentStep === 'address' && (
                                        <button
                                            onClick={() => setCurrentStep('cart')}
                                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            {translations.address.backToCart}
                                        </button>
                                    )}
                                    {currentStep === 'payment' && (
                                        <button
                                            onClick={() => setCurrentStep('address')}
                                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            {translations.payment.backToAddress}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Cart() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA580C] mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        }>
            <CartContent />
        </Suspense>
    )
} 