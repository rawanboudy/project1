// src/pages/MenuPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { Star, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Eye, Heart, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: '',        label: '–– None ––' },
  { value: '1',       label: 'Price: Low → High' },
  { value: '2',       label: 'Price: High → Low' },
  { value: '0',       label: 'Name: A → Z' },
  { value: '3',       label: 'Name: Z → A' },
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

  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('');
  const [pageIndex,   setPageIndex]   = useState(1);
  const [quantities,  setQuantities]  = useState({});
  const pageSize = 12;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Enhanced helper function to ensure data is an array and handle various API response formats
const ensureArray = (data) => {
  console.log('Raw data received:', data);
  
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Check common API response patterns
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.value)) return data.value;
    
    // If it's an object with enumerable properties, convert to array
    const keys = Object.keys(data);
    if (keys.length > 0 && keys.every(key => !isNaN(key))) {
      return Object.values(data);
    }
  }
  return [];
};


  // Improved function to normalize category/type data
  const normalizeFilterData = (data, type = 'category') => {
  console.log(`Normalizing ${type} data:`, data);
  
  if (!Array.isArray(data)) {
    console.warn(`${type} data is not an array:`, data);
    return [];
  }
  
  return data.map((item, index) => {
    console.log(`Processing ${type} item:`, item);
    
    // Handle string values
    if (typeof item === 'string') {
      return { id: item, name: item, value: item };
    }
    
    // Handle object values - THIS IS THE KEY FIX
    if (item && typeof item === 'object') {
      let id, name;
      
      if (type === 'category') {
        // For categories: use id and brandName
        id = item.id || index.toString();
        name = item.brandName || item.name || `Category ${index + 1}`;
      } else if (type === 'type') {
        // For types: use id and typeName  
        id = item.id || index.toString();
        name = item.typeName || item.name || `Type ${index + 1}`;
      } else {
        // Generic fallback
        id = item.id || item.value || item.key || index.toString();
        name = item.name || item.label || item.title || item.toString();
      }
      
      console.log(`Normalized ${type}:`, { id, name, value: id });
      
      return {
        id: String(id),
        name: String(name),
        value: String(id)
      };
    }
    
    // Fallback for other types
    return {
      id: String(index),
      name: String(item || 'Unknown'),
      value: String(index)
    };
  });
};

  // Fetch products with improved error handling and debugging
  // Fixed fetchProducts function with correct API parameter names
