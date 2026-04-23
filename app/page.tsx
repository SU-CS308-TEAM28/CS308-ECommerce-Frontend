import ProductCard from "../components/ProductCard";

export default function Home() {
  const products = [
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
      description:
        "Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070 graphics.",
      ratings: {
        count: 89,
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
      {/* Slider */}
      <section
        style={{
          height: "320px",
          borderRadius: "16px",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        Slider Area
      </section>

      {/* Products */}
      <section style={{ marginTop: "40px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Products
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {products.map((product) => (
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
    </div>
  );
}