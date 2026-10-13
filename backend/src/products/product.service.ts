import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';
import { ProductsArgs } from './dto/products.args';
import { ProductPage } from './entities/product-page.entity';
import { Prisma } from 'src/generated/prisma/client';
import { User } from 'src/users/entities/user.entity';
import { ProductStatus, UserRole } from 'src/generated/prisma/enums';

// Statuses the public storefront may see. DRAFT and ARCHIVED are only
// reachable through the seller and admin queries.
const PUBLIC_STATUSES: ProductStatus[] = [
  ProductStatus.ACTIVE,
  ProductStatus.OUT_OF_STOCK,
];

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts({
    page,
    pageSize,
    search,
    categoryId,
  }: ProductsArgs): Promise<ProductPage> {
    const trimmed = search?.trim();
    const where: Prisma.ProductWhereInput = {
      status: { in: PUBLIC_STATUSES },
      ...(categoryId && { categoryId }),
      ...(trimmed && {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        // id breaks ties so products sharing a createdAt never repeat or
        // go missing between pages.
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getProductBySlug(slug: string): Promise<Product> {
    // Hidden products get the same "not found" as missing ones, so their
    // slugs can't be probed.
    const product = await this.prisma.product.findUnique({
      where: { slug, status: { in: PUBLIC_STATUSES } },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }
    return product;
  }

  async createProduct(createProductInput: CreateProductInput, user: User) {
    await this.ensureCategoryExists(createProductInput.categoryId);

    const newProduct = await this.prisma.product.create({
      data: {
        name: createProductInput.name,
        description: createProductInput.description,
        price: createProductInput.price,

        sellerId: user.id,
        categoryId: createProductInput.categoryId,
        slug: createProductInput.slug,
        status: createProductInput.status,
        stock: createProductInput.stock,
        size: createProductInput.size,
        imageUrl: createProductInput.imageUrl,
      },
      include: { category: true },
    });
    return newProduct;
  }

  async updateProduct(
    user: User,
    id: string,
    updateProductInput: UpdateProductInput,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('product  not found');
    }

    this.assertCanManage(product, user);

    if (updateProductInput.categoryId) {
      await this.ensureCategoryExists(updateProductInput.categoryId);
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductInput,
      include: { category: true },
    });
  }

  // Sellers may only manage their own listings; admins may manage any.
  private assertCanManage(product: { sellerId: string }, user: User) {
    const isAdmin =
      user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isAdmin && product.sellerId !== user.id) {
      throw new ForbiddenException('You can only manage your own products');
    }
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('category not found');
    }
  }

  async deleteProduct(user: User, id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    this.assertCanManage(product, user);

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
