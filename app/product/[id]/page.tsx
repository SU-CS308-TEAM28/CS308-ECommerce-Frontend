'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../../components/ProductCard';
import { useAuth } from '../../../context/AuthContext';

function SkeletonDetail() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .sk {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        <div>
          <div className="sk" style={{ height: '420px', borderRadius: '20px', marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            {[1,2,3].map(i => <div key={i} className="sk" style={{ width: '72px', height: '72px', borderRadius: '12px' }} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="sk" style={{ height: '16px', width: '80px' }} />
          <div className="sk" style={{ height: '36px', width: '100%' }} />
          <div className="sk" style={{ height: '36px', width: '70%' }} />
          <div className="sk" style={{ height: '20px', width: '140px' }} />
          <div className="sk" style={{ height: '48px', width: '180px' }} />
          <div className="sk" style={{ height: '56px', width: '100%', borderRadius: '14px' }} />
          <div className="sk" style={{ height: '16px', width: '100%' }} />
          <div className="sk" style={{ height: '16px', width: '90%' }} />
          <div className="sk" style={{ height: '16px', width: '80%' }} />
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number | null | undefined }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (stock === null || stock === undefined) return null;

  const isOut = stock === 0;
  const isLow = stock > 0 && stock <= 5;
  const isOk = stock > 5;

  const color = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#16a34a';
  const bgColor = isOut ? '#fef2f2' : isLow ? '#fefce8' : '#f0fdf4';
  const label = isOut ? 'Out of Stock' : isLow ? 'Running out of stock' : 'In Stock';
  const tooltipText = isOut
    ? 'This product is currently out of stock.'
    : `Currently there are ${stock} items left.`;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: bgColor,
          color: color,
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '8px' }}>●</span>
        {label}
      </span>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '130%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          {tooltipText}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1f2937 transparent transparent transparent',
          }} />
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        const p: Product = json?.data;
        if (!p) { setNotFound(true); return; }
        setProduct(p);
        const allImages = Array.from(new Set([
          ...(p.thumbnailUrl ? [p.thumbnailUrl] : []),
          ...(p.imageUrls ?? []),
        ]));
        setSelectedImage(allImages[0] ?? null);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <SkeletonDetail />;

  if (notFound || !product) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '64px', margin: '0 0 16px 0' }}>📦</p>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>Product not found</h1>
        <button
          onClick={() => router.push('/products')}
          style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '15px', cursor: 'pointer' }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  const allImages = Array.from(new Set([
    ...(product.thumbnailUrl ? [product.thumbnailUrl] : []),
    ...(product.imageUrls ?? []),
  ]));

  const discountedPrice = product.activeDiscount > 0
    ? product.price * (1 - product.activeDiscount / 100)
    : null;

  const isOutOfStock = product.stock !== null && product.stock !== undefined && product.stock === 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', marginBottom: '32px', padding: 0 }}
      >
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'flex-start' }}>

        {/* Left — Images */}
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
            <img
              src={selectedImage || 'https://via.placeholder.com/600x420?text=No+Image'}
              alt={product.name}
              style={{
                width: '100%', height: '420px', objectFit: 'cover', display: 'block',
                filter: isOutOfStock ? 'grayscale(60%)' : 'none',
              }}
            />
          </div>

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {allImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '72px', height: '72px', borderRadius: '12px', overflow: 'hidden',
                    border: selectedImage === img ? '2px solid #111827' : '2px solid #e5e7eb',
                    cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.15s',
                  }}
                >
                  <img src={img} alt={`view-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Category + Name + Rating */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {product.category}
            </p>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0', lineHeight: 1.3 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 700 }}>★ {product.ratings?.value ?? '—'}</span>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>({product.ratings?.count ?? 0} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div>
            {discountedPrice ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: '#111827' }}>
                  ₺{discountedPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </span>
                <span style={{ fontSize: '22px', color: '#9ca3af', textDecoration: 'line-through' }}>
                  ₺{product.price.toLocaleString('tr-TR')}
                </span>
                <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                  -{product.activeDiscount}%
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '38px', fontWeight: 800, color: '#111827' }}>
                ₺{product.price.toLocaleString('tr-TR')}
              </span>
            )}
          </div>

          {/* Stock Badge */}
          <StockBadge stock={product.stock} />

          {/* Add to Cart */}
          {isOutOfStock ? (
            <div>
              <button disabled style={{
                width: '100%', padding: '16px 24px', borderRadius: '14px', border: 'none',
                backgroundColor: '#d1d5db', color: '#9ca3af', fontSize: '16px', fontWeight: 700,
                cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}>
                🚫 Out of Stock
              </button>
            </div>
          ) : (
            <button style={{
              padding: '16px 24px', borderRadius: '14px', border: 'none',
              backgroundColor: '#111827', color: '#fff', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%',
            }}>
              🛒 Add to Cart
            </button>
          )}

          {/* Description */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>Description</h3>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.8, margin: 0 }}>{product.description}</p>
          </div>

          {/* Specifications */}
          {product.extraProps && product.extraProps.length > 0 && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Specifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {product.extraProps.map((prop, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '160px 1fr',
                    padding: '12px 0', borderBottom: '1px solid #f3f4f6',
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{prop.label}</span>
                    <span style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Product Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.model && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Model</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{product.model}</span>
                </div>
              )}
              {product.serialNumber && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Serial Number</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{product.serialNumber}</span>
                </div>
              )}
              {product.warrantyStatus && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Warranty</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{product.warrantyStatus}</span>
                </div>
              )}
              {product.distributorInformation && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Distributor</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{product.distributorInformation}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
