// src/components/SignatureDishes.jsx
import React, { useState, useEffect } from 'react';

export default function SignatureDishes() {
  const featuredDishes = [
    { id:1, name:"Grilled Salmon", description:"Fresh Atlantic salmon with herbs and lemon", pictureUrl:"https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
    { id:2, name:"Truffle Pasta",   description:"Handmade pasta with black truffle & parmesan",      pictureUrl:"https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop" },
    { id:3, name:"Wagyu Steak",     description:"Premium wagyu beef with garlic butter",              pictureUrl:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop" },
    { id:4, name:"Lobster Bisque",  description:"Creamy lobster soup with cognac",                     pictureUrl:"https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop" },
    { id:5, name:"Duck Confit",     description:"Slow-cooked duck leg with cherry sauce",              pictureUrl:"https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop" },
  ];

  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [animationKey,     setAnimationKey]     = useState(0);

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
    <div className="signature-dishes-section">
      <style jsx>{`
        /* gradient background + abstract shapes */
        .signature-dishes-section {
          position: relative;
          padding: 2.5rem 0.8rem 3rem;
          background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
          overflow: hidden;
          min-height: 55vh;
          font-family: 'Poppins', sans-serif;
        }
        /* decorative circles */
        .shape-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(251,140,0,0.1);
          pointer-events: none;
        }
        .shape-circle.small { width: 100px; height: 100px; top: 10%; left: 80%; }
        .shape-circle.large { width: 300px; height: 300px; bottom: 5%; right: -50px; }

        /* header */
        .section-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out both;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg,#1f2937,#fb8c00);
          -webkit-background-clip: text;
          color: transparent;
        }
        .section-subtitle {
          color: #6b7280;
          margin-top: 0.25rem;
          font-size: 1rem;
        }

        /* layout */
        .dishes-container {
          display: flex;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* circle track */
        .curved-path-container {
          position: relative;
          width: 500px;
          height: 500px;
          flex-shrink: 0;
        }
        .curved-path-svg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .path-glow {
          fill: none;
          stroke: #fb8c00;
          stroke-width: 50;
          opacity: 0.06;
          filter: blur(5px);
        }

        /* dish animation */
        .dish-animator { position: relative; z-index: 2; }
        .animated-dish {
          width: 180px;
          height: 180px;
          position: absolute;
          offset-path: circle(200px at 250px 250px);
          offset-rotate: auto;
          animation: dishFlowComplete 7s ease-in-out forwards;
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

        /* dish name display */
        .dish-name-display {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 1rem;
        }
        .display-name {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg,#fb8c00,#f57c00);
          -webkit-background-clip: text;
          color: transparent;
          opacity: 0;
          transform: translateX(40px) scale(0.9);
          animation: nameEnter 1s ease-out forwards,
                     namePulse 1.5s ease-in-out 1s infinite alternate;
        }

        /* CTA button */
        .explore-btn {
          margin-top: 1.5rem;
          align-self: flex-start;
          padding: 0.75rem 1.5rem;
          background: #fb8c00;
          color: white;
          border: none;
          border-radius: 999px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: background 0.3s, transform 0.3s;
        }
        .explore-btn:hover {
          background: #f57c00;
          transform: translateY(-2px);
        }

        /* indicators */
        .dish-indicators {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
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

        /* keyframes */
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
