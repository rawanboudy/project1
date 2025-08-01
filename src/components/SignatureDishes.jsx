import React, { useState, useEffect } from 'react';

export default function SignatureDishes() {
  const featuredDishes = [
    { id: 1, name: "Grilled Salmon", description: "Fresh Atlantic salmon with herbs and lemon", pictureUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
    { id: 2, name: "Truffle Pasta", description: "Handmade pasta with black truffle & parmesan", pictureUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop" },
    { id: 3, name: "Wagyu Steak", description: "Premium wagyu beef with garlic butter", pictureUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop" },
    { id: 4, name: "Lobster Bisque", description: "Creamy lobster soup with cognac", pictureUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop" },
    { id: 5, name: "Duck Confit", description: "Slow-cooked duck leg with cherry sauce", pictureUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop" },
  ];

  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(k => k + 1);
      setTimeout(() => {
        setCurrentDishIndex(i => (i + 1) % featuredDishes.length);
      }, 7000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentDish = featuredDishes[currentDishIndex];

  return (
    <div className="signature-dishes-section relative py-6 sm:py-12">
      <style jsx>{`
        .signature-dishes-section {
          background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          position: relative;
        }

        /* Floating circles - Responsive */
        .shape-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(251,140,0,0.1);
          pointer-events: none;
        }

        .shape-circle.small { 
          width: 80px;
          height: 80px;
          top: 5%; 
          left: 70%; 
        }
        .shape-circle.large { 
          width: 150px;
          height: 150px;
          bottom: 5%; 
          right: -20px;
        }

        /* Responsive floating circles */
        @media (min-width: 640px) {
          .shape-circle.small { 
            width: 120px;
            height: 120px; 
            left: 75%; 
          }
          .shape-circle.large { 
            width: 250px;
            height: 250px;
            right: -40px;
          }
        }

        .section-header {
          text-align: center;
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.8s ease-out both;
          padding: 0 1rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 900;
          background: linear-gradient(135deg, #1f2937, #fb8c00);
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Responsive title sizes */
        @media (min-width: 640px) {
          .section-title {
            font-size: 2.5rem;
          }
        }

        .section-subtitle {
          color: #6b7280;
          margin-top: 0.25rem;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .section-subtitle {
            font-size: 1rem;
          }
        }

        .dishes-container {
          display: flex;
          gap: 1rem;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 95%;
          margin: 0 auto;
          padding: 1rem;
          background: transparent;
        }

        /* Responsive container layout */
        @media (min-width: 768px) {
          .dishes-container {
            flex-direction: row;
            gap: 1.5rem;
            max-width: 800px;
            padding-top: 2rem;
          }
        }

        .curved-path-container {
          position: relative;
          width: 280px;
          height: 280px;
          flex-shrink: 0;
          margin-bottom: 1rem;
          overflow: visible;/* Keep dish within bounds */
          background: transparent;
        }

        /* Responsive curve container */
        @media (min-width: 640px) {
          .curved-path-container {
            width: 320px;
            height: 320px;
          }
        }

        @media (min-width: 768px) {
          .curved-path-container {
            width: 350px;
            height: 350px;
            margin-left: 10px;
            margin-bottom: 1rem;
          }
        }

       .curved-path-svg {
  position: absolute;
  inset: 0;
  z-index: 1; /* lower than dish image */
}


        .path-glow {
          fill: none;
          stroke: #fb8c00;
          stroke-width: 50;
          opacity: 0.06;
          filter: blur(5px);
        }

        .dish-animator { 
          position: relative; 
          z-index: 3; 
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .animated-dish {
          z-index: 4;
          width: 120px;
          height: 120px;
          position: absolute;
          offset-path: circle(120px at 140px 140px);
          offset-rotate: auto;
          animation: dishFlowComplete 7s ease-in-out forwards;
        }

        /* Responsive dish sizes and paths */
        @media (min-width: 640px) {
          .animated-dish {
            width: 140px;
            height: 140px;
            offset-path: circle(140px at 160px 160px);
          }
        }

        @media (min-width: 768px) {
          .animated-dish {
            width: 160px;
            height: 160px;
            offset-path: circle(160px at 175px 175px);
          }
        }

        .dish-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fb8c00;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          animation: pulseRing 2s ease-in-out infinite;
          background: white;
        }

        .dish-name-display {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 0 1rem;
        }

        /* Responsive name display */
        @media (min-width: 768px) {
          .dish-name-display {
            padding-left: 3rem;
            align-items: flex-start;
            text-align: left;
          }
        }

        .display-name {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #fb8c00, #f57c00);
          -webkit-background-clip: text;
          color: transparent;
          opacity: 0;
          transform: translateX(40px) scale(0.9);
          animation: nameEnter 1s ease-out forwards,
                     namePulse 1.5s ease-in-out 1s infinite alternate;
        }

        /* Responsive name size */
        @media (min-width: 640px) {
          .display-name {
            font-size: 1.75rem;
          }
        }

        @media (min-width: 768px) {
          .display-name {
            font-size: 2rem;
          }
        }

        .explore-btn {
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #fb8c00 0%, #f57c00 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: fit-content;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(251, 140, 0, 0.3), 
                      0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Responsive button size */
        @media (min-width: 640px) {
          .explore-btn {
            padding: 0.875rem 2rem;
            font-size: 1rem;
          }
        }

        .explore-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s;
        }

        .explore-btn:hover {
          background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 35px rgba(251, 140, 0, 0.4), 
                      0 6px 15px rgba(0, 0, 0, 0.15);
        }
                      .curved-path-wrapper {
  width: 350px;
  height: 350px;
  overflow: visible;
  flex-shrink: 0;
  position: relative;
}


        .explore-btn:hover::before {
          left: 100%;
        }

        .explore-btn:active {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 6px 20px rgba(251, 140, 0, 0.3);
        }

        .dish-indicators {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .dish-indicators {
            gap: 0.75rem;
          }
        }

        @media (min-width: 768px) {
          .dish-indicators {
            justify-content: flex-start;
          }
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s;
        }

        .indicator.active {
          background: #fb8c00;
          transform: scale(1.4);
          border-color: rgba(251,140,0,0.3);
        }

        @keyframes fadeInUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }

        @keyframes dishFlowComplete {
          0%   { offset-distance:0%; transform: scale(0.7); opacity:0; }
          10%  { opacity:1; transform: scale(1); }
          50%  { offset-distance:50%; }
          90%  { offset-distance:90%; }
          100% { offset-distance:100%; transform: scale(0.7); opacity:0; }
        }

        @keyframes pulseRing {
          0%,100% { box-shadow:0 0 0 0 rgba(251,140,0,0.6); }
          50%     { box-shadow:0 0 0 15px rgba(251,140,0,0); }
        }

        @keyframes nameEnter {
          to { opacity:1; transform: translateX(0) scale(1); }
        }

        @keyframes namePulse {
          to { transform: translateX(0) scale(1.03); }
        }

        /* Mobile specific adjustments */
        @media (max-width: 767px) {
          .animated-dish {
            /* Ensure dish stays within mobile container bounds */
            top: 10px;
            left: 10px;
          }
          
          .curved-path-container {
            /* Add padding to prevent dish from going outside */
            padding: 20px;
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* floating shapes */}
      <div className="shape-circle small" />
      <div className="shape-circle large" />

      {/* header */}
      <div className="section-header">
        <h2 className="section-title">Signature Dishes</h2>
        <p className="section-subtitle">Crafted with passion, served with perfection</p>
      </div>

      <div className="dishes-container">
        {/* left: track + dish */}
        <div className="curved-path-wrapper">
        <div className="curved-path-container">
          <svg className="curved-path-svg" viewBox="0 0 500 500">
            <circle className="path-glow" cx="250" cy="250" r="200" />
          </svg>
          <div className="dish-animator">
            <div key={`${currentDish.id}-${animationKey}`} className="animated-dish">
              <img src={currentDish.pictureUrl} className="dish-image" alt={currentDish.name} />
            </div>
          </div>
        </div>
        </div>

        {/* right: name, dots & CTA */}
        <div className="dish-name-display">
          <h3 key={`${currentDish.id}-${animationKey}`} className="display-name">
            {currentDish.name}
          </h3>
          <div className="dish-indicators">
            {featuredDishes.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${idx === currentDishIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentDishIndex(idx);
                  setAnimationKey(k => k + 1);
                }}
              />
            ))}
          </div>
          <button className="explore-btn">
            Explore More Items
          </button>
        </div>
      </div>
    </div>
  );
}