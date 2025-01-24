const productsData = [
  // Men's Clothing
  ...Array(20).fill().map((_, index) => ({
    name: `Men's ${['Classic', 'Modern', 'Slim-fit', 'Regular', 'Casual'][index % 5]} ${['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Jacket'][index % 5]}`,
    description: `High-quality ${['cotton', 'denim', 'leather', 'polyester', 'wool'][index % 5]} material, perfect for ${['casual', 'formal', 'outdoor', 'sports', 'evening'][index % 5]} wear.`,
    price: Math.floor(Math.random() * (3999 - 499 + 1) + 499),
    originalPrice: function() { return this.price + Math.floor(Math.random() * 1000 + 500) },
    category: 'Men',
    subCategory: ['Tops', 'Bottoms', 'Outerwear'][index % 3],
    brand: ['Levi\'s', 'Nike', 'Adidas', 'Puma', 'H&M'][index % 5],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableColors: ['Black', 'Navy', 'Grey', 'White', 'Beige'].slice(0, Math.floor(Math.random() * 3) + 2),
    images: Array(4).fill().map((_, i) => `https://picsum.photos/seed/${index * 4 + i}/600/800`),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 200),
    inStock: true,
    tags: ['trending', 'new-arrival', 'best-seller'][index % 3],
  })),

  // Women's Clothing
  ...Array(20).fill().map((_, index) => ({
    name: `Women's ${['Elegant', 'Casual', 'Bohemian', 'Classic', 'Modern'][index % 5]} ${['Dress', 'Top', 'Jeans', 'Skirt', 'Blouse'][index % 5]}`,
    description: `Stylish ${['cotton', 'silk', 'denim', 'linen', 'chiffon'][index % 5]} material, perfect for ${['casual', 'formal', 'party', 'beach', 'office'][index % 5]} wear.`,
    price: Math.floor(Math.random() * (4999 - 699 + 1) + 699),
    originalPrice: function() { return this.price + Math.floor(Math.random() * 1000 + 500) },
    category: 'Women',
    subCategory: ['Dresses', 'Tops', 'Bottoms'][index % 3],
    brand: ['Zara', 'H&M', 'Forever 21', 'Mango', 'Uniqlo'][index % 5],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableColors: ['Black', 'Pink', 'Blue', 'Red', 'White'].slice(0, Math.floor(Math.random() * 3) + 2),
    images: Array(4).fill().map((_, i) => `https://picsum.photos/seed/${(index + 20) * 4 + i}/600/800`),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 200),
    inStock: true,
    tags: ['trending', 'new-arrival', 'best-seller'][index % 3],
  })),

  // Kids' Clothing
  ...Array(20).fill().map((_, index) => ({
    name: `Kids' ${['Cute', 'Playful', 'Comfortable', 'Adorable', 'Fun'][index % 5]} ${['T-Shirt', 'Pants', 'Dress', 'Shorts', 'Sweater'][index % 5]}`,
    description: `Comfortable ${['cotton', 'fleece', 'denim', 'jersey', 'wool'][index % 5]} material, perfect for ${['play', 'school', 'party', 'outdoor', 'casual'][index % 5]} wear.`,
    price: Math.floor(Math.random() * (2999 - 399 + 1) + 399),
    originalPrice: function() { return this.price + Math.floor(Math.random() * 500 + 200) },
    category: 'Kids',
    subCategory: ['Boys', 'Girls', 'Unisex'][index % 3],
    brand: ['Carter\'s', 'GAP Kids', 'H&M Kids', 'Zara Kids', 'Nike Kids'][index % 5],
    sizes: ['2T', '3T', '4T', '5T', '6T'],
    availableColors: ['Blue', 'Pink', 'Yellow', 'Green', 'Red'].slice(0, Math.floor(Math.random() * 3) + 2),
    images: Array(4).fill().map((_, i) => `https://picsum.photos/seed/${(index + 40) * 4 + i}/600/800`),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 100),
    inStock: true,
    tags: ['trending', 'new-arrival', 'best-seller'][index % 3],
  })),

  // Accessories
  ...Array(20).fill().map((_, index) => ({
    name: `${['Elegant', 'Classic', 'Modern', 'Trendy', 'Luxurious'][index % 5]} ${['Watch', 'Bag', 'Belt', 'Sunglasses', 'Wallet'][index % 5]}`,
    description: `Premium ${['leather', 'metal', 'fabric', 'synthetic', 'mixed'][index % 5]} material, perfect for ${['daily', 'formal', 'casual', 'travel', 'business'][index % 5]} use.`,
    price: Math.floor(Math.random() * (9999 - 999 + 1) + 999),
    originalPrice: function() { return this.price + Math.floor(Math.random() * 2000 + 1000) },
    category: 'Accessories',
    subCategory: ['Watches', 'Bags', 'Small Accessories'][index % 3],
    brand: ['Fossil', 'Ray-Ban', 'Michael Kors', 'Coach', 'Casio'][index % 5],
    sizes: ['One Size'],
    availableColors: ['Black', 'Brown', 'Gold', 'Silver', 'Rose Gold'].slice(0, Math.floor(Math.random() * 3) + 2),
    images: Array(4).fill().map((_, i) => `https://picsum.photos/seed/${(index + 60) * 4 + i}/600/800`),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 150),
    inStock: true,
    tags: ['trending', 'new-arrival', 'best-seller'][index % 3],
  })),

  // Footwear
  ...Array(20).fill().map((_, index) => ({
    name: `${['Comfortable', 'Stylish', 'Athletic', 'Casual', 'Formal'][index % 5]} ${['Sneakers', 'Boots', 'Sandals', 'Loafers', 'Running Shoes'][index % 5]}`,
    description: `High-quality ${['leather', 'canvas', 'mesh', 'suede', 'synthetic'][index % 5]} material, perfect for ${['sports', 'casual', 'formal', 'outdoor', 'daily'][index % 5]} wear.`,
    price: Math.floor(Math.random() * (7999 - 999 + 1) + 999),
    originalPrice: function() { return this.price + Math.floor(Math.random() * 1500 + 500) },
    category: 'Footwear',
    subCategory: ['Casual', 'Sports', 'Formal'][index % 3],
    brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Converse'][index % 5],
    sizes: ['7', '8', '9', '10', '11'],
    availableColors: ['Black', 'White', 'Grey', 'Blue', 'Red'].slice(0, Math.floor(Math.random() * 3) + 2),
    images: Array(4).fill().map((_, i) => `https://picsum.photos/seed/${(index + 80) * 4 + i}/600/800`),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 200),
    inStock: true,
    tags: ['trending', 'new-arrival', 'best-seller'][index % 3],
  })),
].map((product, index) => ({
  ...product,
  id: `PROD${String(index + 1).padStart(4, '0')}`,
  originalPrice: product.originalPrice(),
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Export the products array
export const products = productsData;
