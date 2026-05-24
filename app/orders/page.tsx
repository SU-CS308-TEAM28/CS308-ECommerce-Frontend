"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  products: Product[];
  isCompleted: boolean;
  isCancelled: boolean;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/order/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => router.push(`/orders/${order.id}`)}
            className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold">
                  Order ID: {order.id}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ${order.totalPrice}
                </p>

                <p className="text-sm">
                  {order.status}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {order.products.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {product.productName} x{product.quantity}
                  </span>

                  <span>
                    ${product.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}