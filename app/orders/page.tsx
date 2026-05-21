"use client";

import { useEffect, useState } from "react";

interface Product {
  productId?: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrls?: string[];
  images?: string[];
}

interface Order {
  id: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  deliveryAddress?: string;
  isCompleted: boolean;
  isCancelled: boolean;
  products: Product[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8080/api/order/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch orders.");
        return;
      }

      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = () => {
    alert("Return request feature will be available soon.");
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const response = await fetch(`http://localhost:8080/api/order/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to cancel order.");
        return;
      }

      await fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("Could not cancel order. Please try again later.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString();
  };

  const getProductImage = (product: Product) => {
    return (
      product.imageUrls?.[0] ||
      product.images?.[0] ||
      "https://placehold.co/80x80"
    );
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getStatusClassName = (order: Order) => {
    if (order.isCancelled) {
      return "bg-red-100 text-red-700";
    }

    if (order.isCompleted) {
      return "bg-green-100 text-green-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          My Orders ({orders.length})
        </h1>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="border rounded-xl p-8 text-center text-gray-600">
            You do not have any orders yet.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>

                  <p className="text-gray-600 mt-1">
                    Date: {formatDate(order.orderDate)}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClassName(
                        order
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.deliveryAddress && (
                    <p className="text-gray-600">
                      Address: {order.deliveryAddress}
                    </p>
                  )}
                </div>

                <div className="md:text-right">
                  <p className="text-lg font-semibold">
                    {formatPrice(order.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-500">Total Price</p>
                </div>
              </div>

              <div className="flex flex-col">
                {order.products.map((product, index) => (
                  <div
                    key={`${product.productId || product.id || product.name}-${index}`}
                    className="border-t py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md border"
                      />

                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {product.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Price: {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleRequestReturn}
                        disabled={!order.isCompleted || order.isCancelled}
                        className="border border-gray-300 px-4 py-2 rounded-lg transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Request Return
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-end">
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={
                    order.isCompleted ||
                    order.isCancelled ||
                    cancellingOrderId === order.id
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                >
                  {cancellingOrderId === order.id
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}