// src/pages/MenuPage.jsx
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

  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [quantities, setQuantities] = useState({});
  const pageSize = 12;

  // ===== Scroll-driven hero animation =====
  const { scrollY } = useScroll();
  // Height shrinks from 16rem to 5rem over first 200px scroll
  const heroHeight = useTransform(scrollY, [0, 200], ['16rem', '5rem']);
  // Title scales slightly
  const titleScale = useTransform(scrollY, [0, 200], [1, 0.85]);
  // Subtitle fades out
  const subtitleOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  // Check if user is logged in
  useEffect(() => {
    const checkUserSession = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      setIsUserLoggedIn(!!(token && userInfo));
    };

    checkUserSession();

    const handleStorageChange = () => {
      checkUserSession();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const requireAuth = () => {
    if (!isUserLoggedIn) {
      toast.error('Please log in to continue');
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageIndex]);

  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.value)) return data.value;

      const keys = Object.keys(data);
      if (keys.length > 0 && keys.every((key) => !isNaN(key))) {
        return Object.values(data);
      }
    }
    return [];
  };

  const normalizeFilterData = (data, type = 'category') => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      if (typeof item === 'string') {
        return { id: item, name: item, value: item };
      }
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

  const handlePageChange = (newPageIndex) => {
    const filterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
    const cachedProducts = window.allFetchedProducts?.[filterKey];

    if (cachedProducts) {
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
      setPageIndex(newPageIndex);
      fetchProducts();
    }
  };

  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
        setCategoriesLoading(true);
        setTypesLoading(true);
        const [categoriesResp, typesResp] = await Promise.all([
          axios.get('products/categories'),
          axios.get('products/types')
        ]);

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
    fetchProducts();
  }, [categoryFilter, typeFilter, search, sort]);

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

  const fetchUserFavorites = () => {
    if (!isUserLoggedIn) {
      setUserFavorites([]);
      return;
    }
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const user = JSON.parse(userInfo);
      const favoritesKey = `favorites_${user.username || user.email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        if (Array.isArray(favorites)) setUserFavorites(favorites.map((f) => f.productId));
      }
    } catch {
      // ignore
    }
  };

  const saveFavoritesToStorage = (favorites) => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const favoritesKey = `favorites_${user.username || user.email}`;
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      }
    } catch {
      // ignore
    }
  };

  const getUserStoredFavorites = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return [];
      const user = JSON.parse(userInfo);
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
        const existingItemIndex = existingCart.items.findIndex(
          (item) => item.id === productId || item.productId === productId
        );
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
      }
    };

    const handleSearchChange = (value) => {
      if (onClose) setLocalSearch(value);
      else setSearch(value);
    };

    const handleCategoryChange = (value) => {
      if (onClose) setLocalCategoryFilter(value);
      else setCategoryFilter(value);
    };

    const handleTypeChange = (value) => {
      if (onClose) setLocalTypeFilter(value);
      else setTypeFilter(value);
    };

    const handleSortChange = (value) => {
      if (onClose) setLocalSort(value);
      else setSort(value);
    };

    const currentSearch = onClose ? localSearch : search;
    const currentCategory = onClose ? localCategoryFilter : categoryFilter;
    const currentType = onClose ? localTypeFilter : typeFilter;
    const currentSort = onClose ? localSort : sort;

    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
        {onClose ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold mb-6">Filters</h2>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm"
              placeholder="Search dishes..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
            {categoriesLoading ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white"
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
            <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
            {typesLoading ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading types...</span>
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white"
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
            <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all text-sm bg-white"
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-6"
            >
              <X className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          )}

          {onClose && (
            <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-500 hover:to-orange-700 transition-all duration-200 flex items-center justify-center"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
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
    <div className="bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <Navbar />

      {/* Spacing from navbar */}
      <div className="pt-16">
        {/* ===== Sticky, shrinking hero ===== */}
        <motion.header
          style={{ height: heroHeight }}
          className="relative flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 sticky top-0 z-[5] will-change-[height]"
        >
          <div className="text-center px-4 max-w-4xl mx-auto">
            <motion.h1
              style={{ scale: titleScale }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
            >
              Explore Our Culinary Creations
            </motion.h1>
            <motion.p
              style={{ opacity: subtitleOpacity }}
              className="text-sm sm:text-base md:text-lg text-orange-200 max-w-xl mx-auto"
            >
              Handcrafted dishes, curated flavors. Refine your search with our filters.
            </motion.p>
          </div>
        </motion.header>

        {/* Mobile Filter Button */}
        <div className="lg:hidden px-4 sm:px-6 -mt-8 relative z-10">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {(search || categoryFilter || typeFilter || sort) && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {[search, categoryFilter, typeFilter, sort].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="w-full bg-white rounded-t-xl max-h-[90vh] overflow-y-auto">
              <FilterSection onClose={() => setShowMobileFilters(false)} />
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 py-8 sm:py-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSection />
            </div>
          </aside>

          {/* Products List */}
          <section className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading delicious dishes...</p>
                </div>
              </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No dishes found</h3>
                <p className="text-gray-500 mb-4">
                  {search || categoryFilter || typeFilter
                    ? 'Try adjusting your filters to see more results'
                    : "We're preparing our menu. Please check back later!"}
                </p>
                {(search || categoryFilter || typeFilter || sort) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategoryFilter('');
                      setTypeFilter('');
                      setSort('');
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`menu-page-${pageIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                >
                  {products
                    .map((item, idx) => {
                      if (!item || !item.id) return null;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.2 }}
                          className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition flex flex-col h-full"
                        >
                          {/* Favorite */}
                          {isUserLoggedIn && (
                            <button
                              onClick={() => toggleFavorite(item)}
                              disabled={favoriteLoading[item.id]}
                              className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                                userFavorites.includes(item.id)
                                  ? 'bg-red-500 text-white shadow-lg'
                                  : 'bg-white bg-opacity-80 text-gray-600 hover:bg-red-500 hover:text-white'
                              } ${favoriteLoading[item.id] ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
                            >
                              {favoriteLoading[item.id] ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                              ) : (
                                <Heart
                                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                    userFavorites.includes(item.id) ? 'fill-current' : ''
                                  }`}
                                />
                              )}
                            </button>
                          )}

                          {/* Image */}
                          <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                            <img
                              src={item.pictureUrl || '/placeholder-dish.jpg'}
                              alt={item.name || 'Product'}
                               loading="lazy"
  decoding="async"
                              className="absolute inset-0 w-full h-full object-cover block transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = '/placeholder-dish.jpg';
                              }}
                            />
                          </div>

                          {/* Body */}
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <div className="mb-2 sm:mb-3 flex-grow">
                              <h3
                                className="text-base sm:text-lg font-semibold mb-2 line-clamp-2 min-h-[2.5rem]"
                                style={{ color: theme.colors.textDark }}
                              >
                                {item.name || 'Unnamed Product'}
                              </h3>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Category: {item.brandName || 'Unknown'}</span>
                                <span className="text-xs text-gray-500">Type: {item.typeName || 'Unknown'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <span className="text-lg sm:text-xl font-extrabold" style={{ color: theme.colors.orange }}>
                                ${(item.price || 0).toFixed(2)}
                              </span>
                              {item.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium">{item.rating}</span>
                                </div>
                              )}
                            </div>

                            {isUserLoggedIn && (
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                                  >
                                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                  <span className="w-6 sm:w-8 text-center font-medium text-sm">
                                    {quantities[item.id] || 1}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                                  >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 mt-auto">
                              <button
                                onClick={() => viewProduct(item.id)}
                                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-600 text-white hover:bg-gray-700 hover:scale-105 transform text-sm"
                              >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>View Product</span>
                              </button>

                              <button
                                onClick={() => addToCart(item)}
                                disabled={cartLoading[item.id]}
                                className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                                  cartSuccess[item.id]
                                    ? 'bg-green-500 text-white'
                                    : cartLoading[item.id]
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 hover:scale-105 transform'
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
                              </button>
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
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 sm:mt-12">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pageIndex - 1))}
                    disabled={pageIndex === 1 || loading}
                    className="flex items-center space-x-1 px-3 py-2 bg-white border rounded-lg shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Prev</span>
                  </button>
                  <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                    Page {pageIndex} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, pageIndex + 1))}
                    disabled={pageIndex === totalPages || loading}
                    className="flex items-center space-x-1 px-3 py-2 bg-white border rounded-lg shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
