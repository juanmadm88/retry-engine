import { CreateTransactionModule } from './create-transaction.module';

describe('CreateTransactionModule', () => {
  it('expect successfully created module', async () => {
    const module = new CreateTransactionModule();
    expect(module).toBeDefined();
  });
});
