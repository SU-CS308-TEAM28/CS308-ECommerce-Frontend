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

const emptyForm = {
  name: '',
  description: '',
  price: '',
  activeDiscount: '0',
  model: '',
  serialNumber: '',
  warrantyStatus: '',
  distributorInformation: '',
  thumbnailUrl: '',
  imageUrls: '',
  category: '',
  subcategories: '',
  stock: '',
};

export default function ProductManagerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'add' | 'remove' | 'comments'>('add');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (user && user.userType !== 'product_manager') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activePanel === 'remove') fetchProducts();
    if (activePanel === 'comments') fetchComments();
  }, [activePanel]);

  async function fetchComments() {
    setLoadingComments(true);
    try {
      const res = await fetch('/api/product/awaiting-comments', { credentials: 'include' });
      const json = await res.json();
      setComments(json?.data ?? []);
    } catch {} finally {
      setLoadingComments(false);
    }
  }

  async function handleCommentAction(comment: Comment, action: 'approve' | 'disapprove') {
    try {
      const res = await fetch(`/api/product/${comment.productId}/comments/${action}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment.id }),
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== comment.id));
      } else {
        const json = await res.json();
        alert(json?.message || 'Failed to update comment.');
      }
    } catch {
      alert('Could not connect to server.');
    }
  }

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
    } catch {} finally {
      setLoadingProducts(false);
    }
  }

  async function handleAddProduct() {
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        activeDiscount: parseFloat(form.activeDiscount || '0'),
        model: form.model,
        serialNumber: form.serialNumber,
        warrantyStatus: form.warrantyStatus,
        distributorInformation: form.distributorInformation,
        thumbnailUrl: form.thumbnailUrl || null,
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map(s => s.trim()).filter(Boolean) : [],
        category: form.category,
        subcategories: form.subcategories ? form.subcategories.split(',').map(s => s.trim()).filter(Boolean) : [],
        stock: parseInt(form.stock),
        extraProps: [],
      };
      const res = await fetch('/api/product/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setFormSuccess('Product added successfully!');
        setForm(emptyForm);
      } else {
        setFormError(json?.message || 'Failed to add product.');
      }
    } catch {
      setFormError('Could not connect to server.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
      } else {
        const json = await res.json();
        alert(json?.message || 'Failed to delete product.');
      }
    } catch {
      alert('Could not connect to server.');
    }
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

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)', backgroundColor: '#f9fafb' }}>

      {/* Side Panel */}
      <aside style={{
        width: '220px', flexShrink: 0, backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb', padding: '32px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>
          Product Manager
        </p>
        {(['add', 'remove', 'comments'] as const).map(panel => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            style={{
              padding: '10px 14px', borderRadius: '10px', border: 'none', textAlign: 'left',
              backgroundColor: activePanel === panel ? '#111827' : 'transparent',
              color: activePanel === panel ? '#ffffff' : '#374151',
              fontSize: '14px', fontWeight: activePanel === panel ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {panel === 'add' ? '➕ Add Product' : panel === 'remove' ? '🗑️ Remove Product' : '💬 Comments'}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>

        {/* ADD PRODUCT */}
        {activePanel === 'add' && (
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Add Product</h1>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Product Name *', placeholder: 'e.g. iPhone 15 Pro' },
                { key: 'description', label: 'Description *', placeholder: 'Product description...' },
                { key: 'price', label: 'Price (₺) *', placeholder: '0.00', type: 'number' },
                { key: 'activeDiscount', label: 'Discount (%)', placeholder: '0', type: 'number' },
                { key: 'stock', label: 'Stock *', placeholder: '0', type: 'number' },
                { key: 'model', label: 'Model', placeholder: 'Model number' },
                { key: 'serialNumber', label: 'Serial Number', placeholder: 'Serial number' },
                { key: 'warrantyStatus', label: 'Warranty', placeholder: 'e.g. 2 Years' },
                { key: 'distributorInformation', label: 'Distributor', placeholder: 'Distributor name' },
                { key: 'thumbnailUrl', label: 'Thumbnail URL', placeholder: 'https://...' },
                { key: 'imageUrls', label: 'Image URLs (comma separated)', placeholder: 'https://..., https://...' },
                { key: 'subcategories', label: 'Subcategories (comma separated)', placeholder: 'e.g. Laptops, macOS' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>{label}</label>
                  {key === 'description' ? (
                    <textarea
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      rows={3}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <input
                      type={type || 'text'}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}

              {/* Category select */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                >
                  <option value="">Select category...</option>
                  {categories.filter(c => c.isPrimitive).map(c => (
                    <option key={c.id} value={c.abbrv}>{c.label}</option>
                  ))}
                </select>
              </div>

              {formError && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{formError}</p>}
              {formSuccess && <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>{formSuccess}</p>}

              <button
                onClick={handleAddProduct}
                disabled={formLoading}
                style={{
                  padding: '14px', borderRadius: '12px', border: 'none',
                  backgroundColor: formLoading ? '#6b7280' : '#111827',
                  color: '#fff', fontSize: '15px', fontWeight: 700,
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {formLoading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        )}

        {/* REMOVE PRODUCT */}
        {activePanel === 'remove' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>Remove Product</h1>

            {loadingProducts ? (
              <p style={{ color: '#6b7280' }}>Loading products...</p>
            ) : (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Image', 'Name', 'Category', 'Price', 'Stock', ''].map(h => (
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
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827', maxWidth: '200px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{product.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>₺{product.price?.toLocaleString('tr-TR')}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: product.stock === 0 ? '#ef4444' : '#111827' }}>{product.stock}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '32px', width: '380px', maxWidth: '90vw', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          >
            <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>🗑️</p>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Delete Product?</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: '12px 28px', borderRadius: '12px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '15px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
