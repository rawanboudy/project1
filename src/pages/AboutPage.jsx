// src/pages/AboutPage.jsx
import React, { useMemo } from 'react';
import { Heart, Compass, Users, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

// ------- motion helpers -------
const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, margin: '-80px' }
});

const containerStagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.12 },
  viewport: { once: true, margin: '-80px' }
};

const itemFade = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, margin: '-80px' }
};

export default function AboutPage() {
  const values = useMemo(
    () => [
      {
        icon: <Heart className="w-10 h-10 text-red-500" />,
        title: 'Passion',
        desc: 'We pour our heart into every recipe.'
      },
      {
        icon: <Users className="w-10 h-10 text-green-500" />,
        title: 'Community',
        desc: 'Supporting local talent and farmers.'
      },
      {
        icon: <CheckCircle className="w-10 h-10 text-blue-500" />,
        title: 'Quality',
        desc: 'Only the freshest, finest ingredients.'
      },
      {
        icon: <Star className="w-10 h-10 text-yellow-500" />,
        title: 'Innovation',
        desc: 'Constantly evolving to delight your palate.'
      }
    ],
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />

      {/* ===================== HERO ===================== */}
      <header className="relative flex items-center justify-center h-[22rem] sm:h-[24rem] md:h-[26rem] pt-20 overflow-hidden">
        {/* brand gradient like MenuPage */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700" />

        {/* soft animated blobs (parallax-ish) */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/15 blur-3xl"
          initial={{ x: -40, y: -20, opacity: 0.6 }}
          animate={{ x: 10, y: 0, opacity: 0.75 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
          initial={{ x: 30, y: 20, opacity: 0.5 }}
          animate={{ x: -10, y: 0, opacity: 0.65 }}
          transition={{ duration: 7.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* headline with animated shine */}
        <motion.div
          {...fadeUp(0)}
          className="relative text-center text-white px-6 lg:px-0 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg tracking-tight">
            <span className="relative inline-block">
              About Fila
              {/* sheen */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ x: '-120%' }}
                animate={{ x: '120%' }}
                transition={{ duration: 2.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background:
                    'linear-gradient(110deg, transparent 45%, rgba(255,255,255,.55) 50%, transparent 55%)',
                  WebkitMaskImage: 'linear-gradient(#fff, #fff)',
                  maskImage: 'linear-gradient(#fff, #fff)'
                }}
              />
            </span>
          </h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-4 text-base sm:text-lg md:text-xl text-orange-50/90"
          >
            Discover our journey, values, and the passion fueling every dish.
          </motion.p>
        </motion.div>

        {/* wavy divider to main content */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full text-gray-50 dark:text-gray-950"
          viewBox="0 0 1440 74"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C240,64 480,0 720,16 C960,32 1200,80 1440,48 L1440,74 L0,74 Z"
            fill="currentColor"
            opacity="1"
          />
        </svg>
      </header>

      {/* ===================== MAIN ===================== */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-10 sm:py-14 space-y-20">

        {/* ---------- Our Story ---------- */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">Our Story</h2>
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              In 2024, a group of culinary enthusiasts and tech innovators joined forces to
              reimagine home dining. Fila was born from our desire to make gourmet meals
              accessible with just a few taps. We blend handcrafted recipes with cutting-edge
              technology to bring an elevated restaurant experience to your home.
            </p>
          </motion.div>

          {/* glass card w/ icon & subtle float */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <motion.div
              className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-white/10 backdrop-blur shadow-xl border border-white/60 dark:border-white/10"
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Crafted with Intention</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We obsess over ingredients, sourcing, and consistency. Every dish is a small
                    promise kept.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ---------- Mission & Vision ---------- */}
        <section className="grid gap-8 md:grid-cols-2">
          <motion.div
            className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            {...fadeUp(0)}
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Our Mission</h3>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              To democratize gourmet dining by connecting you with top local chefs, delivering
              high-quality, artfully crafted meals right to your door.
            </p>
          </motion.div>

          <motion.div
            className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            {...fadeUp(0.1)}
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Our Vision</h3>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Food that feels personal, delightful, and simple — powered by technology that
              disappears behind the experience.
            </p>
          </motion.div>
        </section>

        {/* ---------- Core Values (stagger) ---------- */}
        <section>
          <motion.h2
            className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8"
            {...fadeUp(0)}
          >
            Our Core Values
          </motion.h2>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            {...containerStagger}
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800"
                variants={itemFade}
                whileHover={{ y: -6, boxShadow: '0 20px 30px -12px rgba(0,0,0,0.15)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {v.icon}
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{v.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ---------- Stats band ---------- */}
        <section className="relative">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700" />
            <motion.div
              className="relative grid sm:grid-cols-3 gap-6 p-6 sm:p-8 text-white"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-80px' }}
            >
              {[
                { k: 'Chefs', v: '120+' },
                { k: 'Dishes Served', v: '250K+' },
                { k: 'Cities', v: '30+' }
              ].map((s) => (
                <div
                  key={s.k}
                  className="text-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4"
                >
                  <div className="text-2xl font-extrabold tracking-tight">{s.v}</div>
                  <div className="text-orange-50/90">{s.k}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="text-center">
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            onClick={() => (window.location.href = '/menu')}
          >
            Explore Our Menu
          </motion.button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
