"use client";

import { useEffect, useState } from "react";

type StockStatus = "In Stock" | "Running Out" | "Out of Stock";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock: number;
  stockStatus: StockStatus;
  image: string;
};

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 5) return "Running Out";
  return "In Stock";
}

function normalizeCartItems(rawData: any): CartItem[] {
  const rawItems =
    rawData?.data ??
    rawData?.items ??
    rawData?.shoppingCart ??
    rawData?.cartItems ??
    rawData?.cart ??
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item: any, index: number) => {
    const product = item?.product ?? item?.productData ?? item;

    const productId =
      item?.productId ??
      product?.id ??
      product?._id ??
      item?.id ??
      String(index);

    const price = Number(product?.price ?? item?.price ?? 0);

    const discountAmount = Number(
      product?.activeDiscount ??
        product?.discountAmount ??
        item?.activeDiscount ??
        item?.discountAmount ??
        0
    );

    const discountedPrice =
      Number(product?.discountedPrice ?? item?.discountedPrice ?? 0) ||
      Math.max(price - discountAmount, 0);

    const stock = Number(product?.stock ?? item?.stock ?? 0);

    return {
      id: String(item?.id ?? productId),
      productId: String(productId),
      name: product?.name ?? item?.name ?? "Unnamed Product",
      price,
      discountedPrice,
      quantity: Number(item?.quantity ?? item?.amount ?? 1),
      stock,
      stockStatus: getStockStatus(stock),
      image:
        product?.thumbnailUrl ??
        product?.imageUrls?.[0] ??
        product?.imageUrl ??
        product?.image ??
        item?.thumbnailUrl ??
        item?.imageUrl ??
        item?.image ??
        "/MainLogo.png",
    };
  });
}

