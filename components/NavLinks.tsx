'use client';

import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Computers', href: '/products?c=computers' },
  { label: 'Tablets', href: '/products?c=tablets' },
  { label: 'Phones', href: '/products?c=phones' },
  { label: 'TVs', href: '/products?c=tvs' },
  { label: 'Home & Living', href: '/products?c=home' },
  { label: 'Browse', href: '/products' },
];

export default function NavLinks() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '28px',
        flexWrap: 'wrap',
        fontSize: '16px',
        fontWeight: 500,
      }}
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          style={{
            cursor: 'pointer',
            color: hovered === link.href ? '#2563eb' : '#111827',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={() => setHovered(link.href)}
          onMouseLeave={() => setHovered(null)}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
