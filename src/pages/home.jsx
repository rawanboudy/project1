import React, { useState, useEffect } from 'react';
import { Star, Clock, Play, Pause, ArrowRight, Heart, Award, Users, User } from 'lucide-react';
import '../styles/RestaurantHomepage.css';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import SignatureDishes from '../components/SignatureDishes';
import { useNavigate } from 'react-router-dom';

const RestaurantHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDish, setHoveredDish] = useState(null);
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      title: "Culinary Excellence",
      subtitle: "Where Every Dish Tells a Story",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop"
    },
    {
      title: "Fresh Ingredients",
      subtitle: "Farm to Table Experience",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop"
    },
    {
      title: "Artisan Crafted",
      subtitle: "Passion in Every Bite",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop"
    }
  ];

  // Fallback dishes with enhanced data
  const fallbackDishes = [
    {
      id: 1,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with herbs and lemon, served with seasonal vegetables",
      price: "$28.99",
      pictureUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      rating: 4.8,
      category: "Seafood",
      preparationTime: "25 min"
    },
    {
      id: 2,
      name: "Truffle Pasta",
      description: "Handmade pasta with black truffle, parmesan, and fresh herbs",
      price: "$32.99",
      pictureUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
      rating: 4.9,
      category: "Italian",
      preparationTime: "20 min"
    },
    {
      id: 3,
      name: "Wagyu Steak",
      description: "Premium wagyu beef cooked to perfection with garlic butter",
      price: "$45.99",
      pictureUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      rating: 4.7,
      category: "Grill",
      preparationTime: "30 min"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "An absolutely incredible dining experience. The attention to detail is remarkable!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b5db72b2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      text: "Best restaurant in the city. The flavors are unforgettable and service is impeccable.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Emma Davis",
      text: "A perfect blend of ambiance, taste, and hospitality. Highly recommended!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const DishCard = ({ dish, index }) => (
    <div
      className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl animate-slideInUp"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="relative">
        <img src={dish.pictureUrl}  alt={dish.name} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {dish.category}
        </span>
        <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/90 text-sm text-gray-800 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-orange-500" />
          <span>{dish.rating}</span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-white/90 text-sm text-gray-800 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4 text-orange-500" />
          <span>{dish.preparationTime}</span>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 group-hover:gradient-text transition-all duration-500">
          {dish.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{dish.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold gradient-text">{dish.price}</span>
          <button className="btn-enhanced rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white px-5 py-2 font-semibold">
            Order
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const fetchDishes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://elkadyyy-drg9ape4djgmebad.italynorth-01.azurewebsites.net/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result?.data || [];
        
        if (data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: `$${item.price ? item.price.toFixed(2) : '0.00'}`,
            pictureUrl: item.pictureUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
            rating: item.rating || 4.5,
            category: item.category || "Specialty",
            preparationTime: item.preparationTime || "25 min"
          }));
          setFeaturedDishes(formatted.slice(0, 3));
        } else {
          setFeaturedDishes(fallbackDishes);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setError(error.message);
        setFeaturedDishes(fallbackDishes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar scrollY={scrollY} />
      
      {/* Hero Section */}
      <section id="home" className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              } pointer-events-none`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-6 opacity-0 animate-fadeInUp" 
                 style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white/90"
                    style={{ backgroundColor: `${theme.colors.orange}40` }}>
                ✨ Award Winning Restaurant
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 opacity-0 animate-fadeInUp"
                style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              {heroSlides[currentSlide].title}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 opacity-0 animate-fadeInUp"
               style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
              {heroSlides[currentSlide].subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fadeInUp"
                 style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="group px-8 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Explore Menu
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                className="group px-8 py-4 rounded-full font-bold text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <span className="flex items-center justify-center gap-2">
                  {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  Watch Story
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'scale-125' : 'scale-100 opacity-50'
              }`}
              style={{ backgroundColor: theme.colors.orange }}
            />
          ))}
        </div>
      </section>

      <SignatureDishes />

      {/* Experience Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop" 
               alt="Restaurant Interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white/90 mb-4"
                    style={{ backgroundColor: `${theme.colors.orange}40` }}>
                The Experience
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                More Than Just a Meal
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Step into our world where culinary artistry meets warm hospitality. Every detail is crafted to create unforgettable moments.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[{ icon: Clock, title: 'Quick Service', desc: 'Fast & efficient' },
                   { icon: Award, title: 'Premium Quality', desc: 'Only the finest' },
                   { icon: Users, title: 'Expert Team', desc: 'Skilled professionals' },
                   { icon: Heart, title: 'Made with Love', desc: 'Passion in every dish' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: `${theme.colors.orange}40` }}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-white/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="group px-8 py-4 rounded-full font-bold text-white border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <span className="flex items-center gap-2">
                  Book Experience
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ backgroundColor: theme.colors.orangeLight }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                  style={{ backgroundColor: 'white', color: theme.colors.orangeDark }}>
              What Our Guests Say
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: theme.colors.textDark }}>
              Feedbacks
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: theme.colors.orange }} />
                  ))}
                </div>
                
                <p className="mb-6 text-lg" style={{ color: theme.colors.textGray }}>
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: theme.colors.textDark }}>{testimonial.name}</h4>
                    <p className="text-sm" style={{ color: theme.colors.textGray }}>Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RestaurantHomepage;
