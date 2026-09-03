import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products;
  }

  async createProduct(createProductInput: CreateProductInput, user: User) {
    const newProduct = await this.prisma.product.create({
      data: {
        name: createProductInput.name,
        description: createProductInput.description,
        price: createProductInput.price,

        sellerId: user.id,
        slug: createProductInput.slug,
        status: createProductInput.status,
        stock: createProductInput.stock,
      },
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

    return this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductInput,
    });
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
