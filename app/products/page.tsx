'use client';

import { useState } from 'react';
import ProductCard from '../../components/ProductCard';

const PRODUCTS = [
  {
    id: '1',
    name: 'Apple iPad Air (5th Gen) 64GB',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    category: 'Tablets',
    subcategories: ['iOS', 'Education'],
    description: 'M1 chip, 10.9" Liquid Retina display, Wi-Fi connectivity.',
    ratings: { count: 204, value: 4.8 },
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max 256GB',
    price: 54999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    category: 'Phones',
    subcategories: ['Smartphones', 'iOS'],
    description: 'Titanium design, A17 Pro chip, 48MP camera, 5x optical zoom.',
    ratings: { count: 450, value: 4.8 },
  },
  {
    id: '3',
    name: 'Dell XPS 15 9530',
    price: 89999,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    category: 'Computers',
    subcategories: ['Laptops', 'Design'],
    description: 'Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070 graphics.',
    ratings: { count: 89, value: 4.7 },
  },
  {
    id: '4',
    name: 'Samsung 65" Neo QLED 4K TV',
    price: 34999,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
    category: 'TVs',
    subcategories: ['4K', 'Smart TV'],
    description: 'Crisp 4K image with vibrant colors and immersive sound.',
    ratings: { count: 91, value: 4.6 },
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5 Headphones',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    category: 'Accessories',
    subcategories: ['Audio', 'Wireless'],
    description: 'Premium noise-cancelling headphones with long battery life.',
    ratings: { count: 176, value: 4.9 },
  },
  {
    id: '6',
    name: 'Apple Watch Series 9',
    price: 15499,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    category: 'Smart Devices',
    subcategories: ['Wearables', 'iOS'],
    description: 'Smart fitness tracking, sleek design, smooth iPhone integration.',
    ratings: { count: 132, value: 4.7 },
  },
  {
    id: '7',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 49999,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    category: 'Phones',
    subcategories: ['Smartphones', 'Android'],
    description: 'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.',
    ratings: { count: 311, value: 4.7 },
  },
  {
    id: '8',
    name: 'MacBook Pro 14" M3 Pro',
    price: 74999,
    image: 'https://images.unsplash.com/photo-1611186871525-9e8d9ce1d80c?w=800',
    category: 'Computers',
    subcategories: ['Laptops', 'macOS'],
    description: 'M3 Pro chip, 18GB RAM, stunning Liquid Retina XDR display.',
    ratings: { count: 203, value: 4.9 },
  },
  {
    id: '9',
    name: 'Samsung Galaxy Tab S9',
    price: 22999,
    image: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800',
    category: 'Tablets',
    subcategories: ['Android', 'AMOLED'],
    description: 'Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, IP68.',
    ratings: { count: 148, value: 4.6 },
  },
];

const CATEGORIES = ['All', 'Phones', 'Tablets', 'Computers', 'TVs', 'Accessories', 'Smart Devices'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = PRODUCTS
    .filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (priceMin !== '' && p.price < Number(priceMin)) return false;
      if (priceMax !== '' && p.price > Number(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.ratings.value - a.ratings.value;
      return b.ratings.count - a.ratings.count; // popular
    });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 28px 0' }}>
        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
      </h1>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: '200px', flexShrink: 0, backgroundColor: '#f9fafb', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Categories
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: selectedCategory === cat ? '#111827' : 'transparent',
                  color: selectedCategory === cat ? '#ffffff' : '#374151',
                  fontSize: '14px',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price filter */}
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
        </aside>

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', color: '#374151', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                subcategories={product.subcategories}
                description={product.description}
                ratings={product.ratings}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
