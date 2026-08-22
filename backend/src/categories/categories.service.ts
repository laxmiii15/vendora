import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput, UpdateCategoryInput } from './dto/create-category.input';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async getCategories(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany()
        return categories
    }

    async createCategory(createCategoryInput: CreateCategoryInput, user: User) {
        const newCategory = await this.prisma.category.create({
            data: {
                name: createCategoryInput.name,
                slug: createCategoryInput.slug,


            }
        })
        return newCategory
    }

    async updateCategory(updateCategoryInput: UpdateCategoryInput, user: User, id: string) {
        const category = await this.prisma.category.findUnique({
            where: {
                id,
            }

        });
        if (!category) {
            throw new NotFoundException("category not found")
        }

        return this.prisma.category.update({
            where: {
                id,
            },
            data: updateCategoryInput,
        });


    }

    async deleteCategory( user: User, id: string) {
        const category = await this.prisma.category.findUnique({
            where: {
                id,
            }
        });
        
        if(!category) {
            throw new NotFoundException("Category not found")
        }
        return this.prisma.category.delete({
            where: {
                id,
            }
        });
    }


}
