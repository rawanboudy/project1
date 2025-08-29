import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowRight, ChefHat, Utensils, Clock } from 'lucide-react';

const theme = {
  colors: {
    orange: '#ff6b35',
    gradientStart: '#ff6b35',
    gradientEnd: '#f7931e'
  }
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
  const [textAnimationPhase, setTextAnimationPhase] = useState(0);
  const heroRef = useRef(null);

  const heroSlides = useMemo(() => [
    { title: ['Culinary', 'Excellence'], subtitle: 'Where Every Dish Tells a Story', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&auto=format&q=85', color: '#ff6b35', icon: ChefHat, stats: { experience: '15+ Years', dishes: '200+ Dishes' } },
    { title: ['Fresh', 'Ingredients'],  subtitle: 'Farm to Table Experience',       image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&auto=format&q=85', color: '#f7931e', icon: Utensils, stats: { farmers: '50+ Farms', daily: 'Fresh Daily' } },
    { title: ['Artisan', 'Crafted'],    subtitle: 'Passion in Every Bite',          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&auto=format&q=85', color: '#e67e22', icon: Clock,   stats: { time: '24h Prep', quality: 'Premium' } },
  ], []);

  useEffect(() => {
    const textInterval = setInterval(() => setTextAnimationPhase((p) => (p + 1) % 4), 800);
    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  const preloadImage = useCallback((src) => {
    const img = new Image();
    img.onload = () => setImagesLoaded((prev) => new Set([...prev, src]));
    img.src = src;
  }, []);
  useEffect(() => { heroSlides.forEach((s) => preloadImage(s.image)); }, [heroSlides, preloadImage]);

  const current = heroSlides[currentSlide];
  const IconComponent = current.icon;
  const subtitleWidthCh = current.subtitle.length + 1;

  return (
    <section
      ref={heroRef}
      className="relative h-screen overflow-hidden bg-white text-white transition-colors"
    >
      {/* Full screen background images */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-[1200ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          >
            {imagesLoaded.has(slide.image) && (
              <img
                src={slide.image}
                alt={slide.title.join(' ')}
                className="w-full h-full object-cover"
                style={{
                  transform: i === currentSlide ? 'scale(1.02)' : 'scale(1)',
                  filter: i === currentSlide ? 'brightness(1.05) contrast(1.1)' : 'brightness(1) contrast(1)'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Centered content overlay */}
      <div className="relative z-20 h-full flex items-center justify-center text-center text-white">
        <div className="w-full max-w-4xl px-6 sm:px-8 md:px-12">
          {/* Title - Reduced size */}
          <div className="mb-2 sm:mb-4 leading-tight">
            {current.title.map((word, idx) => (
              <span
                key={`${word}-${currentSlide}`}
                className="inline-block mr-1 sm:mr-2 md:mr-3 text-white"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                  fontWeight: 900,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                  opacity: 0,
                  animation: `fadeSlideUp 800ms ease ${idx * 120}ms forwards`
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Subtitle - Reduced size */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex items-center justify-center" style={{ height: 'clamp(1.5rem, 3vw, 2rem)' }}>
            <p
              key={`subtitle-${currentSlide}`}
              className="font-light tracking-wide overflow-hidden text-white"
              style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                width: 0,
                whiteSpace: 'nowrap',
                borderRight: `2px solid ${current.color}`,
                animation: `typing 1600ms steps(${subtitleWidthCh}), blink 900ms step-end infinite`,
                animationFillMode: 'forwards',
                ['--subtitle-width']: `${subtitleWidthCh}ch`
              }}
            >
              {current.subtitle}
            </p>
          </div>

          {/* CTA Button - Reduced size */}
          <div className="flex justify-center">
            <button
              className="group relative overflow-hidden rounded-full font-bold text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-transparent"
              style={{
                padding: 'clamp(0.7rem, 2.5vw, 1.2rem) clamp(1.5rem, 5vw, 2.5rem)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1.2rem)',
                background: `linear-gradient(135deg, ${current.color}, ${theme.colors.gradientEnd})`,
                boxShadow: `0 15px 50px ${current.color}40`,
                minWidth: 'clamp(140px, 25vw, 200px)'
              }}
              onClick={() => {
                const menu = document.getElementById('menu');
                if (menu) menu.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/menu';
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                <span>Explore Menu</span>
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-2" style={{ width: 'clamp(1rem,2.5vw,1.3rem)', height: 'clamp(1rem,2.5vw,1.3rem)' }} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple dots navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-3">
          {heroSlides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes typing { from { width: 0; } to { width: var(--subtitle-width); } }
        @keyframes blink { from, to { border-color: transparent; } 50% { border-color: ${theme.colors.orange}; } }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
          [style*="transition"] { transition: none !important; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;