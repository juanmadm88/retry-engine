import { InitMongo } from './initializer';
import mongoose, { Mongoose } from 'mongoose';

describe('test class initializer', () => {
  beforeEach(() => {
    jest.mock('mongoose');
  });
  it('expect connect method to be called', async () => {
    const spy = jest
      .spyOn(InitMongo, 'connect')
      .mockImplementationOnce(() => Promise.resolve('OK'));
    await InitMongo.connect({});
    expect(spy).toBeCalled();
  });
  it('expect mongoose connect to be called', async () => {
    const mongooseConnectSpyOn = jest
      .spyOn<Mongoose, 'connect'>(mongoose, 'connect')
      .mockImplementationOnce(() => Promise.resolve(mongoose));
    await InitMongo.connect({});
    expect(mongooseConnectSpyOn).toBeCalled();
  });
  it('expect an Error', async () => {
    jest
      .spyOn<Mongoose, 'connect'>(mongoose, 'connect')
      .mockImplementationOnce(() => Promise.reject(mongoose));
    try {
      await InitMongo.connect({});
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
