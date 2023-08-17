import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { RetryPolicyService } from './retry-policy.service';
import { ConfigurationDTO } from './dtos';
import { CheckCountryInterceptor } from './interceptor/check.country.interceptor';
import { UpdateConfigurationDTO } from './dtos/update-configuration.dto';
import { UpdateConfiguration, Response } from './common';
import { ConfigurationMapper } from './mapper/configuration.mapper';
import { Constants } from '../constants';

@UseInterceptors(CheckCountryInterceptor)
@Controller()
export class RetryPolicyController {
  constructor(private readonly service: RetryPolicyService) {}

  @Post('/retry-policy')
  async create(@Body() dto: ConfigurationDTO): Promise<Response> {
    await this.service.create(dto);
    return {
      message: Constants.SUCCESSFULLY_CREATED_RULE_MESSAGE,
      statusCode: HttpStatus.OK
    };
  }

  @Patch('/retry-policy/:id')
  async update(
    @Body() body: UpdateConfigurationDTO,
    @Param('id') id: string
  ): Promise<Response> {
    const updateObject: UpdateConfiguration =
      ConfigurationMapper.transform(body);
    await this.service.update({
      id,
      updateObject
    });
    return {
      message: Constants.SUCCESSFULLY_UPDATED_RULE_MESSAGE,
      statusCode: HttpStatus.OK
    };
  }

  @Get('/retry-policy')
  async get(@Query() query: any): Promise<ConfigurationDTO[]> {
    const response: Array<ConfigurationDTO> = await this.service.get(query);
    return response;
  }
}
