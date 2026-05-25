'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type OrderStatus = 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

type Order = {
  id: string;
  userId: string;
  orderDate: string;
  products: any[];
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
};

type Tab = 'account' | 'orders' | 'returns';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const d = new Date(value as string | number | Date);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function shortOrderId(id: string): string {
  if (!id) return '#';
  return `#${id.slice(-6).toUpperCase()}`;
}

function statusStyle(status: OrderStatus): { bg: string; fg: string; label: string } {
  switch (status) {
    case 'PROCESSING':
      return { bg: '#fefce8', fg: '#a16207', label: 'Processing' };
    case 'IN_TRANSIT':
      return { bg: '#eff6ff', fg: '#1d4ed8', label: 'In transit' };
    case 'DELIVERED':
      return { bg: '#f0fdf4', fg: '#15803d', label: 'Delivered' };
    default:
      return { bg: '#f3f4f6', fg: '#374151', label: String(status) };
  }
}

// -----------------------------------------------------------------------------
// Account tab
// -----------------------------------------------------------------------------

type FieldStatus = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; msg: string };

function AccountTab() {
  const { user, update } = useAuth();

  const [taxId, setTaxId] = useState<string>('');
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [taxStatus, setTaxStatus] = useState<FieldStatus>({ kind: 'idle' });
  const [addressStatus, setAddressStatus] = useState<FieldStatus>({ kind: 'idle' });

  // Sync local state whenever the user object refreshes.
  useEffect(() => {
    setTaxId(user?.taxId ?? '');
    setHomeAddress(user?.homeAddress ?? '');
  }, [user]);

  const saveField = async (
    endpoint: 'change-address' | 'change-tax',
    newValue: string,
    setStatus: (s: FieldStatus) => void
  ) => {
    setStatus({ kind: 'saving' });
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${apiBase}/api/user/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newValue }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) throw new Error(payload?.message || 'Update failed');
      if (payload?.data) update(payload.data);

      setStatus({ kind: 'saved' });
      setTimeout(() => setStatus({ kind: 'idle' }), 2500);
    } catch (err) {
      setStatus({ kind: 'error', msg: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  if (!user) {
    return (
      <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading account…</p>
    );
  }

  const taxIdChanged = taxId !== (user.taxId ?? '');
  const addressChanged = homeAddress !== (user.homeAddress ?? '');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ReadOnlyField label="First name" value={user.name ?? ''} />
          <ReadOnlyField label="Last name" value={user.surname ?? ''} />
        </div>

        <ReadOnlyField label="Email" value={user.email ?? ''} />
        <ReadOnlyField label="Date of birth" value={formatDate(user.birthDate)} />

        <EditableField
          label="Tax ID"
          value={taxId}
          onChange={setTaxId}
          onSave={() => saveField('change-tax', taxId, setTaxStatus)}
          status={taxStatus}
          canSave={taxIdChanged && taxId.trim().length > 0}
        />

        <EditableField
          label="Home address"
          value={homeAddress}
          onChange={setHomeAddress}
          onSave={() => saveField('change-address', homeAddress, setAddressStatus)}
          status={addressStatus}
          canSave={addressChanged && homeAddress.trim().length > 0}
        />
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        disabled
        style={{ ...inputStyle, ...disabledInputStyle }}
      />
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  onSave,
  status,
  canSave,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  status: FieldStatus;
  canSave: boolean;
}) {
  const isSaving = status.kind === 'saving';
  const buttonDisabled = isSaving || !canSave;

  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={onSave}
          disabled={buttonDisabled}
          style={{
            padding: '0 22px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: buttonDisabled ? '#e5e7eb' : '#111827',
            color: buttonDisabled ? '#9ca3af' : '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isSaving ? 'Saving…' : 'Change'}
        </button>
      </div>
      {status.kind === 'saved' && (
        <p style={{ fontSize: '13px', color: '#15803d', margin: '8px 0 0 0' }}>✓ Saved</p>
      )}
      {status.kind === 'error' && (
        <p style={{ fontSize: '13px', color: '#ef4444', margin: '8px 0 0 0' }}>{status.msg}</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Orders tab
// -----------------------------------------------------------------------------

function OrdersTab() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${apiBase}/api/order/orders`, { credentials: 'include' });
      const json = await res.json().catch(() => null);
      const data = json?.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .order-sk {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 600px 100%;
            animation: shimmer 1.4s infinite;
          }
        `}</style>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="order-sk" style={{ height: '64px', borderRadius: '14px' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '14px', color: '#b91c1c', fontSize: '14px' }}>
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: '#f9fafb', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '40px', margin: '0 0 12px 0' }}>📦</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>No orders yet</p>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Your purchases will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header row — hidden on small viewports for simplicity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr 160px 140px',
          gap: '16px',
          padding: '0 20px 12px 20px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span>Order</span>
        <span>Date</span>
        <span>Status</span>
        <span style={{ textAlign: 'right' }}>Total</span>
      </div>

      {orders.map((order) => {
        const effectiveStatus =(order as any).isCancelled ? 'CANCELLED' : order.status;

        const s = statusStyle(effectiveStatus as OrderStatus);
        return (
          <div
            key={order.id}
            onClick={() => router.push(`/orders/${order.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 160px 140px',
              gap: '16px',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background-color 0.15s ease',
              cursor: 'pointer',
              borderRadius: '16px',
              marginTop: '8px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fafafa'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {shortOrderId(order.id)}
            </span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>
              {formatDate(order.orderDate)}
            </span>
            <span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: '20px',
                backgroundColor: s.bg, color: s.fg,
                fontSize: '13px', fontWeight: 600,
              }}>
                <span style={{ fontSize: '8px' }}>●</span>
                {s.label}
              </span>
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827', textAlign: 'right' }}>
              ₺{Number(order.totalPrice ?? 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('account');

  // After the AuthContext has had a chance to hydrate from localStorage,
  // bounce to /login if there's still no user. The 50ms delay avoids a flash
  // of the login redirect on initial mount.
  useEffect(() => {
    if (user) return;
    const t = setTimeout(() => {
      if (!localStorage.getItem('user')) router.replace('/login');
    }, 50);
    return () => clearTimeout(t);
  }, [user, router]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>
        My Profile
      </h1>

      {/* Tab toggle */}
      <div
        style={{
          display: 'inline-flex',
          gap: '4px',
          padding: '4px',
          backgroundColor: '#f3f4f6',
          borderRadius: '14px',
          marginBottom: '32px',
        }}
      >
        {(['account', 'orders', 'returns'] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 28px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: active ? '#ffffff' : 'transparent',
                color: active ? '#111827' : '#6b7280',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              {t === 'account' ? 'Account' : t === 'orders' ? 'Orders' : 'Returns'}
            </button>
          );
        })}
      </div>

      {tab === 'account' ? (
  <AccountTab />
) : tab === 'orders' ? (
  <OrdersTab />
) : (
  <div
    style={{
      padding: '40px',
      borderRadius: '20px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      textAlign: 'center',
    }}
  >
    <p
      style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '8px',
      }}
    >
      No return requests yet
    </p>

    <p
      style={{
        fontSize: '14px',
        color: '#6b7280',
      }}
    >
      Your return requests will appear here.
    </p>
  </div>
)}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Shared styles
// -----------------------------------------------------------------------------

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
};

const disabledInputStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  color: '#6b7280',
  cursor: 'not-allowed',
};