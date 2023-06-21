import { TbkMallModule } from './tbk-mall.module';

describe('TbkMallModule', () => {
  it('expect module to be defined ', () => {
    const module = new TbkMallModule();
    expect(module).toBeDefined();
  });
});
