import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { SellerResolver } from './seller.resolver';
import { SellerService } from './seller.service';

@Module({
  imports: [OrdersModule],
  providers: [SellerService, SellerResolver],
})
export class SellerModule {}
