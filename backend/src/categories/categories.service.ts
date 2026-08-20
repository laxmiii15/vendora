import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class CategoriesService {
constructor(private readonly prisma: PrismaService) {}

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

    
}
