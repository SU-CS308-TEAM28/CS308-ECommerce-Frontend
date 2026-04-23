import ProductCard from "../components/ProductCard";

export default function Home() {
  const popularProducts = [
    {
      id: "1",
      name: "Apple iPad Air (5th Generation) 64GB",
      price: 599,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
      category: "Tablets",
      subcategories: ["Education", "Graphics & Drawing", "iOS"],
      description:
        "M1 chip power, 10.9-inch Liquid Retina display, Wi-Fi connectivity.",
      ratings: {
        count: 204,
        value: 4.8,
      },
    },
    {
      id: "2",
      name: "Apple iPhone 15 Pro Max 256GB",
      price: 1199,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      category: "Phones",
      subcategories: ["Smartphones", "iOS"],
      description:
        "Titanium design, A17 Pro chip, 48MP camera, 5x optical zoom.",
      ratings: {
        count: 450,
        value: 4.8,
      },
    },
    {
      id: "3",
      name: "Dell XPS 15 9530",
      price: 2800,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      category: "Computers",
      subcategories: ["Laptops", "Design"],
      description: "Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070 graphics.",
      ratings: {
        count: 89,
        value: 4.7,
      },
    },
  ];

  const discountedProducts = [
    {
      id: "4",
      name: 'Samsung 65" Neo QLED 4K TV',
      price: 34999,
      image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800",
      category: "TVs",
      subcategories: ["4K", "Smart TV"],
      description: "Crisp 4K image quality with vibrant colors and immersive sound.",
      ratings: {
        count: 91,
        value: 4.6,
      },
    },
    {
      id: "5",
      name: "Sony WH-1000XM5 Headphones",
      price: 12999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      category: "Accessories",
      subcategories: ["Audio", "Wireless"],
      description: "Premium noise-cancelling headphones with long battery life.",
      ratings: {
        count: 176,
        value: 4.9,
      },
    },
    {
      id: "6",
      name: "Apple Watch Series 9",
      price: 15499,
      image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800",
      category: "Smart Devices",
      subcategories: ["Wearables", "iOS"],
      description: "Smart fitness tracking, sleek design, and smooth iPhone integration.",
      ratings: {
        count: 132,
        value: 4.7,
      },
    },
  ];

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        backgroundColor: "#ffffff",
      }}
    >
            {/* Carousel */}
      <section
        style={{
          height: "360px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "40px",
          color: "#ffffff",
          overflow: "hidden",
          gap: "24px",
        }}
      >
        <div style={{ maxWidth: "520px" }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#93c5fd",
              margin: "0 0 12px 0",
            }}
          >
            NEW SEASON DEALS
          </p>

          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              margin: "0 0 16px 0",
            }}
          >
            Discover the Best Tech for Everyday Life
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#dbeafe",
              margin: "0 0 24px 0",
            }}
          >
            Explore premium devices and exclusive discounts.
          </p>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#ffffff",
                color: "#111827",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Shop Now
            </button>

            <button
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.3)",
                backgroundColor: "transparent",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              View Offers
            </button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000"
          alt="Featured product"
          style={{
            maxHeight: "280px",
            borderRadius: "18px",
          }}
        />
      </section>

      

      {/* Popular Items */}
      <section style={{ marginTop: "40px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Popular Items
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              subcategories={product.subcategories}
              description={product.description}
              ratings={product.ratings}
            />
          ))}
        </div>
      </section>

      {/* Discounted Items */}
      <section style={{ marginTop: "56px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Discounted Items
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {discountedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              subcategories={product.subcategories}
              description={product.description}
              ratings={product.ratings}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: "64px",
          padding: "24px 0 40px 0",
          borderTop: "1px solid #e5e7eb",
          color: "#6b7280",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span>© 2026 TeknoCS. All rights reserved.</span>
        <div style={{ display: "flex", gap: "18px" }}>
          <span style={{ cursor: "pointer" }}>Privacy</span>
          <span style={{ cursor: "pointer" }}>Terms</span>
          <span style={{ cursor: "pointer" }}>Contact</span>
        </div>
      </footer>
    </div>
  );
}