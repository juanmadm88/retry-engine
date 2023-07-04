import { RetryPolicyModule } from './retry-policy.module';

describe('ConfigurationModule', () => {
  it('expect successfully created module', async () => {
    const module = new RetryPolicyModule();
    expect(module).toBeDefined();
  });
});
