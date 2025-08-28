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
  const [morphingShape, setMorphingShape] = useState(0);
  const [floatingElements, setFloatingElements] = useState([]);
  const heroRef = useRef(null);

  const heroSlides = useMemo(() => [
    { title: ['Culinary', 'Excellence'], subtitle: 'Where Every Dish Tells a Story', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&auto=format&q=85', color: '#ff6b35', icon: ChefHat, stats: { experience: '15+ Years', dishes: '200+ Dishes' } },
    { title: ['Fresh', 'Ingredients'],  subtitle: 'Farm to Table Experience',       image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&auto=format&q=85', color: '#f7931e', icon: Utensils, stats: { farmers: '50+ Farms', daily: 'Fresh Daily' } },
    { title: ['Artisan', 'Crafted'],    subtitle: 'Passion in Every Bite',          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&auto=format&q=85', color: '#e67e22', icon: Clock,   stats: { time: '24h Prep', quality: 'Premium' } },
  ], []);

  useEffect(() => {
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 6 + 2, speed: Math.random() * 2 + 1, opacity: Math.random() * 0.6 + 0.2
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => setTextAnimationPhase((p) => (p + 1) % 4), 800);
    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    const shapeInterval = setInterval(() => setMorphingShape((p) => (p + 1) % 3), 3000);
    return () => clearInterval(shapeInterval);
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
      className="relative h-screen overflow-hidden bg-white text-gray-900 dark:bg-black dark:text-white transition-colors"
    >
      {/* Floating dots */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute rounded-full"
            style={{
              left: `${el.x}%`, top: `${el.y}%`,
              width: `${el.size}px`, height: `${el.size}px`,
              backgroundColor: theme.colors.orange,
              opacity: el.opacity,
              animation: `float-${el.id} ${el.speed * 10}s infinite linear`,
              animationDelay: `${el.id * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Morphing background (subtle in light, a bit brighter in dark) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20">
          <defs>
            <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.gradientStart} />
              <stop offset="100%" stopColor={theme.colors.gradientEnd} />
            </linearGradient>
          </defs>
          <path
            d={
              morphingShape === 0
                ? 'M200,300 Q400,100 600,300 Q800,500 600,700 Q400,900 200,700 Q0,500 200,300 Z'
                : morphingShape === 1
                ? 'M300,200 Q600,50 800,300 Q900,600 700,800 Q400,950 200,700 Q50,400 300,200 Z'
                : 'M400,150 Q700,200 850,450 Q800,750 500,850 Q200,800 150,550 Q200,250 400,150 Z'
            }
            fill="url(#morphGradient)"
            className="transition-all duration-[3000ms] ease-in-out"
          />
        </svg>
      </div>

      {/* Split layout */}
      <div className="relative z-10 h-full flex">

        {/* Left: content */}
        <div className="w-1/2 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-12">
          <div className="w-full max-w-xl">
            {/* Title */}
            <div className="mb-2 sm:mb-4 leading-tight">
              {current.title.map((word, idx) => (
                <span
                  key={`${word}-${currentSlide}`}
                  className="inline-block mr-1 sm:mr-2 md:mr-3"
                  style={{
                    fontSize: 'clamp(1.2rem, 6vw, 4.2rem)',
                    fontWeight: 900,
                    background: `linear-gradient(135deg, ${idx === 0 ? current.color : '#6b7280'}, ${idx === 0 ? '#6b7280' : current.color})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0,
                    animation: `fadeSlideUp 800ms ease ${idx * 120}ms forwards`
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Subtitle */}
            <div className="mb-4 sm:mb-6 md:mb-8 flex items-center" style={{ height: 'clamp(1.2rem, 4vw, 2.2rem)' }}>
              <p
                key={`subtitle-${currentSlide}`}
                className="font-light tracking-wide overflow-hidden text-gray-700 dark:text-gray-200"
                style={{
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.25rem)',
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

            {/* CTA */}
            <div className="flex gap-2 sm:gap-4">
              <button
                className="group relative overflow-hidden rounded-full font-bold text-white transition-all duration-500 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-black"
                style={{
                  padding: 'clamp(0.8rem, 3vw, 1.5rem) clamp(1.5rem, 6vw, 3rem)',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                  background: `linear-gradient(135deg, ${current.color}, ${theme.colors.gradientEnd})`,
                  boxShadow: `0 15px 50px ${current.color}40`,
                  minWidth: 'clamp(120px, 25vw, 200px)'
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
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-2" style={{ width: 'clamp(1rem,3vw,1.5rem)', height: 'clamp(1rem,3vw,1.5rem)' }} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: image */}
        <div className="w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="relative w-full max-w-lg aspect-square overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
            {heroSlides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-[1200ms] ${i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                {imagesLoaded.has(slide.image) && (
                  <img
                    src={slide.image}
                    alt={slide.title.join(' ')}
                    className="w-full h-full object-cover rounded-2xl"
                    style={{
                      transform: i === currentSlide ? 'scale(1.02)' : 'scale(1)',
                      filter: i === currentSlide ? 'brightness(1.05) contrast(1.1)' : 'brightness(1) contrast(1)'
                    }}
                  />
                )}
                <div
                  className="absolute inset-0 rounded-2xl transition-opacity duration-1200"
                  style={{
                    background: `linear-gradient(135deg, ${current.color}15, transparent 50%, ${current.color}10)`,
                    opacity: i === currentSlide ? 1 : 0
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pills */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="flex items-center gap-2 sm:gap-4 md:gap-6 rounded-full backdrop-blur-md border"
          style={{
            padding: 'clamp(0.5rem, 2vw, 0.75rem)',
            background: 'rgba(0,0,0,0.25)',
            borderColor: 'rgba(255,255,255,0.15)'
          }}
        >
          {heroSlides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`relative overflow-hidden rounded-full transition-all duration-400 group ${i === currentSlide ? 'scale-125' : 'scale-100 opacity-70'}`}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === currentSlide ? 'clamp(30px, 8vw, 60px)' : 'clamp(12px, 4vw, 22px)',
                height: 'clamp(12px, 4vw, 22px)',
                backgroundColor: slide.color
              }}
            >
              {i === currentSlide && <div className="absolute inset-0 bg-white/25 rounded-full" />}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full" />
            </button>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        ${floatingElements.map((el) => `
          @keyframes float-${el.id} {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-${el.speed * 10}px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }`).join('')}
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
