import React, { useState } from 'react';
import salmonImg from '../assets/grilled-salamon.png';
import pastaImg from '../assets/truffle.png';
import steakImg from '../assets/wagyu.png';
import bisqueImg from '../assets/Lobster-Bisque.png';
import duckImg from '../assets/Duck-Confit.png';

export default function SignatureDishes() {
  const dishes = [
    { id: 1, name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with herbs and lemon', pictureUrl: salmonImg, size: 210 },
    { id: 2, name: 'Truffle Pasta',  description: 'Handmade pasta with black truffle & parmesan', pictureUrl: pastaImg,  size: 280 },
    { id: 3, name: 'Wagyu Steak',    description: 'Premium wagyu beef with garlic butter',        pictureUrl: steakImg,  size: 290 },
    { id: 4, name: 'Lobster Bisque', description: 'Creamy lobster soup with cognac',              pictureUrl: bisqueImg, size: 310 },
    { id: 5, name: 'Duck Confit',    description: 'Slow-cooked duck leg with cherry sauce',       pictureUrl: duckImg,   size: 210 },
  ];

  const [index, setIndex] = useState(0);
  const dish = dishes[index];

  const getResponsiveSize = () => (typeof window !== 'undefined' ? Math.min(620, window.innerWidth * 0.9) : 620);
  const containerSize = getResponsiveSize();
  const center = containerSize / 2;
  const orbitRadius = containerSize * (240 / 620);
  const loopSeconds = 7;

  const handleAnimEnd = () => setIndex((i) => (i + 1) % dishes.length);

  return (
    <div className="signature-dishes-section">
      <style>{`
        /* ---------- Base + background shapes ---------- */
        .signature-dishes-section {
          position: relative;
          min-height: 100vh;
          padding: 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 20% 80%, rgba(251,140,0,.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(251,140,0,.05) 0%, transparent 50%),
            linear-gradient(135deg, #fefffe 0%, #f8fafc 25%, #f1f5f9 100%);
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a; /* slate-900 */
        }
        /* Dark mode background + text base */
        .dark .signature-dishes-section {
          background:
            radial-gradient(circle at 20% 80%, rgba(251,140,0,.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(251,140,0,.06) 0%, transparent 50%),
            linear-gradient(135deg, #0b0b0d 0%, #0f1115 40%, #111827 100%);
          color: #e5e7eb; /* slate-200 */
        }

        .signature-dishes-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(251,140,0,.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,140,0,.02) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridFloat 20s ease-in-out infinite;
          z-index: 0;
        }
        .dark .signature-dishes-section::before {
          background-image:
            linear-gradient(rgba(251,140,0,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,140,0,.05) 1px, transparent 1px);
        }
        @keyframes gridFloat { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-10px) translateX(5px); } }

        .shape-floating { position: absolute; pointer-events: none; z-index: 1; }
        .shape-1 {
          width: 120px; height: 120px;
          background: linear-gradient(135deg, rgba(251,140,0,.1), rgba(245,124,0,.05));
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          top: 10%; right: 15%;
          animation: morphFloat1 12s ease-in-out infinite;
          filter: blur(.5px);
        }
        .dark .shape-1 { background: linear-gradient(135deg, rgba(251,140,0,.18), rgba(245,124,0,.08)); }
        .shape-2 {
          width: 80px; height: 80px;
          background: linear-gradient(45deg, rgba(251,140,0,.08), transparent);
          border-radius: 50%;
          bottom: 20%; left: 10%;
          animation: morphFloat2 15s ease-in-out infinite;
        }
        .shape-3 {
          width: 200px; height: 3px;
          background: linear-gradient(90deg, transparent, rgba(251,140,0,.3), transparent);
          top: 30%; left: -100px; transform: rotate(45deg);
          animation: lineFloat 18s ease-in-out infinite;
        }
        @keyframes morphFloat1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
        @keyframes morphFloat2 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(15px) scale(1.1); } }
        @keyframes lineFloat { 0%,100% { transform: translateX(0) rotate(45deg); } 50% { transform: translateX(50px) rotate(45deg); } }

        /* ---------- Layout ---------- */
        .container { max-width: 1200px; width: 100%; margin: 0 auto; position: relative; z-index: 2; }
        .section-header { text-align: center; margin-bottom: 2rem; }
        .section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #fb8c00 70%, #f57c00 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;   /* add */
  color: transparent;                      /* keep */
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}
        .dark .section-title {
  background: linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 30%, #fb8c00 70%, #f57c00 100%);
  -webkit-background-clip: text;           /* add (safe) */
  background-clip: text;                   /* add (safe) */
  -webkit-text-fill-color: transparent;    /* add */
  color: transparent;                      /* keep */
}
        .section-title::after {
          content: ''; display: block; width: 80px; height: 3px; margin: 10px auto 0;
          background: linear-gradient(90deg, transparent, #fb8c00, transparent); border-radius: 2px;
        }
        .section-subtitle { font-size: 1.125rem; color: #64748b; }
        .dark .section-subtitle { color: #cbd5e1; }

        .dishes-showcase { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: center; }
        @media (min-width: 1024px) { .dishes-showcase { grid-template-columns: 1fr 1fr; gap: 3rem; } }

        /* ---------- Orbit ---------- */
        .animation-container { position: relative; margin: 0 auto; width: min(620px, 90vw); height: min(620px, 90vw); }
        .curved-path-container { position: relative; width: 100%; height: 100%; overflow: visible; }
        .curved-path-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .path-shadow { fill: none; stroke: rgba(251,140,0,.1); stroke-width: min(40px, 6vw); filter: blur(8px); }
        .dark .path-shadow { stroke: rgba(251,140,0,.18); }
        .path-glow { fill: none; stroke: url(#pathGradient); stroke-width: 2; opacity: .7; stroke-dasharray: 10 5; animation: pathFlow linear infinite; }
        @keyframes pathFlow { to { stroke-dashoffset: 100; } }

        .dish-animator { position: relative; width: 100%; height: 100%; z-index: 3; }
        .animated-dish {
          position: absolute; left: 0; top: 0; width: var(--dish-size); height: var(--dish-size);
          offset-rotate: auto; animation-name: dishOrbit; animation-timing-function: linear; animation-fill-mode: forwards;
          will-change: offset-distance; filter: drop-shadow(0 10px 25px rgba(0,0,0,.25)); display: flex; align-items: center; justify-content: center;
        }
        @keyframes dishOrbit { from { offset-distance: 0%; } to { offset-distance: 100%; } }
        .dish-image { width: 100%; height: 100%; border-radius: 50%; object-fit: contain; background: transparent; border: none; display: block; }

        /* ---------- Right column ---------- */
        .dish-content { text-align: center; }
        @media (min-width:1024px) { .dish-content { text-align: left; } }
       .dish-name {
  background: linear-gradient(135deg, #fb8c00 0%, #f57c00 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;    /* add */
  color: transparent;                      /* keep */
}
        .dish-description { font-size: 1.125rem; color: #64748b; line-height: 1.6; margin: 0 0 2rem; }
        .dark .dish-description { color: #cbd5e1; }

        .dish-indicators { display: flex; gap: .5rem; justify-content: center; align-items: center; margin-bottom: 2rem; }
        @media (min-width:1024px) { .dish-indicators { justify-content: flex-start; } }
        .indicator {
          width: 12px; height: 12px; border-radius: 50%;
          background: rgba(148,163,184,.35); border: 2px solid transparent; cursor: pointer;
          transition: transform .25s ease, background .25s ease, box-shadow .25s ease;
        }
        .dark .indicator { background: rgba(148,163,184,.55); }
        .indicator:hover { transform: scale(1.2); background: rgba(251,140,0,.25); }
        .indicator.active { transform: scale(1.3); background: #fb8c00; box-shadow: 0 0 20px rgba(251,140,0,.45); }

        .cta-button {
          display:inline-flex; align-items:center; justify-content:center;
          padding:1rem 2.5rem; border-radius:16px; border:0; cursor:pointer;
          color:#fff; background:linear-gradient(135deg, #fb8c00 0%, #f57c00 100%);
          font-weight:600; letter-spacing:.02em;
          box-shadow:0 4px 15px rgba(251,140,0,.35), 0 2px 8px rgba(0,0,0,.25);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(251,140,0,.45), 0 4px 12px rgba(0,0,0,.35); }

        @media (max-width: 640px) {
          .animation-container { width: min(460px, 90vw) !important; height: min(460px, 90vw) !important; }
        }
      `}</style>

      {/* Background shapes */}
      <div className="shape-floating shape-1" />
      <div className="shape-floating shape-2" />
      <div className="shape-floating shape-3" />

      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Signature Dishes</h2>
          <p className="section-subtitle">Crafted with passion, served with perfection</p>
        </div>

        <div className="dishes-showcase">
          {/* Orbit */}
          <div
            className="animation-container"
            style={{
              width: `${containerSize}px`,
              height: `${containerSize}px`,
              ['--dish-size']: `${dish.size * (containerSize / 620)}px`,
            }}
          >
            <div className="curved-path-container">
              <svg className="curved-path-svg" viewBox={`0 0 ${containerSize} ${containerSize}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb8c00" />
                    <stop offset="50%" stopColor="#f57c00" />
                    <stop offset="100%" stopColor="#fb8c00" />
                  </linearGradient>
                </defs>
                <circle className="path-shadow" cx={center} cy={center} r={orbitRadius} />
                <circle className="path-glow" cx={center} cy={center} r={orbitRadius} style={{ animationDuration: `${loopSeconds}s` }} />
              </svg>

              <div className="dish-animator">
                <div
                  key={dish.id}
                  className="animated-dish"
                  onAnimationEnd={handleAnimEnd}
                  style={{
                    offsetPath: `circle(${orbitRadius}px at ${center}px ${center}px)`,
                    animationDuration: `${loopSeconds}s`,
                  }}
                >
                  <img className="dish-image" src={dish.pictureUrl} alt={dish.name} />
                </div>
              </div>
            </div>
          </div>

          {/* Copy / controls */}
          <div className="dish-content">
            <h3 className="dish-name">{dish.name}</h3>
            <p className="dish-description">{dish.description}</p>

            <div className="dish-indicators">
              {dishes.map((_, i) => (
                <button
                  key={i}
                  className={`indicator ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`View ${dishes[i].name}`}
                  title={dishes[i].name}
                />
              ))}
            </div>

            <button className="cta-button" onClick={() => (window.location.href = '/menu')}>
              Explore Full Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
