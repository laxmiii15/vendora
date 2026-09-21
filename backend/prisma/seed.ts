import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;
const SEED_SELLER_EMAIL = 'seed@vendora.test';
const SEED_SELLER_PASSWORD = 'seedpass123';

const CATEGORIES = [
  { name: 'Dresses', slug: 'dresses' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Tops', slug: 'tops' },
  { name: 'Skirts', slug: 'skirts' },
  { name: 'Outerwear', slug: 'outerwear' },
  { name: 'Activewear', slug: 'activewear' },
] as const;

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

// Every image below was downloaded and visually reviewed by hand before
// being assigned here — confirmed to show a woman wearing an item that
// actually matches the product name (the previous seed set assigned
// captions to photo IDs without checking their content, which produced
// several wrong-gender and wrong-garment mismatches).
const PRODUCTS = [
  {
    name: 'Floral Jacquard Dress',
    slug: 'floral-jacquard-dress',
    category: 'dresses',
    price: 82,
    size: 'S',
    stock: 14,
    status: 'ACTIVE',
    imageUrl: pexels(985635),
    description: 'A fit-and-flare dress in a bold floral jacquard.',
  },
  {
    name: 'Pink Ruffle Dress',
    slug: 'pink-ruffle-dress',
    category: 'dresses',
    price: 76,
    size: 'M',
    stock: 18,
    status: 'ACTIVE',
    imageUrl: pexels(2065195),
    description: 'An off-shoulder dress with a tiered ruffle neckline.',
  },
  {
    name: 'Classic Blue Jeans',
    slug: 'classic-blue-jeans',
    category: 'jeans',
    price: 55,
    size: 'M',
    stock: 40,
    status: 'ACTIVE',
    imageUrl: pexels(1082529),
    description: 'Everyday straight-leg jeans in classic mid-wash denim.',
  },
  {
    name: 'Striped Button-Up Shirt',
    slug: 'striped-button-up-shirt',
    category: 'tops',
    price: 48,
    size: 'S',
    stock: 22,
    status: 'ACTIVE',
    imageUrl: pexels(2065196),
    description: 'A relaxed black-and-white striped button-up.',
  },
  {
    name: 'Satin Cowl-Neck Top',
    slug: 'satin-cowl-neck-top',
    category: 'tops',
    price: 42,
    size: 'S',
    stock: 16,
    status: 'ACTIVE',
    imageUrl: pexels(1721555),
    description: 'A draped satin top with a soft cowl neckline.',
  },
  {
    name: 'Pleated Blue Skirt',
    slug: 'pleated-blue-skirt',
    category: 'skirts',
    price: 44,
    size: 'M',
    stock: 20,
    status: 'ACTIVE',
    imageUrl: pexels(1721559),
    description: 'A flowing pleated midi skirt in dusty blue.',
  },
  {
    name: 'Plaid Blazer Coat',
    slug: 'plaid-blazer-coat',
    category: 'outerwear',
    price: 95,
    size: 'M',
    stock: 12,
    status: 'ACTIVE',
    imageUrl: pexels(3978335),
    description: 'A tailored plaid blazer coat, worn open over layers.',
  },
  {
    name: 'Pink Wool Coat',
    slug: 'pink-wool-coat',
    category: 'outerwear',
    price: 118,
    size: 'M',
    stock: 0,
    status: 'OUT_OF_STOCK',
    imageUrl: pexels(2043590),
    description: 'A double-breasted wool coat in soft blush pink.',
  },
  {
    name: 'Herringbone Coat',
    slug: 'herringbone-coat',
    category: 'outerwear',
    price: 128,
    size: 'L',
    stock: 9,
    status: 'ACTIVE',
    imageUrl: pexels(1721560),
    description: 'An oversized herringbone coat, styled over a turtleneck.',
  },
  {
    name: 'Ribbed Tank Top',
    slug: 'ribbed-tank-top',
    category: 'activewear',
    price: 32,
    size: 'M',
    stock: 30,
    status: 'ACTIVE',
    imageUrl: pexels(4498292),
    description: 'A ribbed, high-neck tank built for training days.',
  },
] as const;

async function main() {
  console.log('Seeding: clearing existing order/product/category data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Seeding: ensuring seed seller account exists...');
  const hashedPassword = await bcrypt.hash(SEED_SELLER_PASSWORD, SALT_ROUNDS);
  const seller = await prisma.user.upsert({
    where: { email: SEED_SELLER_EMAIL },
    update: {},
    create: {
      email: SEED_SELLER_EMAIL,
      password: hashedPassword,
      firstName: 'Seed',
      lastName: 'Seller',
      role: 'ADMIN',
    },
  });

  console.log('Seeding: creating categories...');
  const categoriesBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const created = await prisma.category.create({ data: category });
    categoriesBySlug.set(created.slug, created.id);
  }

  console.log('Seeding: creating products...');
  for (const product of PRODUCTS) {
    const categoryId = categoriesBySlug.get(product.category);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${product.category}`);
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        size: product.size,
        imageUrl: product.imageUrl,
        sellerId: seller.id,
        categoryId,
      },
    });
  }

  console.log(
    `Seed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
