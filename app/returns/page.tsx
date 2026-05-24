"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface ReturnItem {
  id: string;
  orderId: string;
  products: Product[];
  reason: string;
  requestDate: string;
  isApproved: boolean;
  isCompleted: boolean;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await fetch("/api/return/returns", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setReturns(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getReturnStatus = (item: ReturnItem) => {
    if (item.isCompleted) return "Completed";
    if (item.isApproved) return "Approved";
    return "Pending Approval";
  };

  if (loading) {
    return <div className="p-6">Loading returns...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Returns</h1>

      {returns.length === 0 ? (
        <p>No return requests found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {returns.map((item) => (
            <div key={item.id} className="border rounded-xl p-5">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-semibold">Return ID: {item.id}</p>
                  <p className="text-sm text-gray-500">
                    Order ID: {item.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.requestDate).toLocaleDateString()}
                  </p>
                </div>

                <p className="font-semibold">{getReturnStatus(item)}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium">Reason</p>
                <p className="text-gray-700">{item.reason}</p>
              </div>

              <div className="flex flex-col gap-2">
                {item.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-t pt-2 text-sm"
                  >
                    <span>
                      {product.productName} x{product.quantity}
                    </span>
                    <span>${product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}