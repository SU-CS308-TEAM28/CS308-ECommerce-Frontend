"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  products: Product[];
  completed: boolean;
  cancelled: boolean;
}

interface ReturnProduct {
  productId: string;
  quantity: number;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState("");

  const [returnProducts, setReturnProducts] = useState<
    ReturnProduct[]
  >([]);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/order/${orderId}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/order/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateReturnQuantity = (
    productId: string,
    quantity: number
  ) => {
    setReturnProducts((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
      }

      return [...prev, { productId, quantity }];
    });
  };

  const handleRequestReturn = async () => {
    try {
      const filteredProducts = returnProducts.filter(
        (item) => item.quantity > 0
      );

      const response = await fetch(
        "/api/return/request",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            returningProducts: filteredProducts,
            reason,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        router.push("/returns");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/orders")}
        className="mb-6 border px-4 py-2 rounded-lg"
      >
        Back
      </button>

      <div className="border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              Order Details
            </h1>

            <p className="text-gray-500 mt-2">
              Order ID: {order.id}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-lg">
              {order.cancelled ? "CANCELLED" : order.status}
            </p>

            <p className="text-gray-500">
              ${order.totalPrice}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {order.products.map((product, index) => (
            <div
              key={index}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {product.productName}
                  </p>

                  <p className="text-sm text-gray-500">
                    Quantity: {product.quantity}
                  </p>
                </div>

                <p>${product.price}</p>
              </div>

              {order.status === "DELIVERED" && (
                <div className="mt-4">
                  <label className="text-sm font-medium">
                    Return Quantity
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={product.quantity}
                    className="border rounded-lg px-3 py-2 w-full mt-2"
                    onChange={(e) =>
                      updateReturnQuantity(
                        product.productId,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {order.status === "DELIVERED" && (
          <div className="mt-6">
            <label className="font-medium">
              Return Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              className="border rounded-lg w-full p-3 mt-2"
              rows={4}
            />

            <button
              onClick={handleRequestReturn}
              className="mt-4 bg-black text-white px-5 py-3 rounded-lg"
            >
              Request Return
            </button>
          </div>
        )}
        
        {!order.cancelled &&
         (order.status === "PROCESSING" ||
          order.status === "IN_TRANSIT") && (
          <button
            onClick={handleCancelOrder}
            className="mt-6 bg-red-500 text-white px-5 py-3 rounded-lg"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}