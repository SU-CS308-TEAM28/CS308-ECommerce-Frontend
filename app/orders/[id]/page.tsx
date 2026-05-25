'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type OrderStatus =
  | 'PROCESSING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

type Product = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
};

type Order = {
  id: string;
  orderDate: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
  products: Product[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function statusColor(status: OrderStatus) {
  switch (status) {
    case 'PROCESSING':
      return '#ca8a04';
    case 'IN_TRANSIT':
      return '#2563eb';
    case 'DELIVERED':
      return '#16a34a';
    case 'CANCELLED':
      return '#dc2626';
    default:
      return '#6b7280';
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

      const res = await fetch(
        `${apiBase}/api/order/${params.id}`,
        {
          credentials: 'include',
        }
      );

      const json = await res.json();

      setOrder(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px' }}>
        Could not load order.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
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
          fontWeight: 600,
          color: '#2563eb',
        }}
      >
        ← Back to profile
      </button>

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '24px',
          padding: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                marginBottom: '8px',
                color: '#111827',
              }}
            >
              Order Details
            </h1>

            <p
              style={{
                color: '#6b7280',
                fontSize: '15px',
              }}
            >
              {formatDate(order.orderDate)}
            </p>
          </div>

          <div
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              color: statusColor(order.status),
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {order.status}
          </div>
        </div>

        <div
          style={{
            marginBottom: '32px',
            padding: '20px',
            borderRadius: '18px',
            backgroundColor: '#f9fafb',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '6px',
            }}
          >
            Delivery Address
          </p>

          <p
            style={{
              fontSize: '15px',
              color: '#111827',
              fontWeight: 500,
            }}
          >
            {order.deliveryAddress}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {order.products?.map((product) => (
            <div
              key={product.productId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px',
                border: '1px solid #e5e7eb',
                borderRadius: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                }}
              >
                <img
                  src={
                    product.imageUrl ||
                    'https://placehold.co/100x100?text=Product'
                  }
                  alt={product.productName}
                  style={{
                    width: '90px',
                    height: '90px',
                    objectFit: 'cover',
                    borderRadius: '14px',
                    backgroundColor: '#f3f4f6',
                  }}
                />

                <div>
                  <p
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#111827',
                      marginBottom: '6px',
                    }}
                  >
                    {product.productName}
                  </p>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                    }}
                  >
                    Quantity: {product.quantity}
                  </p>
                </div>
              </div>

              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                ₺
                {Number(product.price).toLocaleString('tr-TR', {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
        <div
        style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '28px',
        }}
        >
        {(order.status === 'PROCESSING' ||
            order.status === 'IN_TRANSIT') && (
            <button
            style={{
                border: 'none',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
            }}
            >
            Cancel Order
            </button>
        )}

  {order.status === 'DELIVERED' && (
    <button
      style={{
        border: 'none',
        backgroundColor: '#111827',
        color: 'white',
        padding: '14px 24px',
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Request Return
    </button>
  )}
</div>

        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              padding: '24px',
              borderRadius: '18px',
              backgroundColor: '#f9fafb',
              minWidth: '260px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '10px',
              }}
            >
              Total Price
            </p>

            <p
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#111827',
              }}
            >
              ₺
              {Number(order.totalPrice).toLocaleString('tr-TR', {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}