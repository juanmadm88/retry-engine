import mongoose from 'mongoose';

export class InitMongo {
  public static async connect(mongoConfig: any): Promise<any> {
    const { uri, ...options } = mongoConfig;
    try {
      await mongoose.connect(uri, options);
    } catch (error) {
      throw error;
    }
  }
}
