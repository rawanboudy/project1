import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import {
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  Eye,
  Heart,
  Filter,
  X
} from 'lucide-react';

import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import toast from 'react-hot-toast';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';

const SORT_OPTIONS = [
  { value: '', label: '–– None ––' },
  { value: '1', label: 'Price: Low → High' },
  { value: '2', label: 'Price: High → Low' },
  { value: '0', label: 'Name: A → Z' },
  { value: '3', label: 'Name: Z → A' }
];

/* =========================
   NEW: filter persistence helpers
   ========================= */
const FILTERS_STORAGE_KEY = 'menuPageFilters_v1';

const readFiltersFromUrl = (searchStr) => {
  const p = new URLSearchParams(searchStr || '');
  return {
    category: p.get('category') ?? '',
    type: p.get('type') ?? '',
    q: p.get('q') ?? '',
    sort: p.get('sort') ?? '',
    page: Math.max(1, Number(p.get('page') || 1)),
  };
};

const writeFiltersToUrl = (navigate, { category, type, q, sort, page }) => {
  const p = new URLSearchParams();
  if (category) p.set('category', category);
  if (type) p.set('type', type);
  if (q) p.set('q', q);
  if (sort) p.set('sort', sort);
  if (page && page !== 1) p.set('page', String(page));
  navigate({ search: p.toString() }, { replace: true });
};

