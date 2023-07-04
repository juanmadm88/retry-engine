import { ConfigurationMapper } from './configuration.mapper';

describe('ConfigurationMapper', () => {
  it('expect Configuration to be created ', () => {
    const data: any = {
      country: 'pe',
      enabled: false,
      time: {
        '1': '10'
      },
      acquirer: 'sarasa'
    };
    const result: any = ConfigurationMapper.transform(data);
    expect(Object.keys(result).length > 0).toBeTruthy();
  });
});
