import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Facebook, Instagram, Twitter, MapPin, Phone } from 'lucide-react';
import theme from '../theme';
import elephantLogo from "../assets/elephant-logo.svg"

const Footer = () => {
  const quickLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Cart', path: '/cart' },
    { name: 'Profile', path: '/profile' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <footer className="py-10 sm:py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={elephantLogo} alt="Elephant Logo" className="object-cover w-full h-full" />
              </div>
              <h3 className="text-2xl font-bold">FILA</h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Creating exceptional dining experiences with passion, quality, and innovation.
            </p>
            <div className="flex space-x-4">
              {[
                { Icon: Facebook, href: 'https://facebook.com' },
                { Icon: Instagram, href: 'https://instagram.com' },
                { Icon: Twitter, href: 'https://twitter.com' }
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Hours</h4>
            <div className="space-y-2 text-gray-400">
              <p className="text-sm sm:text-base">Monday - Thursday: 5:00 PM - 10:00 PM</p>
              <p className="text-sm sm:text-base">Friday - Saturday: 5:00 PM - 11:00 PM</p>
              <p className="text-sm sm:text-base">Sunday: 4:00 PM - 9:00 PM</p>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.orange }} />
                <span className="text-gray-400 text-sm sm:text-base">123 Culinary Street, Food City, FC 12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.orange }} />
                <a 
                  href="tel:+15551234567" 
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                >
                  (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2025 FILA Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;