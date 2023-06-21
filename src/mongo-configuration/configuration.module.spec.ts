import { ConfigurationModule } from './configuration.module';

describe('ConfigurationModule', () => {
  it('expect successfully created module', async () => {
    const module = new ConfigurationModule();
    expect(module).toBeDefined();
  });
});