const fetchProducts = async () => {
  setLoading(true);
  setError('');
  
  try {
    console.log('Fetching products with filters:', {
      brandId: categoryFilter,  // Changed from categoryId to brandId
      typeId: typeFilter,
      search,
      sort
    });

    // Build query parameters
    const params = new URLSearchParams();
    
    // IMPORTANT FIX: Use correct parameter names based on your API
    // Since categories are brands in your system, use BrandId instead of CategoryId
    if (categoryFilter && categoryFilter !== '') {
      params.append('BrandId', String(categoryFilter));  // Changed from CategoryId to BrandId
    }
    if (typeFilter && typeFilter !== '') {
      params.append('TypeId', String(typeFilter));
    }
    if (search && search.trim() !== '') {
      params.append('Search', search.trim());
    }
    if (sort && sort !== '') {
      params.append('Sort', String(sort));
    }
    
    // Always add pagination
    params.append('PageIndex', '1');
    params.append('PageSize', '100'); // Get more products initially

    const url = `products?${params.toString()}`;
    console.log('Final API URL:', url);

    const response = await axios.get(url);
    console.log('Products response:', response.data);

    // Handle different response structures
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

    console.log('Processed products:', fetchedProducts);
    console.log('Total count:', totalCountValue);

    // Apply client-side pagination for display
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = fetchedProducts.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
    setTotalCount(totalCountValue);
    
    // Store all products for pagination (clear previous cache for different filters)
    if (!window.allFetchedProducts) {
      window.allFetchedProducts = {};
    }
    const filterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
    window.allFetchedProducts[filterKey] = fetchedProducts;

    // Initialize quantities for new products
    const newQuantities = {};
    paginatedProducts.forEach(product => {
      if (product && product.id) {
        newQuantities[product.id] = quantities[product.id] || 1;
      }
    });
    setQuantities(prev => ({ ...prev, ...newQuantities }));

  } catch (err) {
    console.error('Error fetching products:', err);
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    setError('Failed to load products. Please try again.');
    setProducts([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};
  // Handle pagination from cached products
  const handlePageChange = (newPageIndex) => {
    const filterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
    const cachedProducts = window.allFetchedProducts?.[filterKey];
    
    if (cachedProducts) {
      const startIndex = (newPageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = cachedProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setPageIndex(newPageIndex);
      
      // Initialize quantities for products on new page
      const newQuantities = {};
      paginatedProducts.forEach(product => {
        if (product && product.id) {
          newQuantities[product.id] = quantities[product.id] || 1;
        }
      });
      setQuantities(prev => ({ ...prev, ...newQuantities }));
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback: fetch products again
      setPageIndex(newPageIndex);
      fetchProducts();
    }
  };

  // Fetch categories and types with improved handling
  useEffect(() => {
    const fetchCategoriesAndTypes = async () => {
      try {
        // Fetch categories
        console.log('Fetching categories...');
        setCategoriesLoading(true);
        const categoriesPromise = axios.get('products/categories');
        
        // Fetch types
        console.log('Fetching types...');
        setTypesLoading(true);
        const typesPromise = axios.get('products/types');

        const [categoriesResp, typesResp] = await Promise.all([categoriesPromise, typesPromise]);

        console.log('Raw Categories response:', categoriesResp.data);
        console.log('Raw Types response:', typesResp.data);

        // Process categories
        const categoryData = ensureArray(categoriesResp.data);
        const processedCategories = normalizeFilterData(categoryData, 'category');
        console.log('Processed categories:', processedCategories);
        setAllCategories(processedCategories);

        // Process types
        const typeData = ensureArray(typesResp.data);
        const processedTypes = normalizeFilterData(typeData, 'type');
        console.log('Processed types:', processedTypes);
        setAllTypes(processedTypes);

      } catch (err) {
        console.error('Error fetching categories/types:', err);
        console.error('Categories/Types error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        setAllCategories([]);
        setAllTypes([]);
        toast.error('Failed to load filters. Some features may not work properly.');
      } finally {
        setCategoriesLoading(false);
        setTypesLoading(false);
      }
    };

    fetchCategoriesAndTypes();
    fetchUserFavorites();
  }, []);

  // Fetch products whenever filters change (not pageIndex)
  useEffect(() => {
    console.log('Filter changed, fetching products...');
    fetchProducts();
  }, [categoryFilter, typeFilter, search, sort]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pageIndex !== 1) {
      console.log('Resetting to page 1 due to filter change');
      setPageIndex(1);
    }
  }, [categoryFilter, typeFilter, search, sort]);

  // Clear cached products when filters change
  useEffect(() => {
    // Clear cache when filters change to force fresh data
    if (window.allFetchedProducts) {
      const currentFilterKey = `${categoryFilter}-${typeFilter}-${search}-${sort}`;
      // Keep only current filter cache, clear others to save memory
      const currentCache = window.allFetchedProducts[currentFilterKey];
      window.allFetchedProducts = {};
      if (currentCache) {
        window.allFetchedProducts[currentFilterKey] = currentCache;
      }
    }
  }, [categoryFilter, typeFilter, search, sort]);

  // Fetch user favorites from localStorage
  const fetchUserFavorites = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        return; // User not logged in
      }

      const user = JSON.parse(userInfo);
      const favoritesKey = `favorites_${user.username || user.email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        if (Array.isArray(favorites)) {
          setUserFavorites(favorites.map(fav => fav.productId));
        }
      }
    } catch (err) {
      console.log('Error fetching favorites from localStorage:', err);
    }
  };

  // Save favorites to localStorage
  const saveFavoritesToStorage = (favorites) => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const favoritesKey = `favorites_${user.username || user.email}`;
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      }
    } catch (err) {
      console.error('Error saving favorites to localStorage:', err);
    }
  };

  // Get user's stored favorites
  const getUserStoredFavorites = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return [];
      
      const user = JSON.parse(userInfo);
      const favoritesKey = `favorites_${user.username || user.email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (err) {
      console.error('Error getting stored favorites:', err);
      return [];
    }
  };

  // Toggle favorite status (localStorage version)
  const toggleFavorite = (product) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      toast.error('Please log in to add favorites');
      return;
    }

    const productId = product.id;
    const isFavorited = userFavorites.includes(productId);
    
    setFavoriteLoading(prev => ({ ...prev, [productId]: true }));

    // Simulate async operation for better UX
    setTimeout(() => {
      try {
        const currentFavorites = getUserStoredFavorites();
        
        if (isFavorited) {
          // Remove from favorites
          const updatedFavorites = currentFavorites.filter(fav => fav.productId !== productId);
          saveFavoritesToStorage(updatedFavorites);
          setUserFavorites(prev => prev.filter(id => id !== productId));
          toast.success('Removed from favorites');
        } else {
          // Add to favorites
          const favoriteData = {
            productId: productId,
            productName: product.name,
            pictureUrl: product.pictureUrl,
            price: product.price,
            brandName: product.brandName,
            typeName: product.typeName,
            description: product.description,
            rating: product.rating,
            dateAdded: new Date().toISOString()
          };
          
          const updatedFavorites = [...currentFavorites, favoriteData];
          saveFavoritesToStorage(updatedFavorites);
          setUserFavorites(prev => [...prev, productId]);
          toast.success('Added to favorites');
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        toast.error('Failed to update favorites. Please try again.');
      } finally {
        setFavoriteLoading(prev => ({ ...prev, [productId]: false }));
      }
    }, 300); // Small delay for better UX
  };

  // Build filter lists with improved validation and debugging
const categories = useMemo(() => {
  console.log('Building categories dropdown from:', allCategories);
  
  if (!Array.isArray(allCategories)) {
    console.warn('allCategories is not an array:', allCategories);
    return [{ id: '', name: 'All Categories', value: '' }];
  }
  
  const categoryList = [
    { id: '', name: 'All Categories', value: '' },
    ...allCategories.map((category) => {
      // Categories are already normalized, just ensure proper structure
      return {
        id: category.id || category.value || '',
        name: category.name || 'Unknown Category', // This should now be brandName
        value: category.id || category.value || ''
      };
    })
  ];
  
  console.log('Final categories for dropdown:', categoryList);
  return categoryList;
}, [allCategories]);

const types = useMemo(() => {
  console.log('Building types dropdown from:', allTypes);
  
  if (!Array.isArray(allTypes)) {
    console.warn('allTypes is not an array:', allTypes);
    return [{ id: '', name: 'All Types', value: '' }];
  }
  
  const typeList = [
    { id: '', name: 'All Types', value: '' },
    ...allTypes.map((type) => {
      // Types are already normalized, just ensure proper structure  
      return {
        id: type.id || type.value || '',
        name: type.name || 'Unknown Type', // This should now be typeName
        value: type.id || type.value || ''
      };
    })
  ];
  
  console.log('Final types for dropdown:', typeList);
  return typeList;
}, [allTypes]);

  // Calculate total pages based on actual data
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle quantity changes
  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  // Navigate to product details
  const viewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Add to cart function (unchanged)
  const addToCart = async (product) => {
    const quantity = quantities[product.id] || 1;
    const productId = product.id;

    setCartLoading(prev => ({ ...prev, [productId]: true }));
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
        if (err.response?.status === 404) {
          existingCart = null;
        } else if (err.response?.status >= 500) {
          throw new Error('Server error while fetching cart');
        } else {
          existingCart = null;
        }
      }

      const newItem = {
        id: productId,
        productName: product.name,
        pictureUrl: product.pictureUrl,
        price: product.price,
        quantity: quantity
      };

      let cartData;
      
      if (existingCart && existingCart.items && Array.isArray(existingCart.items)) {
        const existingItemIndex = existingCart.items.findIndex(item => 
          item.id === productId || item.productId === productId
        );
        
        if (existingItemIndex >= 0) {
          existingCart.items[existingItemIndex].quantity += quantity;
        } else {
          existingCart.items.push(newItem);
        }
        
        cartData = {
          id: basketId,
          items: existingCart.items,
          paymentIntentId: existingCart.paymentIntentId || "",
          deliveryMethodId: existingCart.deliveryMethodId || 0,
          clientSecret: existingCart.clientSecret || "",
          shippingPrice: existingCart.shippingPrice || 0
        };
      } else {
        cartData = {
          id: basketId,
          items: [newItem],
          paymentIntentId: "",
          deliveryMethodId: 0,
          clientSecret: "",
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
        setCartSuccess(prev => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setCartSuccess(prev => ({ ...prev, [productId]: false }));
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
      
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Enhanced Filter Section with better debugging
  const FilterSection = ({ className = "", onClose = null }) => {
    // Local state for mobile filters to prevent immediate updates
    const [localSearch, setLocalSearch] = useState('');
    const [localCategoryFilter, setLocalCategoryFilter] = useState('');
    const [localTypeFilter, setLocalTypeFilter] = useState('');
    const [localSort, setLocalSort] = useState('');

    // Initialize local state only once when component mounts
    useEffect(() => {
      if (onClose) { // Mobile mode - initialize with current values
        setLocalSearch(search);
        setLocalCategoryFilter(categoryFilter);
        setLocalTypeFilter(typeFilter);
        setLocalSort(sort);
      }
    }, [onClose]);

    // Apply filters function for mobile
    const applyFilters = () => {
      console.log('Applying mobile filters:', {
        search: localSearch,
        category: localCategoryFilter,
        type: localTypeFilter,
        sort: localSort
      });
      
      setSearch(localSearch);
      setCategoryFilter(localCategoryFilter);
      setTypeFilter(localTypeFilter);
      setSort(localSort);
      if (onClose) onClose();
    };

    // Clear all filters
    const clearFilters = () => {
      console.log('Clearing all filters');
      const newValues = { search: '', category: '', type: '', sort: '' };
      
      setLocalSearch(newValues.search);
      setLocalCategoryFilter(newValues.category);
      setLocalTypeFilter(newValues.type);
      setLocalSort(newValues.sort);
      
      if (!onClose) { // Desktop mode - apply immediately
        setSearch(newValues.search);
        setCategoryFilter(newValues.category);
        setTypeFilter(newValues.type);
        setSort(newValues.sort);
      }
    };

    // Handle input changes for desktop (immediate) vs mobile (local)
    const handleSearchChange = (value) => {
      if (onClose) { // Mobile mode
        setLocalSearch(value);
      } else { // Desktop mode - apply immediately
        console.log('Desktop search change:', value);
        setSearch(value);
      }
    };

    const handleCategoryChange = (value) => {
      console.log('Category change:', value, typeof value);
      if (onClose) { // Mobile mode
        setLocalCategoryFilter(value);
      } else { // Desktop mode - apply immediately
        setCategoryFilter(value);
      }
    };

    const handleTypeChange = (value) => {
      console.log('Type change:', value, typeof value);
      if (onClose) { // Mobile mode
        setLocalTypeFilter(value);
      } else { // Desktop mode - apply immediately
        setTypeFilter(value);
      }
    };

    const handleSortChange = (value) => {
      console.log('Sort change:', value, typeof value);
      if (onClose) { // Mobile mode
        setLocalSort(value);
      } else { // Desktop mode - apply immediately
        setSort(value);
      }
    };

    // Use appropriate values based on mode
    const currentSearch = onClose ? localSearch : search;
    const currentCategory = onClose ? localCategoryFilter : categoryFilter;
    const currentType = onClose ? localTypeFilter : typeFilter;
    const currentSort = onClose ? localSort : sort;

    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 ${className}`}>
        {onClose && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!onClose && <h2 className="text-xl font-semibold mb-4">Filters</h2>}
        
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200 text-sm"
              placeholder="Search dishes..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            {categoriesLoading ? (
              <div className="w-full p-2 border rounded-md bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200 text-sm"
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {Array.isArray(categories) && categories.map((category, index) => (
                  <option key={`category-${index}-${category.id || category.value}`} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
           
          </div>
          
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            {typesLoading ? (
              <div className="w-full p-2 border rounded-md bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading types...</span>
              </div>
            ) : (
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200 text-sm"
                value={currentType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {Array.isArray(types) && types.map((type, index) => (
                  <option key={`type-${index}-${type.id || type.value}`} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            )}
           
          </div>
          
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200 text-sm"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Clear Button */}
          {!onClose && (
            <button
              onClick={clearFilters}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              Clear All Filters
            </button>
          )}

          {/* Mobile Action Buttons */}
          {onClose && (
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-500 hover:to-orange-700 transition-all duration-200 flex items-center justify-center"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
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

      {/* Proper spacing from navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <header className="relative h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Explore Our Culinary Creations
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-orange-200 max-w-xl mx-auto">
              Handcrafted dishes, curated flavors. Refine your search with our filters.
            </p>
           
          </div>
        </header>

        {/* Mobile Filter Button */}
        <div className="lg:hidden px-4 sm:px-6 -mt-8 relative z-10">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center space-x-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {/* Show active filter count */}
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 py-8 sm:py-12 lg:-mt-20">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <FilterSection />
            </div>
          </aside>

          {/* Products List */}
          <section className="lg:col-span-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-center text-sm sm:text-base">{error}</p>
              </div>
            )}

            {/* Results summary */}
            <div className="mb-4 text-sm text-gray-600 bg-white rounded-lg p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span>Showing {products.length} of {totalCount} products</span>
                {search && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Search: "{search}"
                  </span>
                )}
                {categoryFilter && categories.find(c => c.value === categoryFilter) && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Category: {categories.find(c => c.value === categoryFilter)?.name}
                  </span>
                )}
                {typeFilter && types.find(t => t.value === typeFilter) && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Type: {types.find(t => t.value === typeFilter)?.name}
                  </span>
                )}
                {sort && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                    Sort: {SORT_OPTIONS.find(s => s.value === sort)?.label}
                  </span>
                )}
              </div>
            </div>

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
                    ? "Try adjusting your filters to see more results"
                    : "We're preparing our menu. Please check back later!"
                  }
                </p>
                {(search || categoryFilter || typeFilter || sort) && (
                  <button
                    onClick={() => {
                      console.log('Clearing all filters from no results section');
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
              <motion.div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((item, idx) => {
                  // Ensure item exists and has required properties
                  if (!item || !item.id) {
                    console.warn('Invalid item found:', item);
                    return null;
                  }
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition flex flex-col h-full"
                    >
                      {/* Favorite Button */}
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

                      {/* Image */}
                      <div className="overflow-hidden h-32 sm:h-40 md:h-48 flex-shrink-0">
                        <img
                          src={item.pictureUrl || '/placeholder-dish.jpg'}
                          alt={item.name || 'Product'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = '/placeholder-dish.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 sm:p-6 flex flex-col flex-grow">
                        <div className="mb-3 sm:mb-4 flex-grow">
                          <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]" style={{ color: theme.colors.textDark }}>
                            {item.name || 'Unnamed Product'}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 min-h-[3rem] sm:min-h-[4rem]">
                            {item.description || 'No description available'}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Category: {item.brandName || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">Type: {item.typeName || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {/* Price and Rating */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
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

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
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

                        {/* Button Container */}
                        <div className="space-y-2 mt-auto">
                          {/* View Product Button */}
                          <button
                            onClick={() => viewProduct(item.id)}
                            className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-600 text-white hover:bg-gray-700 hover:scale-105 transform text-sm"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>View Product</span>
                          </button>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => addToCart(item)}
                            disabled={cartLoading[item.id]}
                            className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
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
                              <>
                                <span>Added!</span>
                              </>
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
                }).filter(Boolean)} {/* Filter out null items */}
              </motion.div>
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