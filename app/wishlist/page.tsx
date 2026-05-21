"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountedPrice: number;
  activeDiscount: number;
  stock: number | null;
  image: string;
  category: string;
};

function normalizeWishlistItems(rawData: any): WishlistItem[] {
  const rawItems =
    rawData?.data ??
    rawData?.items ??
    rawData?.wishlist ??
    rawData?.wishlistItems ??
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
    const activeDiscount = Number(
      product?.activeDiscount ?? item?.activeDiscount ?? 0
    );
    const discountedPrice =
      Number(product?.discountedPrice ?? item?.discountedPrice ?? 0) ||
      (activeDiscount > 0 ? price * (1 - activeDiscount / 100) : price);

    return {
      id: String(item?.id ?? productId),
      productId: String(productId),
      name: product?.name ?? item?.name ?? "Unnamed Product",
      price,
      discountedPrice,
      activeDiscount,
      stock: product?.stock ?? item?.stock ?? null,
      image:
        product?.thumbnailUrl ??
        product?.imageUrls?.[0] ??
        product?.imageUrl ??
        product?.image ??
        item?.thumbnailUrl ??
        item?.imageUrl ??
        item?.image ??
        "/MainLogo.png",
      category: product?.category ?? item?.category ?? "",
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

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    setPageLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setItems([]);
        setError("Please log in to view your wishlist.");
        return;
      }

      if (!res.ok) {
        setItems([]);
        setError("Wishlist could not be loaded.");
        return;
      }

      const json = await safeReadJson(res);
      if (!json) {
        setItems([]);
        return;
      }

      setItems(normalizeWishlistItems(json));
    } catch {
      setItems([]);
      setError("Wishlist could not be loaded.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId: string) => {
    setLoadingKey(`remove-${productId}`);
    setError("");

    try {
      const res = await fetch("/api/user/wishlist/remove", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Please log in to update your wishlist.");
        return;
      }

      if (!res.ok) {
        setError("Item could not be removed.");
        return;
      }

      await fetchWishlist();
    } catch {
      setError("Item could not be removed.");
    } finally {
      setLoadingKey(null);
    }
  };

  const addToCart = async (productId: string) => {
    setLoadingKey(`cart-${productId}`);
    setError("");

    try {
      const res = await fetch("/api/user/shopping-cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Please log in to add items to your cart.");
        return;
      }

      if (!res.ok) {
        setError("Could not add item to cart.");
        return;
      }

      router.push("/shopping-cart");
    } catch {
      setError("Could not add item to cart.");
    } finally {
      setLoadingKey(null);
    }
  };

  if (pageLoading) {
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>Wishlist</h1>
        <p style={styles.mutedText}>Loading wishlist...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Wishlist ({items.length} items)</h1>

      {error && <div style={styles.errorBox}>{error}</div>}

      {items.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>🤍</p>
          <p style={{ margin: 0 }}>Your wishlist is empty.</p>
        </div>
      ) : (
        <section style={styles.grid}>
          {items.map((item) => {
            const isRemoving = loadingKey === `remove-${item.productId}`;
            const isAddingToCart = loadingKey === `cart-${item.productId}`;
            const rowLoading = isRemoving || isAddingToCart;
            const isOutOfStock = item.stock !== null && item.stock === 0;
            const hasDiscount = item.activeDiscount > 0;

            return (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  opacity: rowLoading ? 0.55 : 1,
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => router.push(`/product/${item.productId}`)}
                    style={{
                      ...styles.image,
                      filter: isOutOfStock ? "grayscale(60%)" : "none",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={rowLoading}
                    title="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "rgba(255,255,255,0.88)",
                      backdropFilter: "blur(4px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      fontSize: "16px",
                      cursor: rowLoading ? "not-allowed" : "pointer",
                      opacity: rowLoading ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      zIndex: 1,
                    }}
                  >
                    {isRemoving ? "..." : "🗑️"}
                  </button>
                </div>

                <div style={styles.cardBody}>
                  {item.category && (
                    <p style={styles.category}>{item.category}</p>
                  )}

                  <p
                    style={styles.productName}
                    onClick={() => router.push(`/product/${item.productId}`)}
                  >
                    {item.name}
                  </p>

                  <div style={styles.priceRow}>
                    {hasDiscount ? (
                      <>
                        <span style={styles.discountedPrice}>
                          ₺
                          {item.discountedPrice.toLocaleString("tr-TR", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <span style={styles.oldPrice}>
                          ₺{item.price.toLocaleString("tr-TR")}
                        </span>
                        <span style={styles.discountBadge}>
                          -{item.activeDiscount}%
                        </span>
                      </>
                    ) : (
                      <span style={styles.discountedPrice}>
                        ₺{item.price.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>

                  {isOutOfStock && (
                    <p style={styles.outOfStock}>Out of Stock</p>
                  )}
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => addToCart(item.productId)}
                    disabled={rowLoading || isOutOfStock}
                    style={{
                      ...styles.cartButton,
                      backgroundColor:
                        isOutOfStock
                          ? "#d1d5db"
                          : isAddingToCart
                          ? "#6b7280"
                          : "#111827",
                      color: isOutOfStock ? "#9ca3af" : "#ffffff",
                      cursor:
                        rowLoading || isOutOfStock ? "not-allowed" : "pointer",
                    }}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : isAddingToCart
                      ? "Adding..."
                      : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
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
    padding: "64px 0",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },
  cardBody: {
    padding: "16px 16px 8px 16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  category: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
  },
  productName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    cursor: "pointer",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
    flexWrap: "wrap",
  },
  discountedPrice: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111827",
  },
  oldPrice: {
    fontSize: "14px",
    color: "#9ca3af",
    textDecoration: "line-through",
  },
  discountBadge: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "8px",
  },
  outOfStock: {
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: 600,
    margin: 0,
  },
  cardActions: {
    padding: "12px 16px 16px 16px",
  },
  cartButton: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  removeButton: {
    width: "40px",
    height: "40px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
