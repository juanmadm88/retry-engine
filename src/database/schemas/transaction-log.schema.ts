import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Constants } from '../../constants';
export type TransactionLogDocument = HydratedDocument<TransactionLog>;

@Schema({
  collection: 'retry-engine-transaction-logs',
  timestamps: true
})
export class TransactionLog {
  @Prop({
    type: String,
    index: true
  })
  trs_unique_id: string;

  @Prop({ type: String, enum: Constants.statusEnum })
  status: string;

  @Prop({ type: String, index: true })
  type_call: string;

  @Prop({ type: String, index: true })
  trs_type: string;

  @Prop({ type: Date, index: true })
  trs_datetime: Date;

  @Prop({ type: String })
  payment_method: string;

  @Prop({ type: Number, index: true })
  trs_amount_total: number;

  @Prop({ type: String, index: true })
  acquirer: string;

  @Prop({ type: String, index: true })
  acquirer_unique_id: string;

  @Prop({ type: Boolean })
  to_be_reprocessed: boolean;

  @Prop({ type: Number })
  retries: number;

  @Prop({ type: Date })
  next_execution: Date;

  @Prop({ type: String })
  response_code: string;

  @Prop({ type: String, index: true })
  authorization_code: string;

  @Prop({ type: Object })
  data: any;

  @Prop({ type: Object })
  data_error: any;

  @Prop({ type: String, index: true })
  custom_tracking_id: string;

  @Prop({ type: String, index: true })
  trace_id: string;
}

export const TransactionLogSchema =
  SchemaFactory.createForClass(TransactionLog);
