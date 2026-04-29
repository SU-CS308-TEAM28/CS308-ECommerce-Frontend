'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch() {
    const q = query.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
    else router.push('/products');
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '620px',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #d1d5db',
        borderRadius: '14px',
        padding: '0 14px',
        backgroundColor: '#ffffff',
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        style={{
          flex: 1,
          padding: '14px 10px',
          border: 'none',
          outline: 'none',
          fontSize: '15px',
          backgroundColor: 'transparent',
        }}
      />
      <span
        onClick={handleSearch}
        style={{ fontSize: '18px', color: '#6b7280', cursor: 'pointer' }}
      >
        🔍
      </span>
    </div>
  );
}
