'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { Product } from '../../components/ProductCard';

type CategoryOption = { label: string; value: string };

function getInitialCategory(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('c') ?? '';
}

function getInitialSearch(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('q') ?? '';
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [page] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>([{ label: 'All', value: '' }]);
  const PAGE_SIZE = 12;

  // Fetch categories from backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/product/category/list');
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        const primaryCategories: CategoryOption[] = data
          .filter((c: any) => c.isPrimitive)
          .map((c: any) => ({ label: c.label, value: c.abbrv }));
        setCategories([{ label: 'All', value: '' }, ...primaryCategories]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Read URL params on mount
  useEffect(() => {
    setSelectedCategory(getInitialCategory());
    setSearchQuery(getInitialSearch());
  }, [searchParams]);

  const getSortParams = () => {
    if (sortBy === 'price_asc') return { sort: 'price', order: 'asc' };
    if (sortBy === 'price_desc') return { sort: 'price', order: 'desc' };
    return { sort: 'ratings.count', order: 'desc' };
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { sort, order } = getSortParams();
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort,
        order,
      });
      if (searchParams.get('c')) params.set('category', searchParams.get('c')!);
      if (searchParams.get('q')) params.set('search', searchParams.get('q')!);
      if (priceMin !== '') params.set('minPrice', priceMin);
      if (priceMax !== '') params.set('maxPrice', priceMax);

      const res = await fetch(`/api/product/products?${params.toString()}`);
      const json = await res.json();

      const raw = json?.data?.products;
      const arr: Product[] = Array.isArray(raw) ? raw : [];

      setProducts(arr);
      setTotalCount(arr.length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy, priceMin, priceMax, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.delete('q');
      url.searchParams.set('c', value);
    } else {
      url.searchParams.delete('c');
    }
    router.push(url.toString());
  };

  const categoryLabel = categories.find((c) => c.value === selectedCategory)?.label ?? 'All';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 28px 0' }}>
        {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === '' ? 'All Products' : categoryLabel}
      </h1>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: '200px', flexShrink: 0, backgroundColor: '#f9fafb', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Categories
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: selectedCategory === cat.value ? '#111827' : 'transparent',
                  color: selectedCategory === cat.value ? '#ffffff' : '#374151',
                  fontSize: '14px',
                  fontWeight: selectedCategory === cat.value ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {(searchParams.get('q')) !== null || (searchParams.get('c')) !== null && (
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Price (₺)
              </p>
              <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '8px', outline: 'none', boxSizing: 'border-box' }}
            />
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          )}
        </aside>

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', color: '#374151', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {loading
              ? Array(8).fill(undefined).map((_, i) => <ProductCard key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
