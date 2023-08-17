import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { UpdateConfigurationDTO } from '../dtos/update-configuration.dto';
import { ConfigurationMapper } from './configuration.mapper';

describe('ConfigurationMapper', () => {
  it('expect Configuration to be created ', () => {
    const data: any = {
      country: 'pe',
      enabled: false,
      time: {
        type: 'nonserie',
        data: { '1': '10' }
      },
      acquirer: 'interop'
    };
    const dto: UpdateConfigurationDTO = plainToInstance(
      UpdateConfigurationDTO,
      data
    );
    const result: any = ConfigurationMapper.transform(dto);
    expect(Object.keys(result).length > 0).toBeTruthy();
  });
});
