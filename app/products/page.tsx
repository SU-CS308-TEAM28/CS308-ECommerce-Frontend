import ProductCard from '../../components/ProductCard';

const PRODUCTS = [
  {
    id: '1',
    name: 'Apple iPad Air (5th Gen) 64GB',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    category: 'Tablets',
    subcategories: ['iOS', 'Education'],
    description: 'M1 chip, 10.9" Liquid Retina display, Wi-Fi connectivity.',
    ratings: { count: 204, value: 4.8 },
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max 256GB',
    price: 54999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    category: 'Phones',
    subcategories: ['Smartphones', 'iOS'],
    description: 'Titanium design, A17 Pro chip, 48MP camera, 5x optical zoom.',
    ratings: { count: 450, value: 4.8 },
  },
  {
    id: '3',
    name: 'Dell XPS 15 9530',
    price: 89999,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    category: 'Computers',
    subcategories: ['Laptops', 'Design'],
    description: 'Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070 graphics.',
    ratings: { count: 89, value: 4.7 },
  },
  {
    id: '4',
    name: 'Samsung 65" Neo QLED 4K TV',
    price: 34999,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
    category: 'TVs',
    subcategories: ['4K', 'Smart TV'],
    description: 'Crisp 4K image with vibrant colors and immersive sound.',
    ratings: { count: 91, value: 4.6 },
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5 Headphones',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    category: 'Accessories',
    subcategories: ['Audio', 'Wireless'],
    description: 'Premium noise-cancelling headphones with long battery life.',
    ratings: { count: 176, value: 4.9 },
  },
  {
    id: '6',
    name: 'Apple Watch Series 9',
    price: 15499,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    category: 'Smart Devices',
    subcategories: ['Wearables', 'iOS'],
    description: 'Smart fitness tracking, sleek design, smooth iPhone integration.',
    ratings: { count: 132, value: 4.7 },
  },
  {
    id: '7',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 49999,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    category: 'Phones',
    subcategories: ['Smartphones', 'Android'],
    description: 'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.',
    ratings: { count: 311, value: 4.7 },
  },
  {
    id: '8',
    name: 'MacBook Pro 14" M3 Pro',
    price: 74999,
    image: 'https://images.unsplash.com/photo-1611186871525-9e8d9ce1d80c?w=800',
    category: 'Computers',
    subcategories: ['Laptops', 'macOS'],
    description: 'M3 Pro chip, 18GB RAM, stunning Liquid Retina XDR display.',
    ratings: { count: 203, value: 4.9 },
  },
  {
    id: '9',
    name: 'Samsung Galaxy Tab S9',
    price: 22999,
    image: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800',
    category: 'Tablets',
    subcategories: ['Android', 'AMOLED'],
    description: 'Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, IP68.',
    ratings: { count: 148, value: 4.6 },
  },
];

export default function ProductsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>
        All Products
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {PRODUCTS.map((product) => (
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
    </div>
  );
}
