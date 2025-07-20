import React from 'react'
import { motion } from 'framer-motion'
import translations from '../lib/translations/common/hero.json'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.04, 0.62, 0.23, 0.98]
    }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

const floatingEmoji = {
  initial: { y: 0 },
  animate: {
    y: [-20, 0, -20],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#16a34a] text-white min-h-[95vh] flex items-center py-10 overflow-x-hidden pt-20 md:pt-40"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div variants={floatingEmoji} initial="initial" animate="animate" className="absolute top-10 left-10 text-6xl">🍕</motion.div>
        <motion.div variants={floatingEmoji} initial="initial" animate="animate" className="absolute top-32 right-20 text-4xl">🍔</motion.div>
        <motion.div variants={floatingEmoji} initial="initial" animate="animate" className="absolute bottom-20 left-20 text-5xl">🍝</motion.div>
        <motion.div variants={floatingEmoji} initial="initial" animate="animate" className="absolute bottom-32 right-10 text-3xl">🥗</motion.div>
        <motion.div variants={floatingEmoji} initial="initial" animate="animate" className="absolute top-1/2 left-1/3 text-4xl">🍰</motion.div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center lg:text-left space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              {translations.title.part1}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="block text-[#86EFAC]"
              >
                {translations.title.highlight}
              </motion.span>
              {translations.title.part2}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg md:text-xl text-[#ffedd5] max-w-lg mx-auto lg:mx-0"
            >
              {translations.subtitle}
            </motion.p>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl mb-4"
                >
                  🍕
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">{translations.deliveryCard.title}</h3>
                <p className="text-[#ffedd5]">{translations.deliveryCard.subtitle}</p>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 bg-[#4ADE80] rounded-full p-4"
            >
              <span className="text-2xl">⚡</span>
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-4 -left-4 bg-yellow-400 rounded-full p-4"
            >
              <span className="text-2xl">🎉</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20"
        >
          {[
            { value: translations.stats.customers.value, label: translations.stats.customers.label },
            { value: translations.stats.products.value, label: translations.stats.products.label },
            { value: translations.stats.delivery.value, label: translations.stats.delivery.label },
            { value: translations.stats.support.value, label: translations.stats.support.label }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: index * 0.1 }}
                className="text-3xl font-bold mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-[#FED7AA] text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default HeroSection