"use client";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">
          Order #123456
        </h2>

        <p className="text-gray-600 mb-1">
          Date: May 21, 2026
        </p>

        <p className="text-gray-600 mb-1">
          Status: Delivered
        </p>

        <p className="text-gray-600 mb-4">
          Total: $1200
        </p>

        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://placehold.co/80x80"
              alt="product"
              className="w-20 h-20 object-cover rounded-md"
            />

            <div>
              <p className="font-medium">
                MacBook Air M3
              </p>

              <p className="text-sm text-gray-500">
                Quantity: 1
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              alert(
                "Return request feature will be available soon."
              )
            }
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Request Return
          </button>
        </div>
      </div>
    </div>
  );
}