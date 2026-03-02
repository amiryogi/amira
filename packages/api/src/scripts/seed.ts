/**
 * Amira eCommerce — Database Seeder
 *
 * Run from repo root:
 *   pnpm seed
 *
 * Or from packages/api:
 *   pnpm seed
 *
 * Seeds: 1 admin, 2 users, 6 categories, 20 products,
 *        4 addresses, 4 orders, 6 reviews
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@amira/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, '../../.env.development'),
});

import { User } from '../modules/user/user.model.js';
import { Category } from '../modules/category/category.model.js';
import { Product } from '../modules/product/product.model.js';
import { Address } from '../modules/address/address.model.js';
import { Order } from '../modules/order/order.model.js';
import { Review } from '../modules/review/review.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/amira';

// ─── Seed Data ──────────────────────────────────

const categories = [
  { name: 'Pashmina Shawls', slug: 'pashmina-shawls', description: 'Finest cashmere pashmina handwoven in Nepal', isActive: true },
  { name: 'Woolen Sweaters', slug: 'woolen-sweaters', description: 'Hand-knitted sweaters from Himalayan wool', isActive: true },
  { name: 'Felt Products', slug: 'felt-products', description: 'Handcrafted felt bags, hats, and accessories', isActive: true },
  { name: 'Dhaka Fabric', slug: 'dhaka-fabric', description: 'Traditional Nepali Dhaka woven textiles', isActive: true },
  { name: 'Woolen Caps & Accessories', slug: 'woolen-caps-accessories', description: 'Topi, gloves, mufflers, and scarves', isActive: true },
  { name: 'Home Textiles', slug: 'home-textiles', description: 'Blankets, rugs, and cushion covers', isActive: true },
];

const makeProducts = (categoryMap: Record<string, mongoose.Types.ObjectId>) => [
  // ── Pashmina Shawls ──
  {
    name: 'Classic Pashmina Shawl', slug: 'classic-pashmina-shawl',
    description: 'Luxurious 100% cashmere pashmina shawl handwoven by artisans in Kathmandu Valley. Lightweight yet warm, perfect for all seasons.',
    price: 4500, stock: 30, categoryId: categoryMap['pashmina-shawls'],
    isFeatured: true, images: [], isActive: true,
    variants: [
      { color: 'Ivory', stock: 10 },
      { color: 'Charcoal', stock: 10 },
      { color: 'Burgundy', stock: 10 },
    ],
  },
  {
    name: 'Embroidered Pashmina Wrap', slug: 'embroidered-pashmina-wrap',
    description: 'Hand-embroidered pashmina with traditional Nepali motifs. A statement piece for any outfit.',
    price: 6500, discountPrice: 5800, stock: 15, categoryId: categoryMap['pashmina-shawls'],
    isFeatured: true, images: [], isActive: true,
    variants: [
      { color: 'Maroon', stock: 8 },
      { color: 'Teal', stock: 7 },
    ],
  },
  {
    name: 'Pashmina Stole - Ombre', slug: 'pashmina-stole-ombre',
    description: 'Elegant gradient-dyed pashmina stole in earthy tones.',
    price: 3200, stock: 25, categoryId: categoryMap['pashmina-shawls'],
    images: [], isActive: true,
  },

  // ── Woolen Sweaters ──
  {
    name: 'Himalayan Cable Knit Sweater', slug: 'himalayan-cable-knit-sweater',
    description: 'Chunky cable-knit sweater made from Himalayan highland sheep wool. Cozy for cold Kathmandu winters.',
    price: 3800, stock: 20, categoryId: categoryMap['woolen-sweaters'],
    isFeatured: true, images: [], isActive: true,
    variants: [
      { size: 'S', color: 'Cream', stock: 5 },
      { size: 'M', color: 'Cream', stock: 7 },
      { size: 'L', color: 'Cream', stock: 5 },
      { size: 'M', color: 'Grey', stock: 3 },
    ],
  },
  {
    name: 'Yak Wool Cardigan', slug: 'yak-wool-cardigan',
    description: 'Soft yak wool cardigan with wooden buttons. Sustainably sourced from Mustang district.',
    price: 5200, discountPrice: 4700, stock: 10, categoryId: categoryMap['woolen-sweaters'],
    isFeatured: true, images: [], isActive: true,
    variants: [
      { size: 'M', color: 'Brown', stock: 4 },
      { size: 'L', color: 'Brown', stock: 3 },
      { size: 'XL', color: 'Brown', stock: 3 },
    ],
  },
  {
    name: 'Kids Woolen Pullover', slug: 'kids-woolen-pullover',
    description: 'Warm and playful kids pullover with Nepal-inspired patterns.',
    price: 1800, stock: 35, categoryId: categoryMap['woolen-sweaters'],
    images: [], isActive: true,
    variants: [
      { size: 'XS', stock: 15 },
      { size: 'S', stock: 20 },
    ],
  },

  // ── Felt Products ──
  {
    name: 'Felt Laptop Sleeve', slug: 'felt-laptop-sleeve',
    description: 'Eco-friendly handmade felt laptop sleeve. Fits 13-15 inch laptops. Made in Bhaktapur.',
    price: 1200, stock: 50, categoryId: categoryMap['felt-products'],
    images: [], isActive: true,
    variants: [
      { size: '13 inch', stock: 25 },
      { size: '15 inch', stock: 25 },
    ],
  },
  {
    name: 'Felt Shoulder Bag', slug: 'felt-shoulder-bag',
    description: 'Colorful handmade felt shoulder bag with floral design. Perfect everyday bag.',
    price: 1800, discountPrice: 1500, stock: 30, categoryId: categoryMap['felt-products'],
    isFeatured: true, images: [], isActive: true,
  },
  {
    name: 'Felt Coasters Set (6)', slug: 'felt-coasters-set',
    description: 'Set of 6 rainbow felt coasters. Fair-trade and handmade in Nepal.',
    price: 600, stock: 100, categoryId: categoryMap['felt-products'],
    images: [], isActive: true,
  },

  // ── Dhaka Fabric ──
  {
    name: 'Dhaka Topi – Classic', slug: 'dhaka-topi-classic',
    description: 'Traditional Nepali Dhaka topi. Available in multiple patterns. Handwoven in Palpa district.',
    price: 450, stock: 80, categoryId: categoryMap['dhaka-fabric'],
    isFeatured: true, images: [], isActive: true,
    variants: [
      { color: 'Red Pattern', stock: 30 },
      { color: 'Blue Pattern', stock: 25 },
      { color: 'Green Pattern', stock: 25 },
    ],
  },
  {
    name: 'Dhaka Fabric – Per Meter', slug: 'dhaka-fabric-per-meter',
    description: 'Authentic hand-loom Dhaka fabric sold per meter. Perfect for custom tailoring.',
    price: 850, stock: 40, categoryId: categoryMap['dhaka-fabric'],
    images: [], isActive: true,
  },
  {
    name: 'Dhaka Clutch Purse', slug: 'dhaka-clutch-purse',
    description: 'Modern clutch purse made from traditional Dhaka fabric with brass closure.',
    price: 1100, discountPrice: 950, stock: 25, categoryId: categoryMap['dhaka-fabric'],
    images: [], isActive: true,
  },

  // ── Woolen Caps & Accessories ──
  {
    name: 'Sherpa Ear Flap Hat', slug: 'sherpa-ear-flap-hat',
    description: 'Warm wool-lined hat with ear flaps and fleece inner. Inspired by mountain Sherpa wear.',
    price: 950, stock: 60, categoryId: categoryMap['woolen-caps-accessories'],
    images: [], isActive: true,
    variants: [
      { size: 'M', stock: 30 },
      { size: 'L', stock: 30 },
    ],
  },
  {
    name: 'Handknit Wool Gloves', slug: 'handknit-wool-gloves',
    description: 'Fleece-lined hand-knitted gloves in traditional Nepali patterns.',
    price: 650, stock: 45, categoryId: categoryMap['woolen-caps-accessories'],
    images: [], isActive: true,
    variants: [
      { size: 'S', color: 'Multicolor', stock: 15 },
      { size: 'M', color: 'Multicolor', stock: 15 },
      { size: 'L', color: 'Multicolor', stock: 15 },
    ],
  },
  {
    name: 'Cashmere Muffler', slug: 'cashmere-muffler',
    description: 'Ultra-soft cashmere muffler. Lightweight, warm, and elegant.',
    price: 2800, discountPrice: 2400, stock: 20, categoryId: categoryMap['woolen-caps-accessories'],
    isFeatured: true, images: [], isActive: true,
  },
  {
    name: 'Wool Socks – Thick Knit', slug: 'wool-socks-thick-knit',
    description: 'Thick-knit wool socks. Perfect for trekking or cold tile floors.',
    price: 350, stock: 100, categoryId: categoryMap['woolen-caps-accessories'],
    images: [], isActive: true,
    variants: [
      { size: 'Free Size', stock: 100 },
    ],
  },

  // ── Home Textiles ──
  {
    name: 'Himalayan Wool Blanket', slug: 'himalayan-wool-blanket',
    description: 'Heavy 100% highland wool blanket. Double-bed size. Woven in Ilam.',
    price: 5500, stock: 12, categoryId: categoryMap['home-textiles'],
    isFeatured: true, images: [], isActive: true,
  },
  {
    name: 'Handwoven Rug – 3x5ft', slug: 'handwoven-rug-3x5',
    description: 'Hand-knotted Tibetan wool rug with mandala pattern. 3x5 feet.',
    price: 8000, discountPrice: 7200, stock: 8, categoryId: categoryMap['home-textiles'],
    images: [], isActive: true,
  },
  {
    name: 'Wool Cushion Cover Set', slug: 'wool-cushion-cover-set',
    description: 'Set of 2 embroidered wool cushion covers (18x18 inch). Earth tones.',
    price: 1400, stock: 30, categoryId: categoryMap['home-textiles'],
    images: [], isActive: true,
  },
  {
    name: 'Felted Wool Table Runner', slug: 'felted-wool-table-runner',
    description: 'Colorful felted wool table runner handmade in Patan.',
    price: 1600, stock: 20, categoryId: categoryMap['home-textiles'],
    images: [], isActive: true,
  },
];

// ─── Seed Script ────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to', MONGO_URI);

  // ── Clear existing data ──
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Address.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // ── Users ──
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await User.create({
    name: 'Amira Admin',
    email: 'admin@amira.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    isVerified: true,
    phone: '9841000000',
  });

  const ram = await User.create({
    name: 'Ram Bahadur Thapa',
    email: 'ram@example.com',
    password: userPassword,
    role: UserRole.USER,
    isVerified: true,
    phone: '9841234567',
  });

  const sita = await User.create({
    name: 'Sita Devi Sharma',
    email: 'sita@example.com',
    password: userPassword,
    role: UserRole.USER,
    isVerified: true,
    phone: '9842345678',
  });

  console.log(`   ✅ Admin: admin@amira.com / Admin@123`);
  console.log(`   ✅ User:  ram@example.com / User@123`);
  console.log(`   ✅ User:  sita@example.com / User@123`);

  // ── Categories ──
  console.log('📁 Creating categories...');
  const createdCategories = await Category.insertMany(categories);
  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of createdCategories) {
    categoryMap[cat.slug] = cat._id as mongoose.Types.ObjectId;
  }
  console.log(`   ✅ ${createdCategories.length} categories created`);

  // ── Products ──
  console.log('📦 Creating products...');
  const products = makeProducts(categoryMap);
  const createdProducts = await Product.insertMany(products);
  console.log(`   ✅ ${createdProducts.length} products created`);

  // build a quick lookup by slug
  const productMap: Record<string, (typeof createdProducts)[0]> = {};
  for (const p of createdProducts) {
    productMap[p.slug] = p;
  }

  // ── Addresses ──
  console.log('🏠 Creating addresses...');
  const addresses = [
    {
      userId: ram._id,
      label: 'Home',
      fullName: 'Ram Bahadur Thapa',
      phone: '9841234567',
      street: 'Boudha Stupa Road, Ward 6',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      postalCode: '44600',
      isDefault: true,
    },
    {
      userId: ram._id,
      label: 'Office',
      fullName: 'Ram Bahadur Thapa',
      phone: '9841234567',
      street: 'New Baneshwor, Everest Bank Building',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati',
      postalCode: '44600',
      isDefault: false,
    },
    {
      userId: sita._id,
      label: 'Home',
      fullName: 'Sita Devi Sharma',
      phone: '9842345678',
      street: 'Lakeside Marg, Ward 17',
      city: 'Pokhara',
      district: 'Kaski',
      province: 'Gandaki',
      postalCode: '33700',
      isDefault: true,
    },
    {
      userId: sita._id,
      label: 'Parents Home',
      fullName: 'Sita Devi Sharma',
      phone: '9842345678',
      street: 'Dharan Road, Ward 4',
      city: 'Dharan',
      district: 'Sunsari',
      province: 'Koshi',
      postalCode: '56700',
      isDefault: false,
    },
  ];
  const createdAddresses = await Address.insertMany(addresses);
  console.log(`   ✅ ${createdAddresses.length} addresses created`);

  // ── Orders ──
  console.log('🛒 Creating orders...');
  const orders = [
    // Ram — COD order, delivered
    {
      userId: ram._id,
      products: [
        {
          productId: productMap['classic-pashmina-shawl']._id,
          name: 'Classic Pashmina Shawl',
          price: 4500,
          quantity: 1,
        },
        {
          productId: productMap['felt-coasters-set']._id,
          name: 'Felt Coasters Set (6)',
          price: 600,
          quantity: 2,
        },
      ],
      totalAmount: 5700,
      deliveryAddress: {
        label: 'Home',
        fullName: 'Ram Bahadur Thapa',
        phone: '9841234567',
        street: 'Boudha Stupa Road, Ward 6',
        city: 'Kathmandu',
        district: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
      },
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.DELIVERED,
    },
    // Ram — eSewa order, paid & shipped
    {
      userId: ram._id,
      products: [
        {
          productId: productMap['yak-wool-cardigan']._id,
          name: 'Yak Wool Cardigan',
          price: 4700,
          quantity: 1,
        },
      ],
      totalAmount: 4700,
      deliveryAddress: {
        label: 'Office',
        fullName: 'Ram Bahadur Thapa',
        phone: '9841234567',
        street: 'New Baneshwor, Everest Bank Building',
        city: 'Kathmandu',
        district: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
      },
      paymentMethod: PaymentMethod.ESEWA,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.SHIPPED,
      transactionId: 'ESW-20260215-0001',
    },
    // Sita — COD order, confirmed
    {
      userId: sita._id,
      products: [
        {
          productId: productMap['dhaka-topi-classic']._id,
          name: 'Dhaka Topi – Classic',
          price: 450,
          quantity: 3,
        },
        {
          productId: productMap['cashmere-muffler']._id,
          name: 'Cashmere Muffler',
          price: 2400,
          quantity: 1,
        },
      ],
      totalAmount: 3750,
      deliveryAddress: {
        label: 'Home',
        fullName: 'Sita Devi Sharma',
        phone: '9842345678',
        street: 'Lakeside Marg, Ward 17',
        city: 'Pokhara',
        district: 'Kaski',
        province: 'Gandaki',
        postalCode: '33700',
      },
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.CONFIRMED,
    },
    // Sita — eSewa order, pending
    {
      userId: sita._id,
      products: [
        {
          productId: productMap['himalayan-wool-blanket']._id,
          name: 'Himalayan Wool Blanket',
          price: 5500,
          quantity: 1,
        },
        {
          productId: productMap['wool-cushion-cover-set']._id,
          name: 'Wool Cushion Cover Set',
          price: 1400,
          quantity: 2,
        },
      ],
      totalAmount: 8300,
      deliveryAddress: {
        label: 'Parents Home',
        fullName: 'Sita Devi Sharma',
        phone: '9842345678',
        street: 'Dharan Road, Ward 4',
        city: 'Dharan',
        district: 'Sunsari',
        province: 'Koshi',
        postalCode: '56700',
      },
      paymentMethod: PaymentMethod.ESEWA,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.PENDING,
      transactionId: 'ESW-20260228-0002',
    },
  ];
  const createdOrders = await Order.insertMany(orders);
  console.log(`   ✅ ${createdOrders.length} orders created`);

  // ── Reviews ──
  console.log('⭐ Creating reviews...');
  const reviews = [
    {
      productId: productMap['classic-pashmina-shawl']._id,
      userId: ram._id,
      rating: 5,
      comment: 'Absolutely beautiful shawl! The quality is outstanding and it keeps me warm during winter evenings.',
      isApproved: true,
    },
    {
      productId: productMap['felt-coasters-set']._id,
      userId: ram._id,
      rating: 4,
      comment: 'Great quality coasters. Vibrant colors and they protect surfaces well.',
      isApproved: true,
    },
    {
      productId: productMap['yak-wool-cardigan']._id,
      userId: ram._id,
      rating: 5,
      comment: 'Worth every rupee! The yak wool is incredibly soft and the wooden buttons are a nice touch.',
      isApproved: true,
    },
    {
      productId: productMap['dhaka-topi-classic']._id,
      userId: sita._id,
      rating: 5,
      comment: 'Authentic Dhaka topi with excellent craftsmanship. Bought as gifts and everyone loved them.',
      isApproved: true,
    },
    {
      productId: productMap['cashmere-muffler']._id,
      userId: sita._id,
      rating: 4,
      comment: 'Very soft and lightweight. Perfect for spring evenings in Pokhara.',
      isApproved: true,
    },
    {
      productId: productMap['classic-pashmina-shawl']._id,
      userId: sita._id,
      rating: 4,
      comment: 'Lovely shawl with great drape. Slightly thinner than expected but still very elegant.',
      isApproved: false,
    },
  ];
  const createdReviews = await Review.insertMany(reviews);
  console.log(`   ✅ ${createdReviews.length} reviews created`);

  // ── Update product rating aggregates for reviewed products ──
  console.log('📊 Updating product rating aggregates...');
  const reviewedProductIds = [...new Set(reviews.map((r) => String(r.productId)))];
  for (const pid of reviewedProductIds) {
    const agg = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(pid), isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length) {
      await Product.findByIdAndUpdate(pid, {
        averageRating: Math.round(agg[0].avg * 10) / 10,
        totalReviews: agg[0].count,
      });
    }
  }
  console.log('   ✅ Product rating aggregates updated');

  // ── Summary ──
  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────');
  console.log(`   Users:      3 (1 admin, 2 users)`);
  console.log(`   Categories: ${createdCategories.length}`);
  console.log(`   Products:   ${createdProducts.length}`);
  console.log(`   Addresses:  ${createdAddresses.length}`);
  console.log(`   Orders:     ${createdOrders.length}`);
  console.log(`   Reviews:    ${createdReviews.length}`);
  console.log('─────────────────────────────────────');
  console.log('\n🔐 Login credentials:');
  console.log('   Admin:  admin@amira.com  / Admin@123');
  console.log('   User:   ram@example.com  / User@123');
  console.log('   User:   sita@example.com / User@123');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
