import { Module } from '@nestjs/common';
import { ProxyService } from '../utils/proxy.service';

@Module({
  providers: [ProxyService]
})
export class TbkMallModule {}
