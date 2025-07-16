// src/pages/MenuPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from '../axiosConfig';
import { Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

const SORT_OPTIONS = [
  { value: '',        label: '–– None ––' },
  { value: 'priceAsc',  label: 'Price: Low → High' },
  { value: 'priceDesc', label: 'Price: High → Low' },
  { value: 'nameAsc',   label: 'Name: A → Z' },
  { value: 'nameDesc',  label: 'Name: Z → A' },
];

export default function MenuPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('');
  const [pageIndex,   setPageIndex]   = useState(1);
  const pageSize = 8;

  // Fetch once on mount (and on every hard refresh)
  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('products')
      .then(resp => setAllProducts(resp.data.data || []))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);  // <-- empty deps means "only on mount"

  // Build unique filter lists
  const brands = useMemo(
    () => ['', ...new Set(allProducts.map(p => p.brandName))],
    [allProducts]
  );
  const types = useMemo(
    () => ['', ...new Set(allProducts.map(p => p.typeName))],
    [allProducts]
  );

  // Apply brand/type/search and sort
  const filtered = useMemo(() => {
    let arr = allProducts;
    if (brandFilter) arr = arr.filter(p => p.brandName === brandFilter);
    if (typeFilter)  arr = arr.filter(p => p.typeName  === typeFilter);
    if (search)      arr = arr.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    switch (sort) {
      case 'priceAsc':
        arr = [...arr].sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        arr = [...arr].sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        arr = [...arr].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return arr;
  }, [allProducts, brandFilter, typeFilter, search, sort]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData   = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex]);

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header className="relative h-80 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-2">
            Explore Our Culinary Creations
          </h1>
          <p className="text-lg text-orange-200 max-w-xl mx-auto">
            Handcrafted dishes, curated flavors. Refine your search with our filters.
          </p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 px-6 -mt-20">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={brandFilter}
                onChange={e => { setBrandFilter(e.target.value); setPageIndex(1); }}
              >
                {brands.map(b => (
                  <option key={b} value={b}>
                    {b || 'All Brands'}
                  </option>
                ))}
              </select>
            </div>
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPageIndex(1); }}
              >
                {types.map(t => (
                  <option key={t} value={t}>
                    {t || 'All Types'}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={sort}
                onChange={e => { setSort(e.target.value); setPageIndex(1); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                placeholder="Search dishes..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPageIndex(1); }}
              />
            </div>
          </div>
        </aside>

        {/* Products List */}
        <section className="md:col-span-4">
          {error && <p className="text-red-600 text-center mb-6">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          ) : (
            <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition"
                >
                  <div className="overflow-hidden h-48">
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between h-56">
                    <div>
                      <h3 className="text-2xl font-semibold mb-1" style={{ color: theme.colors.textDark }}>
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-extrabold" style={{ color: theme.colors.orange }}>
                        ${(item.price || 0).toFixed(2)}
                      </span>
                      <button className="px-4 py-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full text-sm font-medium hover:scale-105 transform transition">
                        Order
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {item.rating?.toFixed(1) || '–'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPageIndex(n => Math.max(1, n - 1))}
              disabled={pageIndex === 1}
              className="flex items-center space-x-1 px-3 py-1 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Prev</span>
            </button>
            <span className="font-medium">Page {pageIndex} of {totalPages}</span>
            <button
              onClick={() => setPageIndex(n => Math.min(totalPages, n + 1))}
              disabled={pageIndex === totalPages}
              className="flex items-center space-x-1 px-3 py-1 bg-white border rounded-lg shadow hover:bg-gray-50 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