async function safeReadJson(response: Response) {
  const text = await response.text();

  if (!text || text.trim() === "") return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function ShoppingCartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    setPageLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/shopping-cart", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setItems([]);
        setError("Please log in to view your shopping cart.");
        return;
      }

      if (!res.ok) {
        setItems([]);
        setError("Shopping cart could not be loaded.");
        return;
      }

      const json = await safeReadJson(res);

      if (!json) {
        setItems([]);
        setError("");
        return;
      }

      setItems(normalizeCartItems(json));
      setError("");
    } catch {
      setItems([]);
      setError("Shopping cart could not be loaded.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increase = async (productId: string) => {
    setLoadingKey(`increase-${productId}`);
    setError("");

    try {
      const res = await fetch("/api/user/shopping-cart/increase-quantity", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Please log in to update your shopping cart.");
        return;
      }

      if (!res.ok) {
        setError("Quantity could not be increased.");
        return;
      }

      await fetchCart();
    } catch {
      setError("Quantity could not be increased.");
    } finally {
      setLoadingKey(null);
    }
  };

  const decrease = async (productId: string) => {
    setLoadingKey(`decrease-${productId}`);
    setError("");

    try {
      const res = await fetch("/api/user/shopping-cart/decrease-quantity", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Please log in to update your shopping cart.");
        return;
      }

      if (!res.ok) {
        setError("Quantity could not be decreased.");
        return;
      }

      await fetchCart();
    } catch {
      setError("Quantity could not be decreased.");
    } finally {
      setLoadingKey(null);
    }
  };

  const removeItem = async (productId: string) => {
    setLoadingKey(`remove-${productId}`);
    setError("");

    try {
      const res = await fetch("/api/user/shopping-cart/remove", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Please log in to update your shopping cart.");
        return;
      }

      if (!res.ok) {
        setError("Item could not be removed.");
        return;
      }

      await fetchCart();
    } catch {
      setError("Item could not be removed.");
    } finally {
      setLoadingKey(null);
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const normalTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountedTotal = items.reduce(
    (total, item) => total + item.discountedPrice * item.quantity,
    0
  );

  const hasOutOfStock = items.some(
    (item) => item.stockStatus === "Out of Stock"
  );

  if (pageLoading) {
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>Shopping Cart</h1>
        <p style={styles.mutedText}>Loading cart...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Shopping Cart ({itemCount})</h1>

      {error && <div style={styles.errorBox}>{error}</div>}

      {items.length === 0 ? (
        <div style={styles.emptyBox}>Your shopping cart is empty.</div>
      ) : (
        <>
          <section style={styles.list}>
            {items.map((item) => {
              const increaseLoading =
                loadingKey === `increase-${item.productId}`;
              const decreaseLoading =
                loadingKey === `decrease-${item.productId}`;
              const removeLoading = loadingKey === `remove-${item.productId}`;

              const rowLoading =
                increaseLoading || decreaseLoading || removeLoading;

              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.row,
                    opacity: rowLoading ? 0.55 : 1,
                  }}
                >
                  <div style={styles.leftSide}>
                    <img src={item.image} alt={item.name} style={styles.image} />

                    <div>
                      <div style={styles.productName}>{item.name}</div>

                      <div
                        style={{
                          ...styles.stockText,
                          color:
                            item.stockStatus === "Out of Stock"
                              ? "#dc2626"
                              : item.stockStatus === "Running Out"
                              ? "#d97706"
                              : "#16a34a",
                        }}
                      >
                        {item.stockStatus}
                      </div>
                    </div>
                  </div>

                  <div style={styles.rightSide}>
                    <div style={styles.quantityBox}>
                      <button
                        onClick={() => decrease(item.productId)}
                        disabled={rowLoading || item.quantity <= 1}
                        style={{
                          ...styles.quantityButton,
                          cursor:
                            rowLoading || item.quantity <= 1
                              ? "not-allowed"
                              : "pointer",
                          opacity: rowLoading || item.quantity <= 1 ? 0.5 : 1,
                        }}
                      >
                        {decreaseLoading ? "..." : "-"}
                      </button>

                      <span style={styles.quantityText}>{item.quantity}</span>

                      <button
                        onClick={() => increase(item.productId)}
                        disabled={rowLoading}
                        style={{
                          ...styles.quantityButton,
                          cursor: rowLoading ? "not-allowed" : "pointer",
                          opacity: rowLoading ? 0.5 : 1,
                        }}
                      >
                        {increaseLoading ? "..." : "+"}
                      </button>
                    </div>

                    <div style={styles.priceBox}>
                      {item.price !== item.discountedPrice && (
                        <div style={styles.oldPrice}>
                          ${item.price.toFixed(2)}
                        </div>
                      )}

                      <div style={styles.price}>
                        ${item.discountedPrice.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={rowLoading}
                      style={{
                        ...styles.deleteButton,
                        cursor: rowLoading ? "not-allowed" : "pointer",
                        opacity: rowLoading ? 0.5 : 1,
                      }}
                    >
                      {removeLoading ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <section style={styles.summary}>
            <div style={styles.normalTotal}>
              Normal Price: <strong>${normalTotal.toFixed(2)}</strong>
            </div>

            <div style={styles.discountedTotal}>
              Discounted Total: <strong>${discountedTotal.toFixed(2)}</strong>
            </div>

            <button
              disabled={hasOutOfStock}
              style={{
                ...styles.checkoutButton,
                backgroundColor: hasOutOfStock ? "#9ca3af" : "#111827",
                cursor: hasOutOfStock ? "not-allowed" : "pointer",
              }}
            >
              Checkout
            </button>
          </section>
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "28px",
  },
  mutedText: {
    marginTop: "24px",
    color: "#6b7280",
  },
  errorBox: {
    marginBottom: "18px",
    padding: "12px 14px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    fontSize: "14px",
  },
  emptyBox: {
    padding: "32px 0",
    color: "#6b7280",
  },
  list: {
    borderTop: "1px solid #e5e7eb",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 0",
    borderBottom: "1px solid #e5e7eb",
    gap: "24px",
  },
  leftSide: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: 0,
  },
  image: {
    width: "56px",
    height: "56px",
    objectFit: "contain",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "4px",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  productName: {
    fontSize: "18px",
    fontWeight: 500,
  },
  stockText: {
    fontSize: "13px",
    marginTop: "4px",
  },
  rightSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "18px",
    flexShrink: 0,
  },
  quantityBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  quantityButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    fontSize: "16px",
  },
  quantityText: {
    minWidth: "22px",
    textAlign: "center",
    fontWeight: 500,
  },
  priceBox: {
    width: "100px",
    textAlign: "right",
  },
  oldPrice: {
    fontSize: "13px",
    color: "#9ca3af",
    textDecoration: "line-through",
  },
  price: {
    fontSize: "18px",
    fontWeight: 600,
  },
  deleteButton: {
    border: "none",
    backgroundColor: "transparent",
    fontSize: "18px",
  },
  summary: {
    marginTop: "28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "12px",
  },
  normalTotal: {
    fontSize: "16px",
    color: "#6b7280",
  },
  discountedTotal: {
    fontSize: "22px",
  },
  checkoutButton: {
    marginTop: "8px",
    padding: "12px 28px",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
  },
};