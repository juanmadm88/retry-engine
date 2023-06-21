import {
  Configuration,
  ConfigurationSchema
} from '../schemas/configuration.schema';

describe('ConfigurationSchema', () => {
  it('expect to be defined', async () => {
    expect(Configuration).toBeDefined();
    expect(ConfigurationSchema).toBeDefined();
  });
});
