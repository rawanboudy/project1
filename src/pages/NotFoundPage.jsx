import React from 'react';

const theme = {
  colors: {
    gradientStart: '#FFA726',
    gradientMiddle: '#FB8C00',
    gradientEnd: '#EF6C00',
    orangeLight: '#FCE9D6',
    orange: '#FB8C00',
    orangeDark: '#EF6C00',
    textDark: '#1F2937',
    textGray: '#6B7280',
    errorLight: '#FEE2E2',
    error: '#EF4444',
    errorDark: '#B91C1C',
  }
};

const NotFoundPage = () => {
  const styles = {
    notFoundPage: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.gradientStart} 0%, ${theme.colors.gradientMiddle} 50%, ${theme.colors.gradientEnd} 100%)`,
      display: 'flex',
      flexDirection: 'column',
    },
    notFoundContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundPattern: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      animation: 'backgroundMove 20s linear infinite',
    },
    notFoundContent: {
      background: `rgba(255, 255, 255, 0.95)`,
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '3rem 2rem',
      textAlign: 'center',
      maxWidth: '600px',
      width: '100%',
      boxShadow: `0 20px 40px rgba(31, 41, 55, 0.1)`,
      border: `1px solid ${theme.colors.orangeLight}`,
      position: 'relative',
      zIndex: 2,
    },
    notFoundIcon: {
      marginBottom: '2rem',
    },
    plateIcon: {
      width: '100px',
      height: '100px',
      margin: '0 auto',
      display: 'block',
      animation: 'bounce 2s infinite',
    },
    h1: {
      fontSize: '2.5rem',
      color: theme.colors.textDark,
      marginBottom: '0.5rem',
      fontWeight: '700',
      fontFamily: 'Georgia, serif',
      margin: '0 0 0.5rem 0',
    },
    h2: {
      fontSize: '1.5rem',
      color: theme.colors.error,
      marginBottom: '1rem',
      fontWeight: '500',
      margin: '0 0 1rem 0',
    },
    p: {
      fontSize: '1.1rem',
      color: theme.colors.textGray,
      marginBottom: '2.5rem',
      lineHeight: '1.6',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
      margin: '0 auto 2.5rem auto',
    },
    notFoundActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    btn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1.5rem',
      textDecoration: 'none',
      borderRadius: '50px',
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      border: '2px solid transparent',
      minWidth: '140px',
      justifyContent: 'center',
      color: 'white',
      cursor: 'pointer',
    },
    btnPrimary: {
      background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`,
      boxShadow: `0 4px 15px rgba(255, 167, 38, 0.4)`,
    },
    btnSecondary: {
      background: `linear-gradient(135deg, ${theme.colors.orange}, ${theme.colors.orangeDark})`,
      boxShadow: `0 4px 15px rgba(251, 140, 0, 0.4)`,
    },
    btnTertiary: {
      background: `linear-gradient(135deg, ${theme.colors.error}, ${theme.colors.errorDark})`,
      boxShadow: `0 4px 15px rgba(239, 68, 68, 0.4)`,
    },
    notFoundIllustration: {
      position: 'absolute',
      bottom: '2rem',
      right: '2rem',
      opacity: '0.1',
      zIndex: 1,
    },
    chefHat: {
      width: '200px',
      height: '200px',
    },
    chefSvg: {
      width: '100%',
      height: '100%',
      animation: 'float 3s ease-in-out infinite',
    },
  };

  const handleBtnHover = (e, btnType) => {
    e.target.style.transform = 'translateY(-3px)';
    if (btnType === 'primary') {
      e.target.style.boxShadow = '0 6px 20px rgba(255, 167, 38, 0.6)';
    } else if (btnType === 'secondary') {
      e.target.style.boxShadow = '0 6px 20px rgba(251, 140, 0, 0.6)';
    } else if (btnType === 'tertiary') {
      e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
    }
  };

  const handleBtnLeave = (e, btnType) => {
    e.target.style.transform = 'translateY(0)';
    if (btnType === 'primary') {
      e.target.style.boxShadow = '0 4px 15px rgba(255, 167, 38, 0.4)';
    } else if (btnType === 'secondary') {
      e.target.style.boxShadow = '0 4px 15px rgba(251, 140, 0, 0.4)';
    } else if (btnType === 'tertiary') {
      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes backgroundMove {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(60px, 60px);
            }
          }

          @media (max-width: 768px) {
            .responsive-container {
              padding: 1rem !important;
            }
            
            .responsive-content {
              padding: 2rem 1.5rem !important;
              margin-top: 1rem;
            }
            
            .responsive-h1 {
              font-size: 2rem !important;
            }
            
            .responsive-h2 {
              font-size: 1.25rem !important;
            }
            
            .responsive-p {
              font-size: 1rem !important;
              margin-bottom: 2rem !important;
            }
            
            .responsive-actions {
              flex-direction: column !important;
              align-items: center !important;
              gap: 0.75rem !important;
            }
            
            .responsive-btn {
              width: 100% !important;
              max-width: 250px !important;
              padding: 1rem 1.5rem !important;
            }
            
            .responsive-icon {
              width: 80px !important;
              height: 80px !important;
            }
            
            .responsive-illustration {
              bottom: 1rem !important;
              right: 1rem !important;
              opacity: 0.05 !important;
            }
            
            .responsive-chef {
              width: 150px !important;
              height: 150px !important;
            }
          }

          @media (max-width: 480px) {
            .responsive-content {
              padding: 1.5rem 1rem !important;
              border-radius: 15px !important;
            }
            
            .responsive-h1 {
              font-size: 1.75rem !important;
            }
            
            .responsive-h2 {
              font-size: 1.1rem !important;
            }
            
            .responsive-p {
              font-size: 0.95rem !important;
            }
            
            .responsive-btn {
              padding: 0.875rem 1.25rem !important;
              font-size: 0.9rem !important;
            }
            
            .responsive-icon {
              width: 70px !important;
              height: 70px !important;
            }
            
            .responsive-illustration {
              display: none !important;
            }
          }
        `}
      </style>
      <div style={styles.notFoundPage}>
        <div style={styles.notFoundContainer} className="responsive-container">
          <div style={styles.backgroundPattern}></div>
          <div style={styles.notFoundContent} className="responsive-content">
            <div style={styles.notFoundIcon}>
              <svg viewBox="0 0 100 100" style={styles.plateIcon} className="responsive-icon">
                <circle cx="50" cy="50" r="45" fill="#f8f9fa" stroke={theme.colors.error} strokeWidth="2"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke={theme.colors.error} strokeWidth="1" strokeDasharray="5,5"/>
                <text x="50" y="55" textAnchor="middle" fill={theme.colors.error} fontSize="16" fontWeight="bold">404</text>
              </svg>
            </div>
            <h1 style={styles.h1} className="responsive-h1">Oops! Dish Not Found</h1>
            <h2 style={styles.h2} className="responsive-h2">The page you're craving doesn't exist</h2>
            <p style={styles.p} className="responsive-p">
              It looks like this page has been removed from our menu or the URL might be incorrect. 
              Don't worry, we have plenty of delicious options waiting for you!
            </p>
            <div style={styles.notFoundActions} className="responsive-actions">
              <button 
                style={{...styles.btn, ...styles.btnPrimary}} 
                className="responsive-btn"
                onMouseEnter={(e) => handleBtnHover(e, 'primary')}
                onMouseLeave={(e) => handleBtnLeave(e, 'primary')}
                onClick={() => window.location.href = '/'}
              >
                <span>🏠</span>
                Back to Home
              </button>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}}
                className="responsive-btn"
                onMouseEnter={(e) => handleBtnHover(e, 'secondary')}
                onMouseLeave={(e) => handleBtnLeave(e, 'secondary')}
                onClick={() => window.location.href = '/menu'}
              >
                <span>📋</span>
                View Menu
              </button>
           
            </div>
          </div>
          <div style={styles.notFoundIllustration} className="responsive-illustration">
            <div style={styles.chefHat} className="responsive-chef">
              <svg viewBox="0 0 200 200" style={styles.chefSvg}>
                <ellipse cx="100" cy="160" rx="80" ry="20" fill={theme.colors.orangeLight} opacity="0.3"/>
                <path d="M60 120 Q60 80 100 80 Q140 80 140 120 L140 160 Q140 170 130 170 L70 170 Q60 170 60 160 Z" fill="#ffffff"/>
                <circle cx="75" cy="100" r="8" fill="#ffffff"/>
                <circle cx="100" cy="95" r="10" fill="#ffffff"/>
                <circle cx="125" cy="100" r="8" fill="#ffffff"/>
                <path d="M70 160 L70 140 L80 140 L80 160" fill={theme.colors.error}/>
                <path d="M90 160 L90 135 L100 135 L100 160" fill={theme.colors.error}/>
                <path d="M110 160 L110 140 L120 140 L120 160" fill={theme.colors.error}/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;