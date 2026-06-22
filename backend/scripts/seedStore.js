require('dotenv').config();
const prisma = require('../utils/prisma');

async function main() {
  console.log('Seeding dummy categories and products...');

  // Create Categories
  const categories = [
    { name: 'Mobiles', image: '/assets/images/cat_mobile_1782101161890.png' },
    { name: 'Fashion', image: '/assets/images/cat_fashion_1782101172130.png' },
    { name: 'Electronics', image: '/assets/images/cat_electronics_1782101183555.png' },
    { name: 'Home Appliances', image: '/assets/images/cat_home_1782101191829.png' }
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: { image: cat.image },
      create: { name: cat.name, description: `Explore top ${cat.name}`, image: cat.image }
    });
    categoryMap[cat.name] = createdCat.id;
  }

  // Ensure warehouse exists
  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: 'Main Hub', location: 'Central Warehouse' }
    });
  }

  // Create Products
  const products = [
    {
      name: 'X-Pro Premium Smartphone 5G',
      sku: 'MOB-XPRO-001',
      description: 'The latest 5G smartphone with an ultra-clear AMOLED display, pro-grade camera system, and all-day battery life.',
      price: 64999.00,
      tax: 18.00,
      imageUrl: '/assets/images/prod_smartphone_1782101210395.png',
      categoryId: categoryMap['Mobiles']
    },
    {
      name: 'UltraBook Thin & Light 14"',
      sku: 'ELEC-LAP-002',
      description: 'A powerful, ultra-thin laptop for professionals and creatives. Features a fast processor, 16GB RAM, and 512GB SSD.',
      price: 85000.00,
      tax: 18.00,
      imageUrl: '/assets/images/prod_laptop_1782101222918.png',
      categoryId: categoryMap['Electronics']
    },
    {
      name: 'Urban Glide Running Sneakers',
      sku: 'FASH-SNK-003',
      description: 'Comfortable, breathable athletic sneakers perfect for running or casual street wear. Available in vibrant colors.',
      price: 3499.00,
      tax: 12.00,
      imageUrl: '/assets/images/prod_sneakers_1782101235859.png',
      categoryId: categoryMap['Fashion']
    },
    {
      name: 'Elegance Classic Smartwatch',
      sku: 'ELEC-WTCH-004',
      description: 'A premium smartwatch that blends classic analog design with modern fitness and notification tracking.',
      price: 12999.00,
      tax: 18.00,
      imageUrl: '/assets/images/prod_watch_1782101247822.png',
      categoryId: categoryMap['Electronics']
    }
  ];

  for (const prod of products) {
    const createdProd = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        price: prod.price,
        imageUrl: prod.imageUrl,
        categoryId: prod.categoryId
      },
      create: {
        name: prod.name,
        sku: prod.sku,
        description: prod.description,
        price: prod.price,
        tax: prod.tax,
        imageUrl: prod.imageUrl,
        categoryId: prod.categoryId,
        status: 'active'
      }
    });

    // Add inventory
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: createdProd.id,
          warehouseId: warehouse.id
        }
      },
      update: { quantity: 100 },
      create: {
        productId: createdProd.id,
        warehouseId: warehouse.id,
        quantity: 100,
        purchasePrice: prod.price * 0.7,
        minStockThreshold: 10
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
