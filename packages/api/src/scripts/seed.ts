/**
 * Amira eCommerce — Database Seeder
 *
 * Run from repo root:
 *   pnpm seed
 *
 * Or from packages/api:
 *   pnpm seed
 *
 * Seeds: 1 admin, 2 users, 6 categories, 20 products
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, '../../.env.development'),
});

import { User } from '../modules/user/user.model.js';
import { Category } from '../modules/category/category.model.js';
import { Product } from '../modules/product/product.model.js';

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
  // Pashmina Shawls
  { name: 'Classic Pashmina Shawl', slug: 'classic-pashmina-shawl', description: 'Luxurious 100% cashmere pashmina shawl handwoven by artisans in Kathmandu Valley. Lightweight yet warm, perfect for all seasons.', price: 4500, stock: 30, categoryId: categoryMap['pashmina-shawls'], isFeatured: true, images: [], isActive: true },
  { name: 'Embroidered Pashmina Wrap', slug: 'embroidered-pashmina-wrap', description: 'Hand-embroidered pashmina with traditional Nepali motifs. A statement piece for any outfit.', price: 6500, stock: 15, categoryId: categoryMap['pashmina-shawls'], isFeatured: true, images: [], isActive: true },
  { name: 'Pashmina Stole - Ombre', slug: 'pashmina-stole-ombre', description: 'Elegant gradient-dyed pashmina stole in earthy tones.', price: 3200, stock: 25, categoryId: categoryMap['pashmina-shawls'], images: [], isActive: true },

  // Woolen Sweaters
  { name: 'Himalayan Cable Knit Sweater', slug: 'himalayan-cable-knit-sweater', description: 'Chunky cable-knit sweater made from Himalayan highland sheep wool. Cozy for cold Kathmandu winters.', price: 3800, stock: 20, categoryId: categoryMap['woolen-sweaters'], isFeatured: true, images: [], isActive: true },
  { name: 'Yak Wool Cardigan', slug: 'yak-wool-cardigan', description: 'Soft yak wool cardigan with wooden buttons. Sustainably sourced from Mustang district.', price: 5200, stock: 10, categoryId: categoryMap['woolen-sweaters'], isFeatured: true, images: [], isActive: true },
  { name: 'Kids Woolen Pullover', slug: 'kids-woolen-pullover', description: 'Warm and playful kids pullover with Nepal-inspired patterns.', price: 1800, stock: 35, categoryId: categoryMap['woolen-sweaters'], images: [], isActive: true },

  // Felt Products
  { name: 'Felt Laptop Sleeve', slug: 'felt-laptop-sleeve', description: 'Eco-friendly handmade felt laptop sleeve. Fits 13-15 inch laptops. Made in Bhaktapur.', price: 1200, stock: 50, categoryId: categoryMap['felt-products'], images: [], isActive: true },
  { name: 'Felt Shoulder Bag', slug: 'felt-shoulder-bag', description: 'Colorful handmade felt shoulder bag with floral design. Perfect everyday bag.', price: 1800, stock: 30, categoryId: categoryMap['felt-products'], isFeatured: true, images: [], isActive: true },
  { name: 'Felt Coasters Set (6)', slug: 'felt-coasters-set', description: 'Set of 6 rainbow felt coasters. Fair-trade and handmade in Nepal.', price: 600, stock: 100, categoryId: categoryMap['felt-products'], images: [], isActive: true },

  // Dhaka Fabric
  { name: 'Dhaka Topi – Classic', slug: 'dhaka-topi-classic', description: 'Traditional Nepali Dhaka topi. Available in multiple patterns. Handwoven in Palpa district.', price: 450, stock: 80, categoryId: categoryMap['dhaka-fabric'], isFeatured: true, images: [], isActive: true },
  { name: 'Dhaka Fabric – Per Meter', slug: 'dhaka-fabric-per-meter', description: 'Authentic hand-loom Dhaka fabric sold per meter. Perfect for custom tailoring.', price: 850, stock: 40, categoryId: categoryMap['dhaka-fabric'], images: [], isActive: true },
  { name: 'Dhaka Clutch Purse', slug: 'dhaka-clutch-purse', description: 'Modern clutch purse made from traditional Dhaka fabric with brass closure.', price: 1100, stock: 25, categoryId: categoryMap['dhaka-fabric'], images: [], isActive: true },

  // Woolen Caps & Accessories
  { name: 'Sherpa Ear Flap Hat', slug: 'sherpa-ear-flap-hat', description: 'Warm wool-lined hat with ear flaps and fleece inner. Inspired by mountain Sherpa wear.', price: 950, stock: 60, categoryId: categoryMap['woolen-caps-accessories'], images: [], isActive: true },
  { name: 'Handknit Wool Gloves', slug: 'handknit-wool-gloves', description: 'Fleece-lined hand-knitted gloves in traditional Nepali patterns.', price: 650, stock: 45, categoryId: categoryMap['woolen-caps-accessories'], images: [], isActive: true },
  { name: 'Cashmere Muffler', slug: 'cashmere-muffler', description: 'Ultra-soft cashmere muffler. Lightweight, warm, and elegant.', price: 2800, stock: 20, categoryId: categoryMap['woolen-caps-accessories'], isFeatured: true, images: [], isActive: true },
  { name: 'Wool Socks – Thick Knit', slug: 'wool-socks-thick-knit', description: 'Thick-knit wool socks. Perfect for trekking or cold tile floors.', price: 350, stock: 100, categoryId: categoryMap['woolen-caps-accessories'], images: [], isActive: true },

  // Home Textiles
  { name: 'Himalayan Wool Blanket', slug: 'himalayan-wool-blanket', description: 'Heavy 100% highland wool blanket. Double-bed size. Woven in Ilam.', price: 5500, stock: 12, categoryId: categoryMap['home-textiles'], isFeatured: true, images: [], isActive: true },
  { name: 'Handwoven Rug – 3x5ft', slug: 'handwoven-rug-3x5', description: 'Hand-knotted Tibetan wool rug with mandala pattern. 3x5 feet.', price: 8000, stock: 8, categoryId: categoryMap['home-textiles'], images: [], isActive: true },
  { name: 'Wool Cushion Cover Set', slug: 'wool-cushion-cover-set', description: 'Set of 2 embroidered wool cushion covers (18x18 inch). Earth tones.', price: 1400, stock: 30, categoryId: categoryMap['home-textiles'], images: [], isActive: true },
  { name: 'Felted Wool Table Runner', slug: 'felted-wool-table-runner', description: 'Colorful felted wool table runner handmade in Patan.', price: 1600, stock: 20, categoryId: categoryMap['home-textiles'], images: [], isActive: true },
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
  ]);

  // ── Users ──
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const adminUser = await User.create({
    name: 'Amira Admin',
    email: 'admin@amira.com',
    password: hashedPassword,
    role: 'ADMIN',
    isVerified: true,
    phone: '9841000000',
  });

  const user1 = await User.create({
    name: 'Ram Bahadur Thapa',
    email: 'ram@example.com',
    password: userPassword,
    role: 'USER',
    isVerified: true,
    phone: '9841234567',
  });

  const user2 = await User.create({
    name: 'Sita Devi Sharma',
    email: 'sita@example.com',
    password: userPassword,
    role: 'USER',
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

  // ── Summary ──
  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────');
  console.log(`   Users:      3 (1 admin, 2 users)`);
  console.log(`   Categories: ${createdCategories.length}`);
  console.log(`   Products:   ${createdProducts.length}`);
  console.log('─────────────────────────────────────');
  console.log('\n🔐 Login credentials:');
  console.log('   Admin:  admin@amira.com  / Admin@123');
  console.log('   User:   ram@example.com  / User@123');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
