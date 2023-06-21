import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Constants } from '../../constants';
export type TransactionLogDocument = HydratedDocument<Configuration>;

@Schema({
  collection: 'retry-engine-configurations',
  timestamps: true
})
export class Configuration {
  @Prop({ type: String, enum: Constants.countryEnum, required: true })
  country: string;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @Prop({ type: Object, required: true })
  timeSerie: any;

  @Prop({
    type: String,
    required: true,
    enum: Object.keys(Constants.typesCall)
  })
  acquirer: any;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
