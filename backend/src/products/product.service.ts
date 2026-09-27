import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(search?: string): Promise<Product[]> {
    const trimmed = search?.trim();
    const products = await this.prisma.product.findMany({
      where: trimmed
        ? {
            OR: [
              { name: { contains: trimmed, mode: 'insensitive' } },
              { description: { contains: trimmed, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { category: true },
    });
    return products;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
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

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
