'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type OrderStatus = 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

type Product = {
  productId?: string;
  id?: string;
  name?: string;
  productName?: string;
  title?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  image?: string;
  images?: string[];
};

type Order = {
  id: string;
  orderDate: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
  products: Product[];
  isCompleted?: boolean;
  isCancelled?: boolean;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(value: number) {
  return `₺${Number(value ?? 0).toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
  })}`;
}

function getProductId(product: Product) {
  return product.productId || product.id || '';
}

function getProductName(product: Product) {
  return product.productName || product.name || product.title || 'Product';
}

function getProductImage(product: Product) {
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  return 'https://placehold.co/100x100?text=Product';
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case 'PROCESSING':
      return { bg: '#fefce8', fg: '#a16207', label: 'Processing' };
    case 'IN_TRANSIT':
      return { bg: '#eff6ff', fg: '#1d4ed8', label: 'In Transit' };
    case 'DELIVERED':
      return { bg: '#f0fdf4', fg: '#15803d', label: 'Delivered' };
    case 'CANCELLED':
      return { bg: '#fef2f2', fg: '#b91c1c', label: 'Cancelled' };
    default:
      return { bg: '#f3f4f6', fg: '#374151', label: String(status) };
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = String(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  const selectedReturnProducts = useMemo(() => {
    return Object.entries(returnQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));
  }, [returnQuantities]);

  const canSubmitReturn =
    selectedReturnProducts.length > 0 &&
    returnReason.trim().length > 0 &&
    !actionLoading;

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    setLoading(true);
    setActionError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

      const res = await fetch(`${apiBase}/api/order/${orderId}`, {
        credentials: 'include',
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Could not load order.');
      }

      setOrder(json?.data ?? null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load order.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

      const res = await fetch(`${apiBase}/api/order/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Could not cancel order.');
      }

      setOrder(json?.data ?? order);
      setActionSuccess('Order cancelled successfully.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not cancel order.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitReturn() {
    if (!canSubmitReturn) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

      const res = await fetch(`${apiBase}/api/return/request`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          returningProducts: selectedReturnProducts,
          reason: returnReason.trim(),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || 'Could not submit return request.');
      }

      setShowReturnModal(false);
      setReturnReason('');
      setReturnQuantities({});
      setReturnSubmitted(true);
      setActionSuccess('Return request submitted successfully.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not submit return request.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading order...</div>;
  }

  if (!order) {
    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => router.push('/profile')}
          style={{
            border: 'none',
            background: 'none',
            color: '#2563eb',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Back to profile
        </button>

        <div
          style={{
            padding: '24px',
            borderRadius: '18px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            fontWeight: 600,
          }}
        >
          {actionError || 'Could not load order.'}
        </div>
      </div>
    );
  }

  const effectiveStatus = (order as any).cancelled || order.isCancelled? 'CANCELLED': order.status;

  const s = statusStyle(effectiveStatus as OrderStatus);

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <button
        onClick={() => router.push('/profile')}
        style={{
          marginBottom: '24px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 700,
          color: '#2563eb',
        }}
      >
        ← Back to profile
      </button>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Order #{order.id.slice(-6).toUpperCase()}
            </p>

            <h1
              style={{
                fontSize: '34px',
                fontWeight: 900,
                margin: '0 0 8px 0',
                color: '#111827',
              }}
            >
              Order Details
            </h1>

            <p
              style={{
                color: '#6b7280',
                fontSize: '15px',
                margin: 0,
              }}
            >
              {formatDate(order.orderDate)}
            </p>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '999px',
              backgroundColor: s.bg,
              color: s.fg,
              fontWeight: 800,
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '9px' }}>●</span>
            {s.label}
          </span>
        </div>

        {actionError && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {actionSuccess}
          </div>
        )}

        <div
          style={{
            marginBottom: '32px',
            padding: '22px',
            borderRadius: '20px',
            backgroundColor: '#f9fafb',
            border: '1px solid #eef2f7',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: '0 0 8px 0',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Delivery Address
          </p>

          <p
            style={{
              fontSize: '15px',
              color: '#111827',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {order.deliveryAddress || 'No delivery address'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {order.products?.map((product, index) => {
            const productId = getProductId(product) || `product-${index}`;
            const productName = getProductName(product);
            const productImage = getProductImage(product);

            return (
              <div
                key={productId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  padding: '18px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    minWidth: 0,
                  }}
                >
                  <img
                    src={productImage}
                    alt={productName}
                    style={{
                      width: '92px',
                      height: '92px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: '#111827',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {productName}
                    </p>

                    <p
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0,
                      }}
                    >
                      Quantity: {product.quantity}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPrice(product.price)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '24px',
            marginTop: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            {(effectiveStatus === 'PROCESSING' || effectiveStatus === 'IN_TRANSIT') && (
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading}
                style={{
                  border: 'none',
                  backgroundColor: actionLoading ? '#fca5a5' : '#dc2626',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}

            {effectiveStatus === 'DELIVERED' && !returnSubmitted && (
              <button
                onClick={() => setShowReturnModal(true)}
                disabled={actionLoading}
                style={{
                  border: 'none',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Request Return
              </button>
            )}
            {effectiveStatus === 'DELIVERED' && returnSubmitted && (
  <div
    style={{
      padding: '14px 20px',
      borderRadius: '14px',
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      fontSize: '15px',
      fontWeight: 800,
    }}
  >
    Return request submitted
  </div>
)}
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              backgroundColor: '#f9fafb',
              border: '1px solid #eef2f7',
              minWidth: '280px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 10px 0',
                fontWeight: 700,
              }}
            >
              Total Price
            </p>

            <p
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#111827',
                margin: 0,
              }}
            >
              {formatPrice(order.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {showReturnModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '760px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              boxShadow: '0 24px 70px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '28px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: '#111827',
                    margin: '0 0 8px 0',
                  }}
                >
                  Request Return
                </h2>

                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0,
                  }}
                >
                  Select products and quantities to return.
                </p>
              </div>

              <button
                onClick={() => setShowReturnModal(false)}
                disabled={actionLoading}
                style={{
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '24px',
                  color: '#374151',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {order.products?.map((product, index) => {
                const productId = getProductId(product) || `product-${index}`;
                const productName = getProductName(product);
                const productImage = getProductImage(product);
                const selectedQuantity = returnQuantities[productId] || 0;

                return (
                  <div
                    key={productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '18px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '18px',
                      backgroundColor: selectedQuantity > 0 ? '#f9fafb' : '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        minWidth: 0,
                      }}
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 800,
                            color: '#111827',
                            margin: '0 0 6px 0',
                            fontSize: '15px',
                          }}
                        >
                          {productName}
                        </p>

                        <p
                          style={{
                            color: '#6b7280',
                            fontSize: '14px',
                            margin: 0,
                          }}
                        >
                          Max quantity: {product.quantity}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [productId]: Math.max(0, selectedQuantity - 1),
                          }))
                        }
                        disabled={actionLoading || selectedQuantity === 0}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '12px',
                          border: '1px solid #d1d5db',
                          backgroundColor: selectedQuantity === 0 ? '#f3f4f6' : '#ffffff',
                          cursor:
                            actionLoading || selectedQuantity === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 900,
                        }}
                      >
                        -
                      </button>

                      <span
                        style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontWeight: 900,
                          color: '#111827',
                        }}
                      >
                        {selectedQuantity}
                      </span>

                      <button
                        onClick={() =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [productId]: Math.min(product.quantity, selectedQuantity + 1),
                          }))
                        }
                        disabled={actionLoading || selectedQuantity >= product.quantity}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '12px',
                          border: '1px solid #d1d5db',
                          backgroundColor:
                            selectedQuantity >= product.quantity ? '#f3f4f6' : '#ffffff',
                          cursor:
                            actionLoading || selectedQuantity >= product.quantity
                              ? 'not-allowed'
                              : 'pointer',
                          fontWeight: 900,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '26px' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 800,
                  marginBottom: '10px',
                  color: '#111827',
                }}
              >
                Reason
              </label>

              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please explain the reason for your return request..."
                disabled={actionLoading}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  borderRadius: '18px',
                  border: '1px solid #d1d5db',
                  padding: '16px',
                  fontSize: '15px',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#111827',
                }}
              />
            </div>

            <button
              onClick={handleSubmitReturn}
              disabled={!canSubmitReturn}
              style={{
                marginTop: '24px',
                width: '100%',
                border: 'none',
                backgroundColor: canSubmitReturn ? '#111827' : '#e5e7eb',
                color: canSubmitReturn ? '#ffffff' : '#9ca3af',
                padding: '16px',
                borderRadius: '18px',
                fontSize: '16px',
                fontWeight: 900,
                cursor: canSubmitReturn ? 'pointer' : 'not-allowed',
              }}
            >
              {actionLoading ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}