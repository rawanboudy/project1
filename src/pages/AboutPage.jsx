// src/pages/AboutPage.jsx
import React from 'react';
import { Heart, Compass, Users, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import theme from '../theme';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <header
        className="relative flex items-center justify-center h-80"
        style={{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }}
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white px-6 lg:px-0"
        >
          <h1 className="text-5xl lg:text-6xl font-extrabold drop-shadow-lg">About Fila</h1>
          <p className="mt-3 text-lg lg:text-xl tracking-wide">
            Discover our journey, values, and the passion fueling every dish.
          </p>
        </motion.div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Our Story */}
        <section className="space-y-6">
          <motion.h2
            className="text-4xl font-bold text-center text-gray-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Our Story
          </motion.h2>
          <motion.p
            className="text-gray-700 leading-relaxed text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            In 2024, a group of culinary enthusiasts and tech innovators joined forces to
            reimagine home dining. Fila was born from our desire to make gourmet meals
            accessible with just a few taps. We blend handcrafted recipes with cutting-edge
            technology to bring an elevated restaurant experience to your home.
          </motion.p>
        </section>

        {/* Mission & Vision */}
        <section className="grid gap-12 md:grid-cols-2 items-center">
          <motion.div
            className="space-y-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold text-gray-800">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To democratize gourmet dining by connecting you with top local chefs, delivering
              high-quality, artfully crafted meals right to your door.
            </p>
          </motion.div>
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Compass className="w-20 h-20 text-orange-500" />
          </motion.div>
        </section>

        {/* Core Values */}
        <section>
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Our Core Values</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Heart className="w-10 h-10 text-red-500" />,
                title: 'Passion',
                desc: 'We pour our heart into every recipe.',
              },
              {
                icon: <Users className="w-10 h-10 text-green-500" />,
                title: 'Community',
                desc: 'Supporting local talent and farmers.',
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-blue-500" />,
                title: 'Quality',
                desc: 'Only the freshest, finest ingredients.',
              },
              {
                icon: <Star className="w-10 h-10 text-yellow-500" />,
                title: 'Innovation',
                desc: 'Constantly evolving to delight your palate.',
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
              >
                {v.icon}
                <h3 className="mt-4 text-xl font-semibold text-gray-800">{v.title}</h3>
                <p className="mt-2 text-gray-600">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full text-lg font-semibold shadow-xl hover:scale-105 transform transition"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
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
