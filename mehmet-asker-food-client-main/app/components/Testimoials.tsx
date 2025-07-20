'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import translations from '../lib/translations/customer/testimoials.json'

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const contentVariants = {
    enter: { opacity: 0, y: 20 },
    center: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials: Testimonial[] = [
        {
            id: '1',
            name: 'John Smith',
            role: 'Customer',
            content: 'Amazing experience! The food is delicious and delivery is incredibly fast. Highly recommended!',
            rating: 5,
            avatar: '👨',
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            role: 'Regular Customer',
            content: 'A must-try for pizza lovers. Fresh ingredients and perfect taste!',
            rating: 5,
            avatar: '👩',
        },
        {
            id: '3',
            name: 'Michael Brown',
            role: 'Food Blogger',
            content: 'Professional service approach. Very satisfied with both quality and speed.',
            rating: 5,
            avatar: '👨‍💼',
        },
        {
            id: '4',
            name: 'Emily Davis',
            role: 'Student',
            content: 'Student-friendly prices and delicious food. My friends and I order frequently.',
            rating: 4,
            avatar: '👩‍🎓',
        },
        {
            id: '5',
            name: 'David Wilson',
            role: 'Family Man',
            content: 'My kids love it. They have healthy options too, the whole family is happy.',
            rating: 5,
            avatar: '👨‍👩‍👧‍👦',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const renderStars = (rating: number) => {
        return '⭐'.repeat(rating);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center bg-gradient-to-r from-[#fff7ed] to-[#f0fdf4] py-16 overflow-x-hidden"
        >
            <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-[#171717] mb-4"
            >
                {translations.title}
            </motion.h2>
            <motion.p
                variants={itemVariants}
                className="text-[#525252] mb-12 max-w-2xl mx-auto"
            >
                {translations.description}
            </motion.p>

            <div className="relative max-w-4xl mx-auto overflow-x-hidden">
                <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12 border border-[#F5F5F5] overflow-x-hidden max-w-[80vw] mx-auto" >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            variants={contentVariants}
                        >
                            <div className="flex items-center justify-center mb-6">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-6xl mb-4"
                                >
                                    {testimonials[currentIndex].avatar}
                                </motion.div>
                            </div>

                            <motion.blockquote
                                className="text-lg md:text-xl text-[#404040] mb-6 leading-relaxed"
                            >
                                "{testimonials[currentIndex].content}"
                            </motion.blockquote>

                            <motion.div
                                className="flex items-center justify-center mb-4"
                            >
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl"
                                >
                                    {renderStars(testimonials[currentIndex].rating)}
                                </motion.span>
                            </motion.div>

                            <motion.div
                                className="text-center"
                            >
                                <motion.h4
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-semibold text-[#171717] text-lg"
                                >
                                    {testimonials[currentIndex].name}
                                </motion.h4>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-[#525252]"
                                >
                                    {testimonials[currentIndex].role}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button
                    onClick={goToPrevious}
                    className="absolute left-10 md:left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors "
                >
                    ←
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-10 md:right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                    →
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 mx-4 ml-[40px] rounded-full transition-colors ${index === currentIndex
                            ? 'bg-[#EA580C]'
                            : 'bg-[#D4D4D4] hover:bg-[#A3A3A3]'
                            }`}
                    />
                ))}
            </div>

            {/* Overall Rating */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-[#fff7ed] to-[#f0fdf4] rounded-2xl p-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <motion.div
                        variants={itemVariants}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="text-4xl font-bold text-[#EA580C] mb-2"
                        >
                            5.0
                        </motion.div>
                        <div className="text-sm text-[#525252]">{translations.averageRating}</div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl mt-2"
                        >
                            ⭐⭐⭐⭐⭐
                        </motion.div>
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="text-4xl font-bold text-[#ea580c] mb-2"
                        >
                            1000+
                        </motion.div>
                        <div className="text-sm text-[#525252]">{translations.customerReviews}</div>
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                            className="text-4xl font-bold text-[#ea580c] mb-2"
                        >
                            100%
                        </motion.div>
                        <div className="text-sm text-[#525252]">{translations.satisfactionRate}</div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
} 