import { Module } from '@nestjs/common';
import { ProxyService } from '../utils/proxy.service';
import { TbkMallService } from './tbk-mall.service';

@Module({
  providers: [ProxyService, TbkMallService],
  exports: [TbkMallService, ProxyService]
})
export class TbkMallModule {}
