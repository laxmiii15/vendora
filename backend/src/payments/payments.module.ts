import { Module } from '@nestjs/common';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsResolver],
})
export class PaymentsModule {}
