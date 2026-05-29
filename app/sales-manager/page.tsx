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

type Product = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  price: number;
  activeDiscount: number;
  category: string;
  stock: number;
};

type Panel = 'pricing' | 'orders';

const ALL_STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'Processing', color: '#f59e0b', bg: '#fefce8' },
  { value: 'IN_TRANSIT', label: 'In Transit', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'DELIVERED', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
];

const DELIVERY_STATUS_OPTIONS = ALL_STATUS_OPTIONS.filter(s => s.value !== 'PROCESSING');

function getStatusStyle(status: string) {
  return ALL_STATUS_OPTIONS.find(s => s.value === status) ?? { label: status, color: '#6b7280', bg: '#f9fafb' };
}

export default function SalesManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>('pricing');

  // Pricing
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pricingMode, setPricingMode] = useState<'price' | 'discount'>('price');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkDiscount, setBulkDiscount] = useState('');
  const [singlePriceProduct, setSinglePriceProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState('');
  const [priceError, setPriceError] = useState('');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);


  useEffect(() => {
    if (activePanel === 'pricing') fetchProducts();
    if (activePanel === 'orders') fetchOrders();
  }, [activePanel]);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/product/products?page=0&size=100&sort=name&order=asc', { credentials: 'include' });
      const json = await res.json();
      setProducts(json?.data?.products ?? []);
    } catch {} finally { setLoadingProducts(false); }
  }

  async function fetchOrders(start?: string, end?: string) {
    setLoadingOrders(true);
    try {
      let url = '/api/order/orders';
      const params: string[] = [];
      if (start) params.push(`start=${new Date(start).getTime()}`);
      if (end) params.push(`end=${new Date(end).getTime()}`);
      else if (start) params.push(`end=${Date.now()}`);
      if (params.length) url += '?' + params.join('&');
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setOrders(json?.data ?? []);
    } catch {} finally { setLoadingOrders(false); }
  }

  async function handleUpdatePrice() {
    if (!singlePriceProduct) return;
    setPriceLoading(true); setPriceError(''); setPriceSuccess('');
    try {
      const body = {
        name: singlePriceProduct.name,
        price: pricingMode === 'price' ? parseFloat(newPrice) : singlePriceProduct.price,
        activeDiscount: pricingMode === 'discount' ? parseFloat(newDiscount) : singlePriceProduct.activeDiscount,
        category: singlePriceProduct.category,
        stock: singlePriceProduct.stock,
        subcategories: [],
        extraProps: [],
      };
      const res = await fetch(`/api/product/${singlePriceProduct.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setPriceSuccess('Updated successfully!');
        setProducts(prev => prev.map(p => p.id === singlePriceProduct.id ? {
          ...p,
          price: pricingMode === 'price' ? parseFloat(newPrice) : p.price,
          activeDiscount: pricingMode === 'discount' ? parseFloat(newDiscount) : p.activeDiscount,
        } : p));
        setTimeout(() => { setSinglePriceProduct(null); setPriceSuccess(''); setNewPrice(''); setNewDiscount(''); }, 1200);
      } else {
        const json = await res.json();
        setPriceError(json?.message || 'Failed to update.');
      }
    } catch { setPriceError('Could not connect to server.'); }
    finally { setPriceLoading(false); }
  }

  async function handleBulkDiscount() {
    if (!selectedProductIds.length || !bulkDiscount) return;
    setPriceLoading(true); setPriceError(''); setPriceSuccess('');
    try {
      const res = await fetch('/api/product/bulk-discount', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProductIds, discount: parseFloat(bulkDiscount) }),
      });
      if (res.ok) {
        setPriceSuccess(`Discount applied to ${selectedProductIds.length} products!`);
        const disc = parseFloat(bulkDiscount);
        setProducts(prev => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, activeDiscount: disc } : p));
        setSelectedProductIds([]);
        setBulkDiscount('');
      } else {
        const json = await res.json();
        setPriceError(json?.message || 'Failed to apply discount.');
      }
    } catch { setPriceError('Could not connect to server.'); }
    finally { setPriceLoading(false); }
  }

  async function handleViewInvoice(order: Order, download: boolean) {
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/order/${order.id}/invoice?download=${download}`, { credentials: 'include' });
      if (!res.ok) { alert('Could not load invoice.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement('a');
        a.href = url; a.download = `invoice-${order.id}.pdf`; a.click();
        URL.revokeObjectURL(url);
      } else {
        setInvoiceUrl(url);
        setInvoiceOrder(order);
      }
    } catch { alert('Could not connect to server.'); }
    finally { setInvoiceLoading(false); }
  }

  const panels: { key: Panel; label: string; icon: string }[] = [
    { key: 'pricing', label: 'Pricing', icon: '💰' },
    { key: 'orders', label: 'Orders', icon: '📋' },
  ];

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Side Panel */}
      <aside style={{ width: '220px', flexShrink: 0, backgroundColor: '#111827', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>TeknoCS</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Sales Manager</p>
        </div>
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)} style={{
            padding: '10px 14px', borderRadius: '10px', border: 'none', textAlign: 'left',
            backgroundColor: activePanel === p.key ? '#374151' : 'transparent',
            color: activePanel === p.key ? '#ffffff' : '#9ca3af',
            fontSize: '14px', fontWeight: activePanel === p.key ? 600 : 400, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span>{p.icon}</span>{p.label}
          </button>
        ))}

      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>

        {/* PRICING */}
        {activePanel === 'pricing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Pricing</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['price', 'discount'] as const).map(mode => (
                  <button key={mode} onClick={() => { setPricingMode(mode); setSelectedProductIds([]); setPriceSuccess(''); setPriceError(''); }}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: pricingMode === mode ? 'none' : '1px solid #d1d5db', backgroundColor: pricingMode === mode ? '#111827' : '#fff', color: pricingMode === mode ? '#fff' : '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    {mode === 'price' ? '💵 Change Price' : '🏷️ Bulk Discount'}
                  </button>
                ))}
              </div>
            </div>

            {priceSuccess && <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '14px', fontWeight: 600 }}>✓ {priceSuccess}</div>}
            {priceError && <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '14px' }}>{priceError}</div>}

            {/* Bulk Discount controls */}
            {pricingMode === 'discount' && selectedProductIds.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '16px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>{selectedProductIds.length} products selected</span>
                <input type="number" placeholder="Discount %" value={bulkDiscount} onChange={e => setBulkDiscount(e.target.value)} min="0" max="100"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', width: '120px' }} />
                <button onClick={handleBulkDiscount} disabled={!bulkDiscount || priceLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: !bulkDiscount || priceLoading ? '#d1d5db' : '#111827', color: !bulkDiscount || priceLoading ? '#9ca3af' : '#fff', fontSize: '14px', fontWeight: 700, cursor: !bulkDiscount || priceLoading ? 'not-allowed' : 'pointer' }}>
                  {priceLoading ? 'Applying...' : 'Apply Discount'}
                </button>
                <button onClick={() => setSelectedProductIds([])} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}>Clear</button>
              </div>
            )}

            {loadingProducts ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {pricingMode === 'discount' && <th style={{ padding: '12px 16px', width: '40px' }}></th>}
                      {['Image', 'Name', 'Category', 'Price', 'Discount', pricingMode === 'price' ? 'Action' : ''].filter(Boolean).map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, i) => (
                      <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none', backgroundColor: selectedProductIds.includes(product.id) ? '#f0f9ff' : 'transparent' }}>
                        {pricingMode === 'discount' && (
                          <td style={{ padding: '12px 16px' }}>
                            <input type="checkbox" checked={selectedProductIds.includes(product.id)}
                              onChange={e => setSelectedProductIds(prev => e.target.checked ? [...prev, product.id] : prev.filter(id => id !== product.id))}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                          </td>
                        )}
                        <td style={{ padding: '12px 16px' }}>
                          <img src={product.thumbnailUrl || '/MainLogo.png'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827', maxWidth: '200px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{product.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₺{product.price?.toLocaleString('tr-TR')}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: product.activeDiscount > 0 ? '#ef4444' : '#111827' }}>{product.activeDiscount}%</td>
                        {pricingMode === 'price' && (
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => { setSinglePriceProduct(product); setNewPrice(String(product.price)); setNewDiscount(String(product.activeDiscount)); setPriceSuccess(''); setPriceError(''); }}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              ✏️ Edit Price
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activePanel === 'orders' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>All Orders</h1>

            {/* Date Filter */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Start Date</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>End Date</label>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
              </div>
              <button onClick={() => fetchOrders(startDate || undefined, endDate || undefined)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Filter
              </button>
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); fetchOrders(); }}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>

            {loadingOrders ? <p style={{ color: '#6b7280' }}>Loading...</p> : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>📋</p>
                <p>No orders found.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Order ID', 'Date', 'Address', 'Total', 'Status', 'Invoice'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => {
                      const statusStyle = getStatusStyle(order.status);
                      return (
                        <tr key={order.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>#{order.id.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('tr-TR') : '—'}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '160px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.deliveryAddress || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>₺{order.totalPrice?.toFixed(2)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '12px', fontWeight: 600 }}>
                              ● {statusStyle.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleViewInvoice(order, false)} disabled={invoiceLoading}
                                style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                👁️ View
                              </button>
                              <button onClick={() => handleViewInvoice(order, true)} disabled={invoiceLoading}
                                style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                ⬇️ Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>


      {/* Edit Price Modal */}
      {singlePriceProduct && (
        <div onClick={() => setSinglePriceProduct(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {pricingMode === 'price' ? 'Change Price' : 'Change Discount'}
              </h3>
              <button onClick={() => setSinglePriceProduct(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 16px 0', fontWeight: 500 }}>{singlePriceProduct.name}</p>
            {priceSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>✅</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>{priceSuccess}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pricingMode === 'price' ? (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>New Price (₺)</label>
                    <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>New Discount (%)</label>
                    <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder="0" min="0" max="100" style={inputStyle} />
                  </div>
                )}
                {priceError && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{priceError}</p>}
                <button onClick={handleUpdatePrice} disabled={priceLoading}
                  style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: priceLoading ? '#6b7280' : '#111827', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: priceLoading ? 'not-allowed' : 'pointer' }}>
                  {priceLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {invoiceOrder && invoiceUrl && (
        <div onClick={() => { setInvoiceOrder(null); setInvoiceUrl(''); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', width: '800px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Invoice — Order #{invoiceOrder.id.slice(-8).toUpperCase()}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => handleViewInvoice(invoiceOrder, true)}
                  style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  ⬇️ Download
                </button>
                <button onClick={() => { setInvoiceOrder(null); setInvoiceUrl(''); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>
            </div>
            <iframe src={invoiceUrl} style={{ flex: 1, border: 'none', borderRadius: '10px' }} title="Invoice" />
          </div>
        </div>
      )}

    </div>
  );
}
