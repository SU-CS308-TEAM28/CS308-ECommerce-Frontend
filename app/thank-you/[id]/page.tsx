'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type CartProduct = {
  productId: string;
  name: string;
  quantity: number;
  thumbnailUrl: string | null;
  price: number;
  activeDiscount: number;
  stock: number;
};

type Order = {
  id: string;
  orderDate: string;
  products: CartProduct[];
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  isCompleted: boolean;
  isCancelled: boolean;
};

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/order/${id}`, { credentials: 'include' });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data) {
          setError('Order could not be loaded.');
          return;
        }
        setOrder(json.data);
      } catch {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: '15px' }}>{error || 'Order not found.'}</p>
        <button
          onClick={() => router.push('/')}
          style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '15px', cursor: 'pointer' }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  const normalTotal = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discountedTotal = order.products.reduce((sum, p) => {
    const discounted = p.activeDiscount > 0 ? p.price * (1 - p.activeDiscount / 100) : p.price;
    return sum + discounted * p.quantity;
  }, 0);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Success Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '36px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', margin: '0 0 8px 0' }}>
          Thank You for Your Order!
        </h1>
        <p style={{ fontSize: '15px', color: '#166534', margin: '0 0 6px 0' }}>
          Your order is now being processed.
        </p>
        <p style={{ fontSize: '14px', color: '#4ade80', margin: 0 }}>
          Your invoice will be sent to your email address.
        </p>
      </div>

      {/* Order Details */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Here is Your Order</h2>
          <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Order Meta */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {order.orderDate && (
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Date: </span>
              {new Date(order.orderDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Status: </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 10px', borderRadius: '20px',
              backgroundColor: '#fefce8', color: '#a16207',
              fontSize: '12px', fontWeight: 600,
            }}>
              ● Processing
            </span>
          </div>
          {order.deliveryAddress && (
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>Address: </span>
              {order.deliveryAddress}
            </div>
          )}
        </div>

        {/* Product List */}
        <div style={{ borderTop: '1px solid #e5e7eb' }}>
          {order.products.map((item, i) => {
            const discountedPrice = item.activeDiscount > 0
              ? item.price * (1 - item.activeDiscount / 100)
              : item.price;

            return (
              <div
                key={item.productId ?? i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid #f3f4f6',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <img
                    src={item.thumbnailUrl || '/MainLogo.png'}
                    alt={item.name}
                    style={{
                      width: '52px', height: '52px', objectFit: 'contain',
                      border: '1px solid #e5e7eb', borderRadius: '8px',
                      padding: '4px', backgroundColor: '#fff', flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {item.activeDiscount > 0 && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through', margin: '0 0 2px 0' }}>
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </p>
                  )}
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    ₺{(discountedPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {normalTotal !== discountedTotal && (
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              Normal Price: <span style={{ textDecoration: 'line-through' }}>₺{normalTotal.toFixed(2)}</span>
            </div>
          )}
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
            Total: ₺{discountedTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          Continue Shopping
        </button>
        <button
          onClick={() => router.push('/profile')}
          style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}
        >
          View Orders
        </button>
      </div>
    </div>
  );
}
