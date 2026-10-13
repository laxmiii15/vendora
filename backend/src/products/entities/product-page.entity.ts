import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/paginated';
import { Product } from './product.entity';

@ObjectType()
export class ProductPage extends Paginated(Product) {}
