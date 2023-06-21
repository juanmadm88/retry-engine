import { Controller } from '@nestjs/common';
import { CreateTransactionService } from './create-transaction.service';
import { BaseController } from '../base/base.controller';
@Controller()
export class CreateTransactionController extends BaseController {
  constructor(protected readonly service: CreateTransactionService) {
    super(service);
  }
}
