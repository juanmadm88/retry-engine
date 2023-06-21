import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationDTO } from './dtos';
import { CheckCountryMiddleware } from './middlewares/check.country.middleware';
import { Configuration } from './common';
import { ConfigurationMapper } from './mapper/configuration.mapper';

@UseInterceptors(CheckCountryMiddleware)
@Controller()
export class ConfigurationController {
  constructor(private readonly service: ConfigurationService) {}

  @Post('/configuration')
  async create(@Body() dto: ConfigurationDTO): Promise<any> {
    await this.service.create(dto);
  }

  @Patch('/configuration/:id')
  async update(@Body() body: any, @Param('id') id: string): Promise<any> {
    const updateObject: Configuration = ConfigurationMapper.transform(body);
    await this.service.update({
      id,
      updateObject
    });
  }

  @Get('/configuration')
  async get(@Query() query: any): Promise<ConfigurationDTO[]> {
    const response: Array<ConfigurationDTO> = await this.service.get(query);
    return response;
  }
}
