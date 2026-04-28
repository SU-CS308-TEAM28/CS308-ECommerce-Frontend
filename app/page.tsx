'use client';

import { useEffect, useState, useRef } from 'react';
import ProductCard, { Product } from '../components/ProductCard';

function ProductSlider({ title, products, loading }: { title: string; products: Product[]; loading: boolean }) {
  const [slide, setSlide] = useState(0);
  const ITEMS_PER_SLIDE = 4;
  const MAX_SLIDES = 3;

  const items = loading
    ? Array(ITEMS_PER_SLIDE).fill(undefined)
    : products.slice(0, ITEMS_PER_SLIDE * MAX_SLIDES);

  const totalSlides = loading ? 1 : Math.min(Math.ceil(items.length / ITEMS_PER_SLIDE), MAX_SLIDES);
  const currentItems = items.slice(slide * ITEMS_PER_SLIDE, slide * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE);

  return (
    <section style={{ marginTop: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        {totalSlides > 1 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              disabled={slide === 0}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e5e7eb',
                backgroundColor: slide === 0 ? '#f9fafb' : '#111827',
                color: slide === 0 ? '#9ca3af' : '#fff',
                cursor: slide === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
            <button
              onClick={() => setSlide((s) => Math.min(totalSlides - 1, s + 1))}
              disabled={slide === totalSlides - 1}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e5e7eb',
                backgroundColor: slide === totalSlides - 1 ? '#f9fafb' : '#111827',
                color: slide === totalSlides - 1 ? '#9ca3af' : '#fff',
                cursor: slide === totalSlides - 1 ? 'not-allowed' : 'pointer',
                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {currentItems.map((product, i) => (
          <ProductCard key={product?.id ?? i} product={product} />
        ))}
      </div>

      {totalSlides > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: i === slide ? '#111827' : '#d1d5db',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s ease, background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const [popularRes, discountedRes] = await Promise.all([
          fetch('/api/product/products?page=0&size=12&sort=ratings.value&order=desc'),
          fetch('/api/product/products?page=0&size=12&sort=activeDiscount&order=desc'),
        ]);
        const popularJson = await popularRes.json();
        const discountedJson = await discountedRes.json();

        const toArray = (json: any): Product[] => {
          const products = json?.data?.products;
          if (Array.isArray(products)) return products;
          return [];
        };

        setPopularProducts(toArray(popularJson));
        setDiscountedProducts(toArray(discountedJson).filter((p: Product) => p.activeDiscount > 0));
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', backgroundColor: '#ffffff' }}>
      {/* Hero Banner */}
      <section
        style={{
          height: '360px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px',
          color: '#ffffff',
          overflow: 'hidden',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '520px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#93c5fd', margin: '0 0 12px 0' }}>
            NEW SEASON DEALS
          </p>
          <h1 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 16px 0' }}>
            Discover the Best Tech for Everyday Life
          </h1>
          <p style={{ fontSize: '16px', color: '#dbeafe', margin: '0 0 24px 0' }}>
            Explore premium devices and exclusive discounts.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.href = '/products'}
              style={{ padding: '14px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#ffffff', color: '#111827', fontWeight: 700, cursor: 'pointer' }}
            >
              Shop Now
            </button>
            <button
              onClick={() => window.location.href = '/products'}
              style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: '#ffffff', cursor: 'pointer' }}
            >
              View Offers
            </button>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000"
          alt="Featured product"
          style={{ maxHeight: '280px', borderRadius: '18px' }}
        />
      </section>

      <ProductSlider title="Popular Items" products={popularProducts} loading={loading} />
      <ProductSlider title="Discounted Items" products={discountedProducts} loading={loading} />

      {/* Footer */}
      <footer
        style={{
          marginTop: '64px',
          padding: '24px 0 40px 0',
          borderTop: '1px solid #e5e7eb',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span>© 2026 TeknoCS. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '18px' }}>
          <span style={{ cursor: 'pointer' }}>Contact</span>
        </div>
      </footer>
    </div>
  );
}
