type ProductCardProps = {
    id: string;
    name: string;
    price: number;
    image: string | null;
    category: string;
    subcategories: string[];
    description: string;
    ratings: {
      count: number;
      value: number;
    };
  };
  
  export default function ProductCard({
    name,
    price,
    image,
    category,
    description,
    ratings,
  }: ProductCardProps) {
    const fallbackImage =
      "https://via.placeholder.com/400x260?text=No+Image";
  
    return (
      <div
        style={{
          width: "280px",
          minHeight: "520px",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <img
            src={image || fallbackImage}
            alt={name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              borderRadius: "14px",
              marginBottom: "16px",
            }}
          />
  
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: "0 0 8px 0",
            }}
          >
            {category}
          </p>
  
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 12px 0",
              lineHeight: "1.3",
            }}
          >
            {name}
          </h3>
  
          <p
            style={{
              fontSize: "15px",
              color: "#4b5563",
              margin: "0 0 14px 0",
              lineHeight: "1.5",
              minHeight: "60px",
            }}
          >
            {description}
          </p>
  
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              color: "#f59e0b",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: "18px" }}>★</span>
            <span>{ratings.value}</span>
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>
              ({ratings.count})
            </span>
          </div>
  
          <p
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 20px 0",
            }}
          >
            ₺{price}
          </p>
        </div>


        <button
        style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#374151",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        }}
        >
        <span style={{ fontSize: "30px" }}>🛒</span>
        <span>Add to Cart</span>
        </button>
  
        
      </div>
    );
  }