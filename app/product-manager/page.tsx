'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Product = {
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
  stock: number;
  extraProps: { label: string; value: string }[];
};

type Category = {
  id: string;
  abbrv: string;
  label: string;
  isPrimitive: boolean;
  subCategories: Category[];
};

type Comment = {
  id: string;
  productId: string;
  commenter: { id: string; publicName: string };
  creationDate: string;
  rate: number;
  comment: string;
  isApproved: boolean;
  isChecked: boolean;
};

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

type ReturnData = {
  id: string;
  orderId: string;
  products: CartProduct[];
  reason: string;
  requestDate: string;
  isApproved: boolean;
  isCompleted: boolean;
};

type Panel = 'add' | 'products' | 'orders' | 'comments' | 'categories' | 'returns';

const STATUS_OPTIONS = [
  { value: 'IN_TRANSIT', label: 'In Transit', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'DELIVERED', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
];

const ALL_STATUS = [
  { value: 'PROCESSING', label: 'Processing', color: '#f59e0b', bg: '#fefce8' },
  { value: 'IN_TRANSIT', label: 'In Transit', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'DELIVERED', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
];

function getStatusStyle(status: string) {
  return ALL_STATUS.find(s => s.value === status) ?? { label: status, color: '#6b7280', bg: '#f9fafb' };
}

const emptyForm = {
  name: '', description: '', price: '', activeDiscount: '0', model: '',
  serialNumber: '', warrantyStatus: '', distributorInformation: '',
  thumbnailUrl: '', category: '', stock: '',
};

export default function ProductManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>('add');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Add form
  const [form, setForm] = useState(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Edit product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editImageUrls, setEditImageUrls] = useState<string[]>(['']);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updateStatusOrder, setUpdateStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [orderProductsModal, setOrderProductsModal] = useState<Order | null>(null);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Returns
  const [returns, setReturns] = useState<ReturnData[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  // Categories management
  const [catForm, setCatForm] = useState({ abbrv: '', label: '' });
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catSuccess, setCatSuccess] = useState('');
  const [catError, setCatError] = useState('');
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<Category | null>(null);

  useEffect(() => {
    if (user && user.userType !== 'product_manager') router.push('/');
    fetchCategories();
  }, [user]);

  useEffect(() => {
    if (activePanel === 'products') fetchProducts();
    if (activePanel === 'orders') fetchOrders();
    if (activePanel === 'comments') fetchComments();
    if (activePanel === 'returns') fetchReturns();
  }, [activePanel]);

  // Reset subcategories when category changes in add form
  useEffect(() => {
    setSelectedSubcategories([]);
  }, [form.category]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/product/category/list', { credentials: 'include' });
      const json = await res.json();
      setCategories(json?.data ?? []);
    } catch {}
  }

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/product/products?page=0&size=100&sort=name&order=asc', { credentials: 'include' });
      const json = await res.json();
      setProducts(json?.data?.products ?? []);
    } catch {} finally { setLoadingProducts(false); }
  }

  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/order/orders', { credentials: 'include' });
      const json = await res.json();
      const all: Order[] = json?.data ?? [];
      setOrders(all.filter(o => o.status === 'PROCESSING' && !o.isCancelled));
    } catch {} finally { setLoadingOrders(false); }
  }

  async function fetchReturns() {
    setLoadingReturns(true);
    try {
      const res = await fetch('/api/return/returns', { credentials: 'include' });
      const json = await res.json();
      setReturns(json?.data ?? []);
    } catch {} finally { setLoadingReturns(false); }
  }

  async function handleReturnAction(returnId: string, action: 'approve' | 'complete') {
    try {
      const res = await fetch(`/api/return/${action}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId }),
      });
      if (res.ok) fetchReturns();
    } catch {}
  }

  async function fetchComments() {
    setLoadingComments(true);
    try {
      const res = await fetch('/api/product/awaiting-comments', { credentials: 'include' });
      const json = await res.json();
      setComments(json?.data ?? []);
    } catch {} finally { setLoadingComments(false); }
  }

  async function handleAddProduct() {
    setFormLoading(true); setFormError(''); setFormSuccess('');
    try {
      const body = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), activeDiscount: parseFloat(form.activeDiscount || '0'),
        model: form.model, serialNumber: form.serialNumber,
        warrantyStatus: form.warrantyStatus, distributorInformation: form.distributorInformation,
        thumbnailUrl: form.thumbnailUrl || null,
        imageUrls: imageUrls.filter(u => u.trim()),
        category: form.category,
        subcategories: selectedSubcategories,
        stock: parseInt(form.stock), extraProps: [],
      };
      const res = await fetch('/api/product/add', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setFormSuccess('Product added successfully!');
        setForm(emptyForm); setImageUrls(['']); setSelectedSubcategories([]);
      } else setFormError(json?.message || 'Failed to add product.');
    } catch { setFormError('Could not connect to server.'); }
    finally { setFormLoading(false); }
  }

  async function handleUpdateProduct() {
    if (!editingProduct) return;
    setEditLoading(true); setEditError(''); setEditSuccess('');
    try {
      const body = {
        name: editForm.name, description: editForm.description,
        price: editForm.price, activeDiscount: editForm.activeDiscount,
        model: editForm.model, serialNumber: editForm.serialNumber,
        warrantyStatus: editForm.warrantyStatus, distributorInformation: editForm.distributorInformation,
        thumbnailUrl: editForm.thumbnailUrl || null,
        imageUrls: editImageUrls.filter(u => u.trim()),
        category: editingProduct.category,
        subcategories: editingProduct.subcategories ?? [],
        stock: editForm.stock, extraProps: editForm.extraProps ?? [],
      };
      const res = await fetch(`/api/product/${editingProduct.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setEditSuccess('Product updated!');
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...json.data } : p));
        setTimeout(() => { setEditingProduct(null); setEditSuccess(''); }, 1200);
      } else setEditError(json?.message || 'Failed to update.');
    } catch { setEditError('Could not connect to server.'); }
    finally { setEditLoading(false); }
  }

  async function handleDeleteProduct(product: Product) {
    try {
      const res = await fetch(`/api/product/${product.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setDeleteConfirm(null);
      } else {
        const json = await res.json();
        alert(json?.message || 'Failed to delete.');
      }
    } catch { alert('Could not connect to server.'); }
  }

  async function handleUpdateStatus() {
    if (!updateStatusOrder || !newStatus) return;
    setUpdateLoading(true); setUpdateSuccess('');
    try {
      const res = await fetch(`/api/order/${updateStatusOrder.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUpdateSuccess('Status updated!');
        setOrders(prev => prev.filter(o => o.id !== updateStatusOrder.id));
        setTimeout(() => { setUpdateStatusOrder(null); setUpdateSuccess(''); setNewStatus(''); }, 1200);
      }
    } catch {} finally { setUpdateLoading(false); }
  }

  async function handleCommentAction(comment: Comment, action: 'approve' | 'disapprove') {
    try {
      await fetch(`/api/product/${comment.productId}/comments/${action}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment.id }),
      });
      setComments(prev => prev.filter(c => c.id !== comment.id));
    } catch {}
  }

  async function handleAddCategory() {
    setCatLoading(true); setCatError(''); setCatSuccess('');
    try {
      const res = await fetch('/api/product/category/add', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...catForm, isPrimitive: false, subCategories: [] }),
      });
      const json = await res.json();
      if (res.ok) {
        setCatSuccess('Category added!');
        setCatForm({ abbrv: '', label: '' });
        fetchCategories();
        setTimeout(() => setCatSuccess(''), 2000);
      } else setCatError(json?.message || 'Failed to add category.');
    } catch { setCatError('Could not connect to server.'); }
    finally { setCatLoading(false); }
  }

  async function handleDeleteCategory(cat: Category) {
    try {
      const res = await fetch(`/api/product/category/${cat.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setDeleteCatConfirm(null);
        fetchCategories();
      } else {
        const json = await res.json();
        alert(json?.message || 'Failed to delete category.');
      }
    } catch { alert('Could not connect to server.'); }
  }

  if (!user || user.userType !== 'product_manager') {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>🔒</p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>This page is only accessible to Product Managers.</p>
      </div>
    );
  }

  const panels: { key: Panel; label: string; icon: string }[] = [
    { key: 'add', label: 'Add Product', icon: '➕' },
    { key: 'products', label: 'Manage Products', icon: '📦' },
    { key: 'orders', label: 'Orders', icon: '🚚' },
    { key: 'comments', label: 'Comments', icon: '💬' },
    { key: 'categories', label: 'Categories', icon: '🏷️' },
    { key: 'returns', label: 'Returns', icon: '↩️' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  const selectedCategory = categories.find(c => c.abbrv === form.category);
  const availableSubcategories = selectedCategory?.subCategories ?? [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Side Panel */}
      <aside style={{ width: '220px', flexShrink: 0, backgroundColor: '#111827', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>TeknoCS</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Product Manager</p>
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

        {/* ADD PRODUCT */}
        {activePanel === 'add' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Add Product</h1>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Basic fields */}
              {([
                { key: 'name', label: 'Product Name *', placeholder: 'e.g. iPhone 15 Pro' },
                { key: 'price', label: 'Price (₺) *', placeholder: '0.00', type: 'number' },
                { key: 'activeDiscount', label: 'Discount (%)', placeholder: '0', type: 'number' },
                { key: 'stock', label: 'Stock *', placeholder: '0', type: 'number' },
                { key: 'model', label: 'Model', placeholder: 'Model number' },
                { key: 'serialNumber', label: 'Serial Number', placeholder: 'Serial number' },
                { key: 'warrantyStatus', label: 'Warranty', placeholder: 'e.g. 2 Years' },
                { key: 'distributorInformation', label: 'Distributor', placeholder: 'Distributor name' },
                { key: 'thumbnailUrl', label: 'Thumbnail URL', placeholder: 'https://...' },
              ] as { key: string; label: string; placeholder: string; type?: string }[]).map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>{label}</label>
                  <input type={type || 'text'} value={form[key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}

              {/* Description */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Image URLs - dynamic fields */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>Image URLs</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {imageUrls.map((url, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={url}
                        onChange={e => {
                          const updated = [...imageUrls];
                          updated[idx] = e.target.value;
                          setImageUrls(updated);
                        }}
                        placeholder="https://..."
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={() => {
                          const updated = [...imageUrls];
                          updated.splice(idx + 1, 0, '');
                          setImageUrls(updated);
                        }}
                        title="Add URL below"
                        style={{ width: '32px', height: '38px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '16px', cursor: 'pointer', flexShrink: 0 }}
                      >
                        +
                      </button>
                      {imageUrls.length > 1 && (
                        <button
                          onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                          title="Remove this URL"
                          style={{ width: '32px', height: '38px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Category *</label>
                <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{ ...inputStyle, backgroundColor: '#fff' }}>
                  <option value="">Select category...</option>
                  {categories.filter(c => c.isPrimitive).map(c => <option key={c.id} value={c.abbrv}>{c.label}</option>)}
                </select>
              </div>

              {/* Subcategories - checkboxes */}
              {form.category && availableSubcategories.length > 0 && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>Subcategories</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {availableSubcategories.map(sub => (
                      <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(sub.abbrv)}
                          onChange={e => setSelectedSubcategories(prev =>
                            e.target.checked ? [...prev, sub.abbrv] : prev.filter(s => s !== sub.abbrv)
                          )}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        {sub.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formError && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{formError}</p>}
              {formSuccess && <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{formSuccess}</p>}
              <button onClick={handleAddProduct} disabled={formLoading}
                style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: formLoading ? '#6b7280' : '#111827', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                {formLoading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        )}

        {/* MANAGE PRODUCTS */}
        {activePanel === 'products' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Manage Products</h1>
            {loadingProducts ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Image', 'Name', 'Category', 'Price', 'Discount', 'Stock', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, i) => (
                      <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={product.thumbnailUrl || '/MainLogo.png'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827', maxWidth: '180px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{product.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₺{product.price?.toLocaleString('tr-TR')}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{product.activeDiscount}%</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: product.stock === 0 ? '#ef4444' : '#111827', fontWeight: 600 }}>{product.stock}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditingProduct(product); setEditForm({ ...product }); setEditImageUrls(product.imageUrls?.length ? [...product.imageUrls] : ['']); setEditSuccess(''); setEditError(''); }}
                              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(product)}
                              style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              🗑️
                            </button>
                          </div>
                        </td>
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Processing Orders</h1>
            {loadingOrders ? <p style={{ color: '#6b7280' }}>Loading...</p> : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>📦</p>
                <p>No processing orders.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Order ID', 'Date', 'Address', 'Total', 'Current Status', 'Products', 'Actions'].map(h => (
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
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '140px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.deliveryAddress || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>₺{order.totalPrice?.toFixed(2)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '12px', fontWeight: 600 }}>
                              ● {statusStyle.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button onClick={() => setOrderProductsModal(order)}
                              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              📦 Show
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button onClick={() => { setUpdateStatusOrder(order); setNewStatus(''); }}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
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
          </div>
        )}

        {/* COMMENTS */}
        {activePanel === 'comments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Awaiting Comments</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{comments.length} pending</span>
            </div>
            {loadingComments ? <p style={{ color: '#6b7280' }}>Loading...</p> : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>💬</p>
                <p>No comments awaiting approval.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{comment.commenter?.publicName ?? 'Anonymous'}</p>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                          {[1,2,3,4,5].map(star => <span key={star} style={{ fontSize: '14px', color: star <= comment.rate ? '#f59e0b' : '#d1d5db' }}>★</span>)}
                        </div>
                        {comment.creationDate && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{new Date(comment.creationDate).toLocaleDateString('tr-TR')}</p>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>product: {comment.productId?.slice(-6)}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 16px 0' }}>{comment.comment}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleCommentAction(comment, 'approve')}
                        style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleCommentAction(comment, 'disapprove')}
                        style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        ✕ Disapprove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RETURNS */}
        {activePanel === 'returns' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Returns</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{returns.length} return{returns.length !== 1 ? 's' : ''}</span>
            </div>
            {loadingReturns ? <p style={{ color: '#6b7280' }}>Loading...</p> : returns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>↩️</p>
                <p>No return requests.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Return ID', 'Order ID', 'Date', 'Reason', 'Products', 'Current Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret, i) => {
                      const status = ret.isCompleted ? 'COMPLETED' : ret.isApproved ? 'APPROVED' : 'PENDING';
                      const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
                        PENDING: { label: 'Pending', color: '#f59e0b', bg: '#fefce8' },
                        APPROVED: { label: 'Approved', color: '#3b82f6', bg: '#eff6ff' },
                        COMPLETED: { label: 'Completed', color: '#16a34a', bg: '#f0fdf4' },
                      };
                      const ss = statusStyles[status];
                      return (
                        <tr key={ret.id} style={{ borderBottom: i < returns.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>#{ret.id.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#6b7280' }}>#{ret.orderId?.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{ret.requestDate ? new Date(ret.requestDate).toLocaleDateString('tr-TR') : '—'}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '140px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ret.reason || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{ret.products?.length ?? 0} item{(ret.products?.length ?? 0) !== 1 ? 's' : ''}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', backgroundColor: ss.bg, color: ss.color, fontSize: '12px', fontWeight: 600 }}>
                              ● {ss.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {status === 'PENDING' && (
                              <button onClick={() => handleReturnAction(ret.id, 'approve')}
                                style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Approve
                              </button>
                            )}
                            {status === 'APPROVED' && (
                              <button onClick={() => handleReturnAction(ret.id, 'complete')}
                                style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Complete
                              </button>
                            )}
                            {status === 'COMPLETED' && (
                              <span style={{ fontSize: '13px', color: '#9ca3af' }}>—</span>
                            )}
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

        {/* CATEGORIES */}
        {activePanel === 'categories' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Manage Categories</h1>

            {/* Add Category Form */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Add New Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Label *</label>
                  <input type="text" value={catForm.label} onChange={e => setCatForm(prev => ({ ...prev, label: e.target.value }))} placeholder="e.g. Computers" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Abbreviation *</label>
                  <input type="text" value={catForm.abbrv} onChange={e => setCatForm(prev => ({ ...prev, abbrv: e.target.value }))} placeholder="e.g. computers" style={inputStyle} />
                </div>

                {catError && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{catError}</p>}
                {catSuccess && <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{catSuccess}</p>}
                <button onClick={handleAddCategory} disabled={catLoading}
                  style={{ padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: catLoading ? '#6b7280' : '#111827', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: catLoading ? 'not-allowed' : 'pointer' }}>
                  {catLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>

            {/* Existing Categories */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Label', 'Abbreviation', 'Type', 'Subcategories', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <tr key={cat.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>{cat.label}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>{cat.abbrv}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: cat.isPrimitive ? '#eff6ff' : '#f3f4f6', color: cat.isPrimitive ? '#3b82f6' : '#6b7280', fontSize: '12px', fontWeight: 600 }}>
                          {cat.isPrimitive ? 'Primary' : 'Sub'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{cat.subCategories?.length ?? 0}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {!cat.isPrimitive && (
                          <button onClick={() => setDeleteCatConfirm(cat)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div onClick={() => setEditingProduct(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '520px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'price', label: 'Price (₺)', type: 'number' },
                { key: 'activeDiscount', label: 'Discount (%)', type: 'number' },
                { key: 'stock', label: 'Stock', type: 'number' },
                { key: 'warrantyStatus', label: 'Warranty', type: 'text' },
                { key: 'distributorInformation', label: 'Distributor', type: 'text' },
                { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'text' },
              ] as { key: string; label: string; type: string }[]).map(({ key, label, type }) => (
                <div key={key}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>{label}</label>
                  <input type={type} value={(editForm as any)[key] ?? ''} onChange={e => setEditForm(prev => ({ ...prev, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea value={editForm.description ?? ''} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* Edit Image URLs */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Image URLs</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editImageUrls.map((url, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" value={url} onChange={e => { const u = [...editImageUrls]; u[idx] = e.target.value; setEditImageUrls(u); }} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => { const u = [...editImageUrls]; u.splice(idx + 1, 0, ''); setEditImageUrls(u); }}
                        style={{ width: '32px', height: '38px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '16px', cursor: 'pointer', flexShrink: 0 }}>+</button>
                      {editImageUrls.length > 1 && (
                        <button onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))}
                          style={{ width: '32px', height: '38px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>🗑️</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {editError && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{editError}</p>}
              {editSuccess && <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{editSuccess}</p>}
              <button onClick={handleUpdateProduct} disabled={editLoading}
                style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: editLoading ? '#6b7280' : '#111827', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirm */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '380px', maxWidth: '90vw', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>🗑️</p>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Delete Product?</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>"{deleteConfirm.name}" will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => handleDeleteProduct(deleteConfirm)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '15px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirm */}
      {deleteCatConfirm && (
        <div onClick={() => setDeleteCatConfirm(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '380px', maxWidth: '90vw', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>🏷️</p>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Delete Category?</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>"{deleteCatConfirm.label}" will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => handleDeleteCategory(deleteCatConfirm)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                Delete
              </button>
              <button onClick={() => setDeleteCatConfirm(null)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '15px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Products Modal */}
      {orderProductsModal && (
        <div onClick={() => setOrderProductsModal(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '560px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Order #{orderProductsModal.id.slice(-8).toUpperCase()} — Products
              </h3>
              <button onClick={() => setOrderProductsModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb' }}>
              {(orderProductsModal.products ?? []).map((item, i) => {
                const discountedPrice = item.activeDiscount > 0
                  ? item.price * (1 - item.activeDiscount / 100)
                  : item.price;
                return (
                  <div key={item.productId ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <img src={item.thumbnailUrl || '/MainLogo.png'} alt={item.name}
                        style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '2px', backgroundColor: '#fff', flexShrink: 0 }} />
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
            <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              Total: ₺{orderProductsModal.totalPrice?.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateStatusOrder && (
        <div onClick={() => { setUpdateStatusOrder(null); setUpdateSuccess(''); setNewStatus(''); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '380px', maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Update Status</h3>
              <button onClick={() => { setUpdateStatusOrder(null); setUpdateSuccess(''); setNewStatus(''); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            {updateSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>✅</p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#16a34a' }}>{updateSuccess}</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>Order #{updateStatusOrder.id.slice(-8).toUpperCase()}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setNewStatus(opt.value)}
                      style={{ padding: '12px 16px', borderRadius: '10px', border: newStatus === opt.value ? `2px solid ${opt.color}` : '1px solid #e5e7eb', backgroundColor: newStatus === opt.value ? opt.bg : '#fff', color: newStatus === opt.value ? opt.color : '#374151', fontSize: '14px', fontWeight: newStatus === opt.value ? 700 : 400, cursor: 'pointer', textAlign: 'left' }}>
                      ● {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleUpdateStatus} disabled={!newStatus || updateLoading}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: !newStatus || updateLoading ? '#d1d5db' : '#111827', color: !newStatus || updateLoading ? '#9ca3af' : '#fff', fontSize: '15px', fontWeight: 700, cursor: !newStatus || updateLoading ? 'not-allowed' : 'pointer' }}>
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
