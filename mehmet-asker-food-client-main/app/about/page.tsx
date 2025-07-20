'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { Footer } from '../components/Footer'
import WhyChooseUs from '../components/WhyChooseUs'
import { Testimonials } from '../components/Testimoials'
import translations from '../lib/translations/customer/aboutPage.json'

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <section className="py-8 sm:py-12 md:py-16 md:pt-32 pt-24 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative hidden sm:block h-[300px] md:h-[400px] lg:h-[500px]"
                        >
                            <Image
                                src="/bg-register.svg"
                                alt="About Us"
                                fill
                                className="object-contain"
                                style={{
                                    rotate: '-18deg'
                                }}
                                priority
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4 sm:space-y-6 order-first lg:order-last"
                        >
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-center md:text-left">
                                {translations.title}
                            </h1>
                            <div className="space-y-4 text-gray-600 leading-relaxed text-justify text-sm sm:text-base">
                                <div className="block sm:hidden relative h-[200px] mb-6">
                                    <Image
                                        src="/bg-register.svg"
                                        alt="About Us"
                                        fill
                                        className="object-contain"
                                        style={{
                                            rotate: '-18deg'
                                        }}
                                        priority
                                    />
                                </div>

                                <p className="sm:leading-loose">
                                    {translations.description1}
                                </p>
                                <p className="sm:leading-loose">
                                    {translations.description2}
                                </p>
                                <p className="hidden sm:block sm:leading-loose">
                                    {translations.description3}
                                </p>
                                <p className="sm:leading-loose">
                                    {translations.description4}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <WhyChooseUs />
            <Testimonials />
            <Footer />
        </div>
    )
}

export default AboutPage