const readFiltersFromStorage = () => {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeFiltersToStorage = (filters) => {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {}
};

// Shimmer SVG stays the same (uses gradient)
const ShimmerHeading = ({ text = 'Explore Our Culinary Creations' }) => {
  const start = theme.colors.gradientStart;
  const end = theme.colors.gradientEnd;

  return (
    <svg className="w-full [height:clamp(48px,6vw,80px)]" viewBox="0 0 1400 160" role="img" aria-label={text} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
        <linearGradient id="depth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
        <linearGradient id="sheen-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="white-grad" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
  <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
</linearGradient>

        <clipPath id="text-clip">
          <text
            id="hero-text"
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial"
            fontWeight="800"
            fontSize="90"
            letterSpacing="0.3"
          >
            {text}
          </text>
        </clipPath>
        <filter id="wave-distort" x="-20%" y="-40%" width="140%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="8" result="noise">
            <animate attributeName="baseFrequency" values="0.012 0.035; 0.02 0.05; 0.012 0.035" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" values="5;7;5" dur="6s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
        <mask id="liquid-mask">
          <rect x="0" y="0" width="1400" height="160" fill="black" />
          <g transform="translate(0,95)">
            <g>
              <path
                id="wave"
                d="M0,20 C 35,10 65,30 100,20 S 165,10 200,20 S 265,30 300,20 S 365,10 400,20 S 465,30 500,20 S 565,10 600,20 S 665,30 700,20 S 765,10 800,20 S 865,30 900,20 S 965,10 1000,20 S 1065,30 1100,20 S 1165,10 1200,20 S 1265,30 1300,20 S 1365,10 1400,20 V160 H0 Z"
                fill="white"
                opacity="0.9"
              />
              <use href="#wave" x="-1400" fill="white" opacity="0.9" />
              <animateTransform attributeName="transform" attributeType="XML" type="translate" from="-1400 0" to="0 0" dur="7s" repeatCount="indefinite" />
            </g>
            <animateTransform attributeName="transform" type="translate" values="0,95; 0,90; 0,95" dur="4.5s" repeatCount="indefinite" />
          </g>
        </mask>
      </defs>
      <use href="#hero-text" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
      <g clipPath="url(#text-clip)">
        <rect x="0" y="0" width="1400" height="160" fill="url(#white-grad)" />

        <g style={{ filter: 'url(#wave-distort)' }} mask="url(#liquid-mask)">
          <rect x="0" y="0" width="1400" height="160" fill="url(#white-grad)" />

        </g>
        <rect x="0" y="0" width="1400" height="160" fill="url(#depth-grad)" />
        <rect x="-700" y="0" width="700" height="160" fill="url(#sheen-grad)">
          <animate attributeName="x" values="-700; 1400; -700" dur="6.5s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
};

export default function MenuPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartLoading, setCartLoading] = useState({});
  const [cartSuccess, setCartSuccess] = useState({});
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [userFavorites, setUserFavorites] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  /* =========================
     UPDATED: hydrate filters from URL/storage
     ========================= */
  const urlInit = readFiltersFromUrl(window.location.search);
  const storageInit = readFiltersFromStorage();

  const [categoryFilter, setCategoryFilter] = useState(urlInit.category || storageInit?.category || '');
  const [typeFilter, setTypeFilter] = useState(urlInit.type || storageInit?.type || '');
  const [search, setSearch] = useState(urlInit.q || storageInit?.q || '');
  const [sort, setSort] = useState(urlInit.sort || storageInit?.sort || '');
  const [pageIndex, setPageIndex] = useState(urlInit.page || storageInit?.page || 1);

  const [quantities, setQuantities] = useState({});
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pageSize = 12;

  const { scrollY } = useScroll();
  const heroHeight = useTransform(scrollY, [0, 200], ['16rem', '5rem']);
  const titleScale = useTransform(scrollY, [0, 200], [1, 0.85]);
  const subtitleOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  const smoothScrollToTop = async (duration = 800) =>
    new Promise((resolve) => {
      const startPosition = window.pageYOffset;
      const startTime = performance.now();
      const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t);
      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const eased = easeInOutQuart(progress);
        window.scrollTo(0, startPosition * (1 - eased));
        if (progress < 1) requestAnimationFrame(animateScroll);
        else resolve();
      };
      requestAnimationFrame(animateScroll);
    });

  useEffect(() => {
    const checkUserSession = () => {
      const token = localStorage.getItem('token');
      // [FIX] accept either userInfo or user
      const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user');
      setIsUserLoggedIn(Boolean(token && userInfo));
    };
    checkUserSession();
    const handleStorageChange = () => checkUserSession();
    window.addEventListener('storage', handleStorageChange);
    // [FIX] listen same-tab broadcast
    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  const requireAuth = () => {
    // [FIX] re-check at action time to avoid stale state
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user');
    const logged = Boolean(token && userInfo);
    if (logged !== isUserLoggedIn) setIsUserLoggedIn(logged);

    if (!logged) {
      toast.error('Please log in to continue');
      navigate('/login');
      return false;
    }
    return true;
  };

  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.value)) return data.value;
      const keys = Object.keys(data);
      if (keys.length > 0 && keys.every((key) => !isNaN(key))) return Object.values(data);
    }
    return [];
  };

  const normalizeFilterData = (data, type = 'category') => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      if (typeof item === 'string') return { id: item, name: item, value: item };
      if (item && typeof item === 'object') {
        let id, name;
        if (type === 'category') {
          id = item.id || index.toString();
          name = item.brandName || item.name || `Category ${index + 1}`;
        } else if (type === 'type') {
          id = item.id || index.toString();
          name = item.typeName || item.name || `Type ${index + 1}`;
        } else {
          id = item.id || item.value || item.key || index.toString();
          name = item.name || item.label || item.title || item.toString();
        }
        return { id: String(id), name: String(name), value: String(id) };
      }
      return { id: String(index), name: String(item || 'Unknown'), value: String(index) };
    });
  };

  const applySorting = (productList, sortValue) => {
    if (!sortValue || sortValue === '') return productList;
    const sorted = [...productList];
    switch (sortValue) {
      case '0':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case '1':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case '2':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case '3':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return sorted;
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== '') params.append('BrandId', String(categoryFilter));
      if (typeFilter && typeFilter !== '') params.append('TypeId', String(typeFilter));
      if (search && search.trim() !== '') params.append('Search', search.trim());
      params.append('PageIndex', '1');
      params.append('PageSize', '100');

      const url = `products?${params.toString()}`;
      const response = await axios.get(url);

      let fetchedProducts = [];
      let totalCountValue = 0;

      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          fetchedProducts = response.data.data;
          totalCountValue = response.data.count || response.data.total || fetchedProducts.length;
        } else if (Array.isArray(response.data)) {
          fetchedProducts = response.data;
          totalCountValue = fetchedProducts.length;
        } else {
          fetchedProducts = ensureArray(response.data);
          totalCountValue = fetchedProducts.length;
        }
      }

      const sortedProducts = applySorting(fetchedProducts, sort);
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setTotalCount(totalCountValue);

      if (!window.allFetchedProducts) window.allFetchedProducts = {};
      const filterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
      window.allFetchedProducts[filterKey] = sortedProducts;

      const newQuantities = {};
      paginatedProducts.forEach((product) => {
        if (product && product.id) newQuantities[product.id] = quantities[product.id] || 1;
      });
      setQuantities((prev) => ({ ...prev, ...newQuantities }));
    } catch (err) {
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPageIndex) => {
    if (isPageTransitioning) return;
    setIsPageTransitioning(true);

    const filterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
    const cachedProducts = window.allFetchedProducts?.[filterKey];

    if (cachedProducts) {
      await smoothScrollToTop(600);
      await new Promise((r) => setTimeout(r, 100));

      const startIndex = (newPageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = cachedProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setPageIndex(newPageIndex);

      const newQuantities = {};
      paginatedProducts.forEach((product) => {
        if (product && product.id) newQuantities[product.id] = quantities[product.id] || 1;
      });
      setQuantities((prev) => ({ ...prev, ...newQuantities }));
    } else {
      await smoothScrollToTop(600);
      await new Promise((r) => setTimeout(r, 100));
      setPageIndex(newPageIndex);
      await fetchProducts();
    }

    setTimeout(() => setIsPageTransitioning(false), 300);
  };

  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
        setCategoriesLoading(true);
        setTypesLoading(true);
        const [categoriesResp, typesResp] = await Promise.all([axios.get('products/categories'), axios.get('products/types')]);

        const categoryData = ensureArray(categoriesResp.data);
        const typeData = ensureArray(typesResp.data);

        setAllCategories(normalizeFilterData(categoryData, 'category'));
        setAllTypes(normalizeFilterData(typeData, 'type'));
      } catch (err) {
        setAllCategories([]);
        setAllTypes([]);
        toast.error('Failed to load filters. Some features may not work properly.');
      } finally {
        setCategoriesLoading(false);
        setTypesLoading(false);
      }
    };

    fetchCategoriesAndTypes();
    if (isUserLoggedIn) {
      fetchUserFavorites();
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    smoothScrollToTop(600);
    fetchProducts();
  }, [categoryFilter, typeFilter, search, sort]); // scroll-to-top on filter change

  useEffect(() => {
    if (pageIndex !== 1) setPageIndex(1);
  }, [categoryFilter, typeFilter, search, sort]);

  useEffect(() => {
    if (window.allFetchedProducts) {
      const currentFilterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
      const currentCache = window.allFetchedProducts[currentFilterKey];
      window.allFetchedProducts = {};
      if (currentCache) window.allFetchedProducts[currentFilterKey] = currentCache;
    }
  }, [categoryFilter, typeFilter, search, sort]);

  /* =========================
     NEW: keep URL + localStorage in sync
     ========================= */
  useEffect(() => {
    const current = {
      category: categoryFilter,
      type: typeFilter,
      q: search,
      sort,
      page: pageIndex,
    };
    writeFiltersToUrl(navigate, current);
    writeFiltersToStorage(current);
  }, [categoryFilter, typeFilter, search, sort, pageIndex, navigate]);

  const fetchUserFavorites = () => {
    if (!isUserLoggedIn) {
      setUserFavorites([]);
      return;
    }
    try {
      // [FIX] support userInfo or user
      const raw = localStorage.getItem('userInfo') || localStorage.getItem('user');
      if (!raw) return;
      const user = JSON.parse(raw);
      const favoritesKey = `favorites_${user.username || user.email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        if (Array.isArray(favorites)) setUserFavorites(favorites.map((f) => f.productId));
      }
    } catch {}
  };

  const saveFavoritesToStorage = (favorites) => {
    try {
      // [FIX] support userInfo or user
      const raw = localStorage.getItem('userInfo') || localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        const favoritesKey = `favorites_${user.username || user.email}`;
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      }
    } catch {}
  };

  const getUserStoredFavorites = () => {
    try {
      // [FIX] support userInfo or user
      const raw = localStorage.getItem('userInfo') || localStorage.getItem('user');
      if (!raw) return [];
      const user = JSON.parse(raw);
      const favoritesKey = `favorites_${user.username || user.email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch {
      return [];
    }
  };

  const toggleFavorite = (product) => {
    if (!requireAuth()) return;
    const productId = product.id;
    const isFavorited = userFavorites.includes(productId);
    setFavoriteLoading((prev) => ({ ...prev, [productId]: true }));

    setTimeout(() => {
      try {
        const currentFavorites = getUserStoredFavorites();
        if (isFavorited) {
          const updatedFavorites = currentFavorites.filter((fav) => fav.productId !== productId);
          saveFavoritesToStorage(updatedFavorites);
          setUserFavorites((prev) => prev.filter((id) => id !== productId));
          toast.success('Removed from favorites');
        } else {
          const favoriteData = {
            productId,
            productName: product.name,
            pictureUrl: product.pictureUrl,
            price: product.price,
            brandName: product.brandName,
            typeName: product.typeName,
            rating: product.rating,
            dateAdded: new Date().toISOString()
          };
          const updatedFavorites = [...currentFavorites, favoriteData];
          saveFavoritesToStorage(updatedFavorites);
          setUserFavorites((prev) => [...prev, productId]);
          toast.success('Added to favorites');
        }
      } catch {
        toast.error('Failed to update favorites. Please try again.');
      } finally {
        setFavoriteLoading((prev) => ({ ...prev, [productId]: false }));
      }
    }, 300);
  };

  const categories = useMemo(() => {
    if (!Array.isArray(allCategories)) return [{ id: '', name: 'All Categories', value: '' }];
    return [
      { id: '', name: 'All Categories', value: '' },
      ...allCategories.map((category) => ({
        id: category.id || category.value || '',
        name: category.name || 'Unknown Category',
        value: category.id || category.value || ''
      }))
    ];
  }, [allCategories]);

  const types = useMemo(() => {
    if (!Array.isArray(allTypes)) return [{ id: '', name: 'All Types', value: '' }];
    return [
      { id: '', name: 'All Types', value: '' },
      ...allTypes.map((type) => ({
        id: type.id || type.value || '',
        name: type.name || 'Unknown Type',
        value: type.id || type.value || ''
      }))
    ];
  }, [allTypes]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const viewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const addToCart = async (product) => {
    if (!requireAuth()) return;

    const quantity = quantities[product.id] || 1;
    const productId = product.id;

    setCartLoading((prev) => ({ ...prev, [productId]: true }));
    setError('');

    try {
      let basketId = localStorage.getItem('basketId');
      if (!basketId) {
        basketId = `basket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('basketId', basketId);
      }

      let existingCart = null;
      try {
        const existingResponse = await axios.get(`basket/${basketId}`);
        if (existingResponse.data && (existingResponse.status === 200 || existingResponse.status === 201)) {
          existingCart = existingResponse.data;
        }
      } catch (err) {
        if (err.response?.status === 404) existingCart = null;
        else if (err.response?.status >= 500) throw new Error('Server error while fetching cart');
        else existingCart = null;
      }

      const newItem = {
        id: productId,
        productName: product.name,
        pictureUrl: product.pictureUrl,
        price: product.price,
        quantity
      };

      let cartData;
      if (existingCart && existingCart.items && Array.isArray(existingCart.items)) {
        const existingItemIndex = existingCart.items.findIndex((item) => item.id === productId || item.productId === productId);
        if (existingItemIndex >= 0) {
          existingCart.items[existingItemIndex].quantity += quantity;
        } else {
          existingCart.items.push(newItem);
        }
        cartData = {
          id: basketId,
          items: existingCart.items,
          paymentIntentId: existingCart.paymentIntentId || '',
          deliveryMethodId: existingCart.deliveryMethodId || 0,
          clientSecret: existingCart.clientSecret || '',
          shippingPrice: existingCart.shippingPrice || 0
        };
      } else {
        cartData = {
          id: basketId,
          items: [newItem],
          paymentIntentId: '',
          deliveryMethodId: 0,
          clientSecret: '',
          shippingPrice: 0
        };
      }

      let response;
      try {
        response = await axios.post('basket', cartData, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response || !response.data || !response.data.id || !Array.isArray(response.data.items)) {
          throw new Error('Invalid basket response structure');
        }
      } catch (basketError) {
        if (basketError.response?.status === 500) {
          throw new Error('Server error while creating/updating basket');
        }
        throw new Error('Failed to create or update basket');
      }

      if (response.status === 200 || response.status === 201) {
        setCartSuccess((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setCartSuccess((prev) => ({ ...prev, [productId]: false }));
        }, 2000);
        toast.success(`Added ${quantity} ${product.name} to cart`);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      let errorMessage = 'Failed to add item to cart. Please try again.';
      if (err.message === 'Server error while fetching cart') {
        errorMessage = 'Unable to load cart. Please try again later.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid request. Please refresh the page and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setCartLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ===== Filter Section (now with dark mode) =====
  const FilterSection = ({ className = '', onClose = null }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [localCategoryFilter, setLocalCategoryFilter] = useState('');
    const [localTypeFilter, setLocalTypeFilter] = useState('');
    const [localSort, setLocalSort] = useState('');

    useEffect(() => {
      if (onClose) {
        setLocalSearch(search);
        setLocalCategoryFilter(categoryFilter);
        setLocalTypeFilter(typeFilter);
        setLocalSort(sort);
      }
    }, [onClose]);

    const applyFilters = () => {
      setSearch(localSearch);
      setCategoryFilter(localCategoryFilter);
      setTypeFilter(localTypeFilter);
      setSort(localSort);
      /* NEW: reset page on new filters */
      setPageIndex(1);
      smoothScrollToTop(600);
      if (onClose) onClose();
    };

    const clearFilters = () => {
      const newValues = { search: '', category: '', type: '', sort: '' };
      setLocalSearch(newValues.search);
      setLocalCategoryFilter(newValues.category);
      setLocalTypeFilter(newValues.type);
      setLocalSort(newValues.sort);
      if (!onClose) {
        setSearch(newValues.search);
        setCategoryFilter(newValues.category);
        setTypeFilter(newValues.type);
        setSort(newValues.sort);
        /* NEW: reset page on clear */
        setPageIndex(1);
      }
      /* NEW: also clear persisted filters */
      try { localStorage.removeItem(FILTERS_STORAGE_KEY); } catch {}
    };

    const handleSearchChange = (value) => (onClose ? setLocalSearch(value) : setSearch(value));
    const handleCategoryChange = (value) => (onClose ? setLocalCategoryFilter(value) : setCategoryFilter(value));
    const handleTypeChange = (value) => (onClose ? setLocalTypeFilter(value) : setTypeFilter(value));
    const handleSortChange = (value) => (onClose ? setLocalSort(value) : setSort(value));

    const currentSearch = onClose ? localSearch : search;
    const currentCategory = onClose ? localCategoryFilter : categoryFilter;
    const currentType = onClose ? localTypeFilter : typeFilter;
    const currentSort = onClose ? localSort : sort;

    return (
      <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
        {onClose ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Filters</h2>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Search dishes..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
            {categoriesLoading ? (
              <div className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {Array.isArray(categories) &&
                  categories.map((category, index) => (
                    <option key={`category-${index}-${category.id || category.value}`} value={category.value}>
                      {category.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
            {typesLoading ? (
              <div className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading types...</span>
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={currentType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {Array.isArray(types) &&
                  types.map((type, index) => (
                    <option key={`type-${index}-${type.id || type.value}`} value={type.value}>
                      {type.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sort By</label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {!onClose && (
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6"
            >
              <X className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          )}

          {onClose && (
            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex space-x-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-500 hover:to-orange-700 transition-all duration-200 flex items-center justify-center"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      <Navbar />

      {/* Spacing from navbar */}
      <div className="pt-16">
        {/* Shrinking hero */}
        <motion.header
          style={{ height: heroHeight }}
          className="relative flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600"
        >
          {/* Overlay (different for light vs dark mode) */}
          <div className="absolute inset-0 bg-white/5 dark:bg-black/30" />
          
          <div className="relative text-center px-4 max-w-4xl mx-auto z-10">
            <motion.div style={{ scale: titleScale }}>
              <ShimmerHeading text="Explore Our Culinary Creations" />
            </motion.div>
            <motion.p
              style={{ opacity: subtitleOpacity }}
              className="text-sm sm:text-base md:text-lg text-gray-900 dark:text-orange-100 max-w-xl mx-auto"
            >
              Handcrafted dishes, curated flavors. Refine your search with our filters.
            </motion.p>
          </div>
        </motion.header>

        {/* Mobile Filter Button */}
        <div className="lg:hidden px-4 sm:px-6 -mt-8 relative z-10">
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowMobileFilters(true)}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-2 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {(search || categoryFilter || typeFilter || sort) && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {[search, categoryFilter, typeFilter, sort].filter(Boolean).length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-xl max-h-[90vh] overflow-y-auto border-t border-gray-100 dark:border-gray-800"
              >
                <FilterSection onClose={() => setShowMobileFilters(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 py-8 sm:py-12"
        >
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="sticky top-24">
              <FilterSection />
            </motion.div>
          </aside>

          {/* Products */}
          <section className="lg:col-span-3">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-300 text-center text-sm sm:text-base">{error}</p>
              </motion.div>
            )}

            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading delicious dishes...</p>
                </div>
              </motion.div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-20">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-200 mb-2">No dishes found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {search || categoryFilter || typeFilter ? 'Try adjusting your filters to see more results' : "We're preparing our menu. Please check back later!"}
                </p>
                {(search || categoryFilter || typeFilter || sort) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearch('');
                      setCategoryFilter('');
                      setTypeFilter('');
                      setSort('');
                      /* NEW: reset page + clear persisted filters */
                      setPageIndex(1);
                      try { localStorage.removeItem(FILTERS_STORAGE_KEY); } catch {}
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Clear All Filters
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`menu-page-${pageIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1], staggerChildren: 0.03 }}
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                >
                  {products
                    .map((item) => {
                      if (!item || !item.id) return null;
                      return (
                        <motion.div
                          key={item.id}
                          variants={{
                            hidden: { opacity: 0, y: 30, scale: 0.95 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] } }
                          }}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] } }}
                          className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full group"
                        >
                          {/* Favorite */}
                          {isUserLoggedIn && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleFavorite(item)}
                              disabled={favoriteLoading[item.id]}
                              className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                                userFavorites.includes(item.id)
                                  ? 'bg-red-500 text-white shadow-lg'
                                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 bg-opacity-80 text-gray-600 dark:text-gray-200 hover:bg-red-500 hover:text-white'
                              } ${favoriteLoading[item.id] ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              {favoriteLoading[item.id] ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                              ) : (
                                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${userFavorites.includes(item.id) ? 'fill-current' : ''}`} />
                              )}
                            </motion.button>
                          )}

                          {/* Image */}
                  <div className="relative overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
  <motion.img
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.25 }}
    src={item.pictureUrl || '/placeholder-dish.jpg'}
    alt={item.name || 'Product'}
    className="w-full h-full object-cover object-center"
    decoding="async"
    draggable={false}
    onError={(e) => {
      e.currentTarget.src = '/placeholder-dish.jpg';
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
</div>

                          {/* Body */}
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <div className="mb-2 sm:mb-3 flex-grow">
                              <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2 min-h-[2.5rem] text-gray-900 dark:text-gray-100">
                                {item.name || 'Unnamed Product'}
                              </h3>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Category: {item.brandName || 'Unknown'}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Type: {item.typeName || 'Unknown'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <span className="text-lg sm:text-xl font-extrabold text-orange-600">
                                ${(item.price || 0).toFixed(2)}
                              </span>
                              {item.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.rating}</span>
                                </div>
                              )}
                            </div>

                            {isUserLoggedIn && (
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                  >
                                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800 dark:text-gray-200" />
                                  </motion.button>
                                  <span className="w-6 sm:w-8 text-center font-medium text-sm text-gray-900 dark:text-gray-100">
                                    {quantities[item.id] || 1}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                  >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800 dark:text-gray-200" />
                                  </motion.button>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 mt-auto">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => viewProduct(item.id)}
                                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 text-sm"
                              >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>View Product</span>
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(item)}
                                disabled={cartLoading[item.id]}
                                className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                                  cartSuccess[item.id]
                                    ? 'bg-green-500 text-white'
                                    : cartLoading[item.id]
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700'
                                }`}
                              >
                                {cartLoading[item.id] ? (
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                ) : cartSuccess[item.id] ? (
                                  <span>Added!</span>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                    .filter(Boolean)}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 sm:mt-12">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(Math.max(1, pageIndex - 1))}
                    disabled={pageIndex === 1 || loading || isPageTransitioning}
                    className="flex items-center space-x-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-800 dark:text-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Previous</span>
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm sm:text-base whitespace-nowrap px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                      Page {pageIndex} of {totalPages}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(Math.min(totalPages, pageIndex + 1))}
                    disabled={pageIndex === totalPages || loading || isPageTransitioning}
                    className="flex items-center space-x-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-800 dark:text-gray-100"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                {isPageTransitioning && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-orange-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
