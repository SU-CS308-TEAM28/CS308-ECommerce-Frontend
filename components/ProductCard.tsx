'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  activeDiscount: number;
  model: string;
  serialNumber: string;
  warrantyStatus: string;
  distributorInformation: string;
  thumbnailUrl: string | null;
  imageUrls: string[];
  category: string;
  subcategories: string[];
  stock: number | null;
  ratings: {
    count: number;
    value: number;
  };
  extraProps: { label: string; value: string }[];
};

type ProductCardProps = {
  product?: Product;
};

function SkeletonCard() {
  return (
    <div
      style={{
        width: '280px',
        minHeight: '480px',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
      `}</style>
      <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: '14px' }} />
      <div className="skeleton" style={{ width: '60px', height: '14px' }} />
      <div className="skeleton" style={{ width: '100%', height: '22px' }} />
      <div className="skeleton" style={{ width: '80%', height: '22px' }} />
      <div className="skeleton" style={{ width: '100%', height: '14px' }} />
      <div className="skeleton" style={{ width: '70%', height: '14px' }} />
      <div className="skeleton" style={{ width: '40%', height: '14px' }} />
      <div style={{ flex: 1 }} />
      <div className="skeleton" style={{ width: '80px', height: '20px' }} />
      <div className="skeleton" style={{ width: '120px', height: '28px' }} />
      <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  if (!product) return <SkeletonCard />;

  const fallbackImage = 'https://via.placeholder.com/400x260?text=No+Image';
  const image = product.thumbnailUrl || (product.imageUrls?.[0] ?? null);
  const discountedPrice =
    product.activeDiscount > 0
      ? product.price * (1 - product.activeDiscount / 100)
      : null;

  const isOutOfStock = product.stock !== null && product.stock !== undefined && product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiBase}/api/user/shopping-cart/add`, {
        method: 'POST',
        credentials: 'include', // sends _TCS_AUTH and _TCS_CART cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const payload = await response.json().catch(() => null);


      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to add item to cart');
      }

      router.push('/shopping-cart');
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isWishlisting) return;

    setIsWishlisting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
      const response = await fetch(`${apiBase}/api/user/wishlist/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        setWishlisted(true);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Add to wishlist failed:', err);
    } finally {
      setIsWishlisting(false);
    }
  };

  const buttonDisabled = isOutOfStock || isAdding;

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      style={{
        width: '280px',
        minHeight: '480px',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        opacity: isOutOfStock ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (isOutOfStock) return;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.18)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <img
            src={image || fallbackImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              borderRadius: '14px',
              display: 'block',
              filter: isOutOfStock ? 'grayscale(60%)' : 'none',
            }}
          />
          <button
            onClick={handleAddToWishlist}
            disabled={isWishlisting || wishlisted}
            title={wishlisted ? 'Added to wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              fontSize: '18px',
              cursor: isWishlisting || wishlisted ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s, box-shadow 0.15s',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              if (!wishlisted && !isWishlisting) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.22)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
            }}
          >
            {wishlisted ? '❤️' : isWishlisting ? '⏳' : '🤍'}
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
          {product.category}
        </p>

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 10px 0',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: '14px',
            color: '#4b5563',
            margin: '0 0 12px 0',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px',
            color: '#f59e0b',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          <span>★</span>
          <span>{product.ratings?.value ?? '—'}</span>
          <span style={{ color: '#9ca3af', fontWeight: 400 }}>
            ({product.ratings?.count ?? 0})
          </span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {discountedPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
                ₺{discountedPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#9ca3af', margin: 0, textDecoration: 'line-through' }}>
                ₺{product.price.toLocaleString('tr-TR')}
              </p>
              <span style={{
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '8px',
              }}>
                -{product.activeDiscount}%
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
              ₺{product.price.toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={buttonDisabled}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: isOutOfStock ? '#d1d5db' : isAdding ? '#6b7280' : '#374151',
          color: isOutOfStock ? '#9ca3af' : '#ffffff',
          fontSize: '15px',
          fontWeight: 600,
          cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '20px' }}>
          {isOutOfStock ? '🚫' : isAdding ? '⏳' : '🛒'}
        </span>
        <span>
          {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding…' : 'Add to Cart'}
        </span>
      </button>
    </div>
  );
}