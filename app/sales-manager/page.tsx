'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

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
  userId: string;
  orderDate: string;
  products: CartProduct[];
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  isCompleted: boolean;
  isCancelled: boolean;
};

const STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'Processing', color: '#f59e0b', bg: '#fefce8' },
  { value: 'IN_TRANSIT', label: 'In Transit', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'DELIVERED', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) ?? { label: status, color: '#6b7280', bg: '#f9fafb' };
}

export default function SalesManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'delivery'>('delivery');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateStatusOrder, setUpdateStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    if (user && user.userType !== 'sales_manager') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/order/orders', { credentials: 'include' });
      const json = await res.json();
      const all: Order[] = json?.data ?? [];
      // Show only PROCESSING orders
      setOrders(all.filter(o => o.status === 'PROCESSING' && !o.isCancelled));
    } catch {} finally {
      setLoadingOrders(false);
    }
  }

  async function handleUpdateStatus() {
    if (!updateStatusOrder || !newStatus) return;
    setUpdateLoading(true);
    setUpdateSuccess('');
    try {
      const res = await fetch(`/api/order/${updateStatusOrder.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUpdateSuccess('Status updated successfully!');
        setOrders(prev => prev.filter(o => o.id !== updateStatusOrder.id));
        setTimeout(() => {
          setUpdateStatusOrder(null);
          setUpdateSuccess('');
          setNewStatus('');
        }, 1500);
      } else {
        const json = await res.json();
        alert(json?.message || 'Failed to update status.');
      }
    } catch {
      alert('Could not connect to server.');
    } finally {
      setUpdateLoading(false);
    }
  }

  if (!user || user.userType !== 'sales_manager') {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>🔒</p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>This page is only accessible to Sales Managers.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)', backgroundColor: '#f9fafb' }}>

      {/* Side Panel */}
      <aside style={{
        width: '220px', flexShrink: 0, backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb', padding: '32px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>
          Sales Manager
        </p>
        <button
          onClick={() => setActivePanel('delivery')}
          style={{
            padding: '10px 14px', borderRadius: '10px', border: 'none', textAlign: 'left',
            backgroundColor: activePanel === 'delivery' ? '#111827' : 'transparent',
            color: activePanel === 'delivery' ? '#ffffff' : '#374151',
            fontSize: '14px', fontWeight: activePanel === 'delivery' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          🚚 Delivery
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Processing Orders
          </h1>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {loadingOrders ? (
          <p style={{ color: '#6b7280' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>📦</p>
            <p style={{ fontSize: '15px', margin: 0 }}>No processing orders at the moment.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Order ID', 'Date', 'Address', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: i < orders.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '180px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.deliveryAddress || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        ₺{order.totalPrice?.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '20px',
                          backgroundColor: statusStyle.bg, color: statusStyle.color,
                          fontSize: '12px', fontWeight: 600,
                        }}>
                          ● {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { setUpdateStatusOrder(order); setNewStatus(''); }}
                          style={{
                            padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff', color: '#374151', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '560px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Order #{selectedOrder.id.slice(-8).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Date: </span>
                {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('tr-TR') : '—'}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Address: </span>
                {selectedOrder.deliveryAddress || '—'}
              </div>
            </div>

            {/* Product List */}
            <div style={{ borderTop: '1px solid #e5e7eb' }}>
              {(selectedOrder.products ?? []).map((item, i) => {
                const discountedPrice = item.activeDiscount > 0
                  ? item.price * (1 - item.activeDiscount / 100)
                  : item.price;
                return (
                  <div key={item.productId ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <img
                        src={item.thumbnailUrl || '/MainLogo.png'}
                        alt={item.name}
                        style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '2px', backgroundColor: '#fff', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {item.activeDiscount > 0 && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through', margin: '0 0 2px 0' }}>
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                        ₺{(discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              Total: ₺{selectedOrder.totalPrice?.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateStatusOrder && (
        <div
          onClick={() => { setUpdateStatusOrder(null); setUpdateSuccess(''); setNewStatus(''); }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Update Order Status</h3>
              <button onClick={() => { setUpdateStatusOrder(null); setUpdateSuccess(''); setNewStatus(''); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>

            {updateSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>✅</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>{updateSuccess}</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  Order #{updateStatusOrder.id.slice(-8).toUpperCase()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewStatus(opt.value)}
                      style={{
                        padding: '12px 16px', borderRadius: '10px',
                        border: newStatus === opt.value ? `2px solid ${opt.color}` : '1px solid #e5e7eb',
                        backgroundColor: newStatus === opt.value ? opt.bg : '#ffffff',
                        color: newStatus === opt.value ? opt.color : '#374151',
                        fontSize: '14px', fontWeight: newStatus === opt.value ? 700 : 400,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      ● {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || updateLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    backgroundColor: !newStatus || updateLoading ? '#d1d5db' : '#111827',
                    color: !newStatus || updateLoading ? '#9ca3af' : '#fff',
                    fontSize: '15px', fontWeight: 700,
                    cursor: !newStatus || updateLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {updateLoading ? 'Updating...' : 'Update Status'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